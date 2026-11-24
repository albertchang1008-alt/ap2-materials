/* Generic image + overlay renderer with focus-zoom & auto-box. Anatomy, geometry and masks belong to data. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const FOCUS_TIP_RADIUS_PX = 6;
  const DEFAULT_MAX_ZOOM = 2;
  const FOCUS_PAD_UNITS = 55;
  function el(tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  class FigureView {
    constructor(host, figure, onPick, onAmbiguous, opts = {}) {
      this.host = host;
      this.data = figure;
      this.originalLeaders = figure.leaderMode === "original";
      if (this.originalLeaders && figure.originalPlacement)
        this.originalLayout = new OriginalLeaderLayout(figure);
      this.onPick = onPick;
      this.onAmbiguous = onAmbiguous;
      this.maxZoom = Number(opts.maxZoom) || figure.maxZoom || DEFAULT_MAX_ZOOM;
      this.onViewChange = opts.onViewChange || null;
      this.zoom = false;
      this.ready = false;
      this.lastFocusRect = null;
      this.focusTarget = null;
      this.focusRafId = null;
      this.manualView = null;
      this.inspectMode = false;
      this.pointers = new Map();
      this.pinch = null;
      this.drag = null;
      this.suppressClick = false;
      host.innerHTML =
        '<svg role="group" aria-label="教學圖"></svg><div class="image-unavailable" hidden></div>';
      this.svg = host.querySelector("svg");
      this.error = host.querySelector(".image-unavailable");
      this.svg.setAttribute("aria-label", figure.alt);
      this.svg.style.aspectRatio = figure.viewBox[2] + "/" + figure.viewBox[3];
      this.probe = new Image();
      this.probe.onload = () => {
        this.ready = true;
        this.draw();
        this.onReady?.();
      };
      this.probe.onerror = () => {
        this.ready = false;
        this.draw();
        this.onReady?.();
      };
      this.probe.src = figure.src;
      this.svg.addEventListener("click", (e) => this.click(e));
      this.bindZoomGestures();
      this.svg.addEventListener("keydown", (e) => {
        const label = e.target.closest("[data-nav-label]");
        if (label && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (this.available()) this.onPick(label.dataset.navLabel);
          return;
        }
        if (this.state?.passiveNumbers) return;
        const id =
          e.target.dataset.directId ||
          e.target.closest("[data-number-id]")?.dataset.numberId;
        if (id && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (this.available()) this.onPick(id);
        }
      });
      this.observer = new ResizeObserver(() => {
        if (this.shouldUseFrame()) {
          this.applyFocus(false);
        }
        this.sizeText();
      });
      this.observer.observe(host);
    }
    placeOriginalNumbers(radius, badges, ratio) {
      const group = this.svg.querySelector("[data-original-extensions]");
      if (!group) return;
      group.replaceChildren();
      const markers = [...this.svg.querySelectorAll("[data-number-id]")];
      if (!markers.length || !this.available()) return;
      const nodes = this.state.nodes;
      const tips = nodes.flatMap(node => node.tips || []);
      const visible = this.visibleBox();
      const key = JSON.stringify([nodes.map(node => node.id), radius, visible, badges, tips]);
      if (this.lastOriginalLayout?.key !== key) {
        const positions = this.originalLayout?.place(nodes, radius, visible, badges, tips, 1.05 / ratio,
          this.state.nav34 ? 7 / ratio : 0);
        this.lastOriginalLayout = { key, positions };
      }
      const { positions } = this.lastOriginalLayout;
      for (const marker of markers) {
        const id = marker.dataset.numberId;
        const position = positions?.get(id);
        marker.dataset.originalPlacement = position?.mode || "unplaced";
        marker.style.display = position ? "" : "none";
        if (!position) continue;
        const [x, y] = position.center;
        const circle = marker.querySelector("circle");
        const text = marker.querySelector("text");
        for (const [name, value] of Object.entries({ cx: x, cy: y, r: radius }))
          circle.setAttribute(name, value);
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        if (position.line) {
          group.append(el("polyline", {
            "data-original-extension": id,
            points: position.line.map(point => point.join(",")).join(" "),
            fill: "none", stroke: "#111",
            "stroke-width": this.originalLayout.highlightWidth,
            "stroke-linejoin": "round",
          }));
        }
      }
    }
    drawOriginalFocus(group, nodes) {
      const layout = this.originalLayout;
      if (!layout) return;
      const drawn = new Set();
      for (const node of nodes) {
        for (const { index, points, overlay } of layout.pathsFor(node)) {
          if (drawn.has(index)) continue;
          drawn.add(index);
          if (overlay) this.drawOverlayLeader(group, points, layout.highlightWidth);
          group.append(el("polyline", {
            "data-original-heavy": index,
            ...(this.state.nav34 && this.data.retainedLeaderPaths[index].path === node.bracketPath
              ? { "data-original-bracket": node.id } : {}),
            points: points.map(point => point.join(",")).join(" "),
            fill: "none", stroke: "#111",
            "stroke-width": layout.highlightWidth,
            "stroke-linejoin": "round",
          }));
        }
        if (this.state.nav34 && node.bracketPath) continue;
        for (const [i, tip] of node.tips.entries()) {
          const [dx, dy] = layout.arrowDirection(node, tip);
          group.append(el("polygon", {
            "data-original-arrow": node.id, "data-arrow-tip-index": i,
            "data-direction": dx + " " + dy,
            fill: "#111",
          }));
        }
      }
    }
    drawOverlayLeader(group, points, width, withLine = false) {
      const attrs = {
        points: points.map(point => point.join(",")).join(" "),
        fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round",
      };
      group.append(el("polyline", { ...attrs, stroke: "#fff", "stroke-width": width + 3 }));
      if (withLine) group.append(el("polyline", { ...attrs, stroke: "#283b35", "stroke-width": width }));
    }
    sizeOriginalArrows(ratio) {
      for (const arrow of this.svg.querySelectorAll("[data-original-arrow]")) {
        const node = this.state.nodes.find(node => node.id === arrow.dataset.originalArrow);
        let [x, y] = node.tips[Number(arrow.dataset.arrowTipIndex)];
        const [dx, dy] = arrow.dataset.direction.split(" ").map(Number);
        if (this.state.nav34) {
          x -= dx * 7 / ratio;
          y -= dy * 7 / ratio;
        }
        const length = 4.45 / ratio, spread = 2.05 / ratio;
        const tail = [x - dx * length, y - dy * length];
        arrow.setAttribute("points",
          [[x, y], [tail[0] - dy * spread, tail[1] + dx * spread],
            [tail[0] + dy * spread, tail[1] - dx * spread]].map(point => point.join(",")).join(" "));
      }
    }
    placeOriginalBadges(ratio) {
      const visible = this.visibleBox();
      const matrix = this.svg.getScreenCTM();
      const inverse = matrix.inverse();
      const renderedRatio = Math.hypot(matrix.a, matrix.b);
      const tips = [...this.svg.querySelectorAll("[data-original-arrow]")].map(arrow => {
        const tip = arrow.points.getItem(0);
        return [tip.x, tip.y];
      });
      const extensions = this.svg.querySelector("[data-badge-extensions]");
      extensions?.replaceChildren();
      if (extensions) {
        for (const tip of this.svg.querySelectorAll(".focus-tip"))
          tips.push([Number(tip.getAttribute("cx")), Number(tip.getAttribute("cy"))]);
      }
      const boxes = [];
      for (const badge of this.svg.querySelectorAll(
        "[data-chinese-overlay], [data-question-badge], [data-multi-badge], [data-path-badge]",
      )) {
        badge.removeAttribute("transform");
        const rect = badge.querySelector("rect");
        const textElement = badge.querySelector("text");
        const node = this.state.nodes.find(n => n.id === badge.dataset.badgeNode ||
          n.id === badge.dataset.multiBadge || n.id === badge.dataset.pathBadge);
        const head = extensions && node ? this.originalLayout.headFor(node) : null;
        if (head) {
          textElement.setAttribute("x", head[0]);
          textElement.setAttribute("y", head[1]);
          for (const line of textElement.querySelectorAll("tspan[x]")) line.setAttribute("x", head[0]);
        }
        const text = textElement.getBBox();
        const attrs = { x: text.x - 10 / ratio, y: text.y - 7 / ratio,
          width: text.width + 20 / ratio, height: text.height + 14 / ratio, rx: 8 / ratio, ry: 8 / ratio };
        for (const [name, value] of Object.entries(attrs)) rect.setAttribute(name, value);
        if (!rect.checkVisibility({ checkVisibilityCSS: true })) continue;
        const screen = rect.getBoundingClientRect();
        const { x, y } = new DOMPoint(screen.left, screen.top).matrixTransform(inverse);
        const w = screen.width / renderedRatio, h = screen.height / renderedRatio;
        const spacing = 1 / ratio;
        const [left, top, width, height] = visible;
        const fits = (bx, by) => bx >= left && by >= top && bx + w <= left + width && by + h <= top + height &&
          !tips.some(([tx, ty]) => Math.hypot(Math.max(bx - tx, 0, tx - bx - w),
            Math.max(by - ty, 0, ty - by - h)) < (FOCUS_TIP_RADIUS_PX + 1) / ratio) &&
          !boxes.some(([px, py, pw, ph]) => bx < px + pw + spacing && bx + w + spacing > px &&
            by < py + ph + spacing && by + h + spacing > py);
        let dx = 0, dy = 0;
        if (!fits(x, y)) {
          const directions = Array.from({ length: 16 }, (_, i) => [Math.cos(i * Math.PI / 8), Math.sin(i * Math.PI / 8)]);
          search: for (let px = 2; px <= 100; px += 2) {
            for (const [vx, vy] of directions) {
              const tx = vx * px / ratio, ty = vy * px / ratio;
              if (!fits(x + tx, y + ty)) continue;
              dx = tx;
              dy = ty;
              break search;
            }
          }
          if (dx || dy) badge.setAttribute("transform", "translate(" + dx + " " + dy + ")");
        }
        boxes.push([x + dx, y + dy, w, h]);
        if (head) {
          const end = [clamp(head[0], x + dx, x + dx + w), clamp(head[1], y + dy, y + dy + h)];
          if (Math.hypot(end[0] - head[0], end[1] - head[1]) > .2)
            extensions.append(el("polyline", {
              "data-original-badge-extension": node.id,
              points: [head, end].map(point => point.join(",")).join(" "),
              "stroke-width": this.originalLayout.strokeWidth,
            }));
        }
      }
      return boxes;
    }
    available() {
      return this.ready && !this.state?.removed;
    }
    shouldUseFrame() {
      const s = this.state;
      return !!(s && (s.autoFocus || s.autoBox) && this.available());
    }
    baseBox() {
      const s = this.state;
      if (s?.navViewBox) return s.navViewBox;
      if (s?.showNumbers && this.originalLayout && this.data.originalPlacement.numberingViewBox)
        return this.data.originalPlacement.numberingViewBox;
      if (s && !s.showNumbers && !s.autoBox && this.data.exploreViewBox)
        return this.data.exploreViewBox;
      return this.data.viewBox;
    }
    view() {
      return [...this.baseBox()];
    }
    set(state) {
      this.state = state;
      this.draw();
    }
    setZoom(value) {
      this.zoom = !!value;
      this.draw();
    }
    setMaxZoom(value) {
      this.maxZoom = Number(value) || DEFAULT_MAX_ZOOM;
      this.draw();
    }
    focusBox(nodes, includeAnchors = false) {
      const [bx, by, bw, bh] = this.baseBox();
      const pts = [];
      for (const node of nodes) {
        const tips = node.leaders?.length
          ? node.leaders.map((l) => l.tip)
          : [node.anchor || [bx + bw / 2, by + bh / 2]];
        pts.push(...tips);
        if (includeAnchors && node.labelAnchor) {
          pts.push([node.labelAnchor[0] - 58, node.labelAnchor[1] - 58]);
          pts.push([node.labelAnchor[0] + 58, node.labelAnchor[1] + 58]);
        }
      }
      const pad = includeAnchors ? 32 : FOCUS_PAD_UNITS;
      const minX = Math.min(...pts.map((t) => t[0])) - pad;
      const maxX = Math.max(...pts.map((t) => t[0])) + pad;
      const minY = Math.min(...pts.map((t) => t[1])) - pad;
      const maxY = Math.max(...pts.map((t) => t[1])) + pad;
      return [
        clamp((minX - bx) / bw, 0, 1),
        clamp((minY - by) / bh, 0, 1),
        clamp((maxX - bx) / bw, 0, 1),
        clamp((maxY - by) / bh, 0, 1),
      ];
    }
    focusRect(W, H, box, fillFraction = 0.55) {
      const [, , rw, rh] = this.baseBox();
      const bw = Math.min(W, (H * rw) / rh);
      const bh = (bw * rh) / rw;
      const fw = Math.max(1, (box[2] - box[0]) * bw);
      const fh = Math.max(1, (box[3] - box[1]) * bh);
      const s = Math.max(1, Math.min((fillFraction * W) / fw, (fillFraction * H) / fh, this.maxZoom));
      const width = bw * s;
      const height = (width * rh) / rw;
      let left = W / 2 - ((box[0] + box[2]) / 2) * width;
      let top = H / 2 - ((box[1] + box[3]) / 2) * height;
      left = Math.min(Math.max(left, W - width), Math.max(0, (W - width) / 2));
      top = Math.min(Math.max(top, H - height), Math.max(0, (H - height) / 2));
      return { left, top, width, height, scale: s };
    }
    wholeRect(W, H) {
      const [, , rw, rh] = this.baseBox();
      const width = Math.min(W, (H * rw) / rh);
      const height = (width * rh) / rw;
      return { left: (W - width) / 2, top: (H - height) / 2, width, height, scale: 1 };
    }
    manualRect(W, H, view) {
      const [, , rw, rh] = this.baseBox();
      const base = Math.min(W, (H * rw) / rh);
      const scale = clamp(view.scale, 1, 3.5);
      const width = base * scale;
      const height = (width * rh) / rw;
      let left = W / 2 - view.cx * width;
      let top = H / 2 - view.cy * height;
      left = Math.min(Math.max(left, W - width), Math.max(0, (W - width) / 2));
      top = Math.min(Math.max(top, H - height), Math.max(0, (H - height) / 2));
      return { left, top, width, height, scale };
    }
    viewStateFromRect(W, H, r) {
      const [, , rw, rh] = this.baseBox();
      const base = Math.min(W, (H * rw) / rh);
      const scale = r ? r.width / base : 1;
      const cx = r ? clamp((W / 2 - r.left) / r.width, 0, 1) : 0.5;
      const cy = r ? clamp((H / 2 - r.top) / r.height, 0, 1) : 0.5;
      return { scale, cx, cy };
    }
    setInspectMode(value) {
      this.inspectMode = !!value;
      if (this.inspectMode && !this.manualView) {
        const W = this.host.clientWidth;
        const H = this.host.clientHeight;
        const cur = this.viewStateFromRect(W, H, this.lastFocusRect);
        this.manualView = {
          scale: clamp(Math.max(2.0, cur.scale * 2.0), 1.8, 3.0),
          cx: cur.cx,
          cy: cur.cy,
        };
      }
      if (!this.inspectMode && !this.manualView) {
        this.host.classList.remove("inspect-mode");
      }
      this.applyFocus(true);
      this.onViewChange?.();
    }
    resetManualView() {
      this.manualView = null;
      this.inspectMode = false;
      this.host.classList.remove("inspect-mode", "manual-zoom", "dragging");
      if (this.shouldUseFrame()) this.applyFocus(true);
    }
    bindZoomGestures() {
      const clientToNorm = (clientX, clientY) => {
        const rect = this.svg.getBoundingClientRect();
        return {
          nx: clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1),
          ny: clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1),
        };
      };
      const zoomAt = (scale, nx, ny, clientX, clientY, animate = false) => {
        const W = this.host.clientWidth;
        const H = this.host.clientHeight;
        if (W <= 0 || H <= 0) return;
        if (scale <= 1.04) {
          this.manualView = null;
          this.applyFocus(animate);
          this.onViewChange?.();
          return;
        }
        const [, , rw, rh] = this.baseBox();
        const base = Math.min(W, (H * rw) / rh);
        const s = clamp(scale, 1.05, 3.5);
        const width = base * s;
        const height = (width * rh) / rw;
        const hostRect = this.host.getBoundingClientRect();
        const px = clientX - hostRect.left;
        const py = clientY - hostRect.top;
        const left = px - nx * width;
        const top = py - ny * height;
        this.manualView = {
          scale: s,
          cx: clamp((W / 2 - left) / width, 0, 1),
          cy: clamp((H / 2 - top) / height, 0, 1),
        };
        this.applyFocus(animate);
        this.onViewChange?.();
      };
      this.host.addEventListener(
        "wheel",
        (e) => {
          if (!this.shouldUseFrame()) return;
          e.preventDefault();
          const W = this.host.clientWidth;
          const H = this.host.clientHeight;
          const cur = this.manualView || this.viewStateFromRect(W, H, this.lastFocusRect);
          const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
          const nextScale = cur.scale * factor;
          const { nx, ny } = clientToNorm(e.clientX, e.clientY);
          zoomAt(nextScale, nx, ny, e.clientX, e.clientY, false);
        },
        { passive: false },
      );
      this.host.addEventListener("pointerdown", (e) => {
        if (!this.shouldUseFrame()) return;
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pointers.size === 2) {
          const pts = [...this.pointers.values()];
          const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
          const midX = (pts[0].x + pts[1].x) / 2;
          const midY = (pts[0].y + pts[1].y) / 2;
          const W = this.host.clientWidth;
          const H = this.host.clientHeight;
          const cur = this.manualView || this.viewStateFromRect(W, H, this.lastFocusRect);
          const { nx, ny } = clientToNorm(midX, midY);
          this.pinch = { dist: Math.max(10, dist), scale: cur.scale, nx, ny };
          this.drag = null;
          this.suppressClick = true;
        } else if (this.pointers.size === 1) {
          const W = this.host.clientWidth;
          const H = this.host.clientHeight;
          const rect = this.lastFocusRect || this.wholeRect(W, H);
          const cur = this.manualView || this.viewStateFromRect(W, H, rect);
          this.drag = {
            startX: e.clientX,
            startY: e.clientY,
            cx: cur.cx,
            cy: cur.cy,
            scale: cur.scale,
            width: rect.width,
            height: rect.height,
            moved: false,
          };
        }
      });
      this.host.addEventListener("pointermove", (e) => {
        if (!this.pointers.has(e.pointerId) || !this.shouldUseFrame()) return;
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pointers.size === 2 && this.pinch) {
          e.preventDefault();
          const pts = [...this.pointers.values()];
          const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
          const midX = (pts[0].x + pts[1].x) / 2;
          const midY = (pts[0].y + pts[1].y) / 2;
          zoomAt(this.pinch.scale * (dist / this.pinch.dist), this.pinch.nx, this.pinch.ny, midX, midY, false);
          return;
        }
        if (this.pointers.size === 1 && this.drag && (this.manualView || this.inspectMode)) {
          const dx = e.clientX - this.drag.startX;
          const dy = e.clientY - this.drag.startY;
          if (!this.drag.moved && Math.hypot(dx, dy) > 6) {
            this.drag.moved = true;
            this.suppressClick = true;
            this.host.classList.add("dragging");
          }
          if (this.drag.moved && this.manualView) {
            e.preventDefault();
            this.manualView = {
              scale: this.drag.scale,
              cx: clamp(this.drag.cx - dx / Math.max(1, this.drag.width), 0, 1),
              cy: clamp(this.drag.cy - dy / Math.max(1, this.drag.height), 0, 1),
            };
            this.applyFocus(false);
          }
        }
      });
      const endPointer = (e) => {
        const hadMoved = this.drag?.moved;
        this.pointers.delete(e.pointerId);
        if (this.pointers.size < 2) this.pinch = null;
        if (this.pointers.size === 0) {
          this.drag = null;
          this.host.classList.remove("dragging");
          if (hadMoved) this.onViewChange?.();
        }
      };
      this.host.addEventListener("pointerup", endPointer);
      this.host.addEventListener("pointercancel", endPointer);
    }
    placeSvg(r) {
      this.svg.style.left = r.left + "px";
      this.svg.style.top = r.top + "px";
      this.svg.style.width = r.width + "px";
      this.svg.style.height = r.height + "px";
    }
    applyFocus(animate = true) {
      if (this.focusRafId !== null) {
        cancelAnimationFrame(this.focusRafId);
        this.focusRafId = null;
      }
      const s = this.state;
      const useFrame = this.shouldUseFrame();
      this.host.classList.toggle("focus-mode", useFrame);
      this.host.classList.toggle("inspect-mode", useFrame && this.inspectMode);
      this.host.classList.toggle("manual-zoom", useFrame && !!this.manualView);
      if (!useFrame) {
        this.focusTarget = null;
        this.lastFocusRect = null;
        this.svg.style.transition = "";
        this.svg.style.left = "";
        this.svg.style.top = "";
        this.svg.style.width = "";
        this.svg.style.height = "";
        return;
      }
      const W = this.host.clientWidth;
      const H = this.host.clientHeight;
      if (W <= 0 || H <= 0) return;
      let target;
      if (this.manualView) {
        target = this.manualRect(W, H, this.manualView);
      } else if (s.navLabels?.length) {
        target = this.wholeRect(W, H);
      } else if (s.autoBox) {
        target = s.findWhole && !s.nav34
          ? this.wholeRect(W, H)
          : this.focusRect(W, H, this.focusBox(s.nodes, s.showNumbers || this.originalLeaders), 0.88);
      } else {
        const focusedNode =
          !s.focusWhole && s.focus?.length === 1
            ? s.nodes.find((n) => n.id === s.focus[0])
            : null;
        target = focusedNode
          ? this.focusRect(W, H, this.focusBox([focusedNode], this.originalLeaders), 0.55)
          : this.wholeRect(W, H);
      }
      this.focusTarget = target;
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (animate && !s.nav34 && !s.autoBox && !reducedMotion) {
        this.svg.style.transition = "none";
        this.placeSvg(this.lastFocusRect || this.wholeRect(W, H));
        this.svg.getBoundingClientRect();
        this.svg.style.transition = "";
        this.focusRafId = requestAnimationFrame(() => {
          this.focusRafId = null;
          this.placeSvg(target);
        });
      } else {
        this.svg.style.transition = "none";
        this.placeSvg(target);
      }
      this.lastFocusRect = target;
    }
    draw() {
      const s = this.state;
      if (!s) return;
      const v = this.view();
      const b = this.baseBox();
      const activeLabel = document.activeElement?.dataset?.navLabel;
      this.svg.style.aspectRatio = b[2] + "/" + b[3];
      this.svg.setAttribute("viewBox", v.join(" "));
      this.svg.replaceChildren();
      const defs = el("defs"),
        clip = el("clipPath", { id: "core-art-clip" });
      clip.append(el("path", { d: this.data.clipPath }));
      defs.append(clip);
      this.svg.append(defs);
      const art = el("g", {
        "data-artwork": "",
        "clip-path": "url(#core-art-clip)",
      });
      art.append(
        el("image", {
          href: this.data.src,
          x: 0,
          y: 0,
          width: this.data.width,
          height: this.data.height,
        }),
      );
      this.svg.append(art);
      const masks = el("g", {
        "data-masks": "",
        "clip-path": "url(#core-art-clip)",
        fill: "white",
        stroke: "white",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
      for (const m of this.data.masks)
        masks.append(
          el("path", {
            d: m.path,
            fill: "none",
            "stroke-width": m.width,
            stroke: m.stroke || "white",
          }),
        );
      for (const [x, y, w, h] of this.data.maskRects)
        masks.append(el("rect", { x, y, width: w, height: h, stroke: "none" }));
      this.svg.append(masks);
      if (s.nav34 && !s.findWhole) this.drawBackgroundFades();
      const leaders = el("g", { "data-number-leaders": "" });
      for (const n of s.showNumbers && !this.originalLeaders ? s.nodes : []) {
        if (n.leaders?.length) {
          for (const l of n.leaders) {
            leaders.append(
              el("path", {
                class: "base-leader",
                "data-leader-id": n.id,
                "data-leader-index": l.index,
                d: l.d,
              }),
            );
            if (
              n.labelAnchor &&
              Math.hypot(n.labelAnchor[0] - l.labelEnd[0], n.labelAnchor[1] - l.labelEnd[1]) > 2
            ) {
              leaders.append(
                el("line", {
                  class: "label-connector",
                  "data-connector-id": n.id,
                  x1: n.labelAnchor[0],
                  y1: n.labelAnchor[1],
                  x2: l.labelEnd[0],
                  y2: l.labelEnd[1],
                }),
              );
            }
          }
        } else if (n.mode === "number") {
          leaders.append(
            el("line", {
              "data-leader-id": n.id,
              x1: n.marker[0],
              y1: n.marker[1],
              x2: n.anchor[0],
              y2: n.anchor[1],
            }),
            el("circle", { cx: n.anchor[0], cy: n.anchor[1], r: 3 }),
          );
        }
      }
      this.svg.append(leaders);
      if (this.originalLeaders) {
        this.svg.append(el("g", { "data-original-extensions": "", "pointer-events": "none" }));
      }
      if (s.nav34) this.svg.append(el("g", { "data-badge-extensions": "", "pointer-events": "none" }));
      const outlines = el("g", { "data-outlines": "" });
      const hasBadge = !!(s.name || s.questionBadge) && s.focus.length === 1;
      if (s.nav34) {
        this.drawNavHighlights(outlines);
      } else if (this.originalLeaders) {
        const focusedIds = s.multiBadges
          ? s.nodes.map((n) => n.id)
          : s.pathBadges ? s.pathBadges.map((badge) => badge.id) : s.focus;
        const highlighted = s.nodes.filter(node => s.showNumbers || focusedIds.includes(node.id));
        const emphasis = el("g", { "data-original-emphasis": "", "pointer-events": "none" });
        this.drawOriginalFocus(emphasis, highlighted);
        this.svg.append(emphasis);
        for (const n of s.nodes.filter((node) => focusedIds.includes(node.id))) {
          for (const leader of n.leaders || []) {
            outlines.append(el("circle", {
              cx: leader.tip[0], cy: leader.tip[1], r: FOCUS_TIP_RADIUS_PX,
              class: this.originalLayout ? "focus-tip original-arrow-tip" : "focus-tip",
              "data-focus-tip": n.id, "data-leader-index": leader.index,
            }));
          }
        }
      } else if (s.multiBadges) {
        for (const n of s.nodes) {
          for (const l of n.leaders || []) {
            outlines.append(
              el("line", { class: "leader-focus-halo", "data-multi-halo": n.id, "data-leader-index": l.index }),
              el("line", { class: "leader-focus", "data-focus-id": n.id, "data-leader-index": l.index }),
              el("circle", {
                cx: l.tip[0], cy: l.tip[1], r: FOCUS_TIP_RADIUS_PX,
                class: "focus-tip", "data-focus-tip": n.id, "data-leader-index": l.index,
              }),
            );
          }
        }
      } else if (s.pathBadges) {
        for (const pb of s.pathBadges) {
          const n = s.nodes.find((item) => item.id === pb.id);
          if (!n) continue;
          for (const l of n.leaders || []) {
            outlines.append(
              el("line", { class: "leader-focus-halo", "data-path-halo": n.id, "data-leader-index": l.index }),
              el("line", { class: "leader-focus", "data-focus-id": n.id, "data-leader-index": l.index }),
              el("circle", {
                cx: l.tip[0], cy: l.tip[1], r: FOCUS_TIP_RADIUS_PX,
                class: "focus-tip", "data-focus-tip": n.id, "data-leader-index": l.index,
              }),
            );
          }
        }
      } else {
        for (const n of s.nodes.filter((n) => s.focus.includes(n.id))) {
          if (n.leaders?.length) {
            for (const l of n.leaders) {
              if (hasBadge) {
                outlines.append(
                  el("line", { class: "leader-focus-halo", "data-halo-index": l.index }),
                  el("line", { class: "leader-focus", "data-focus-id": n.id, "data-leader-index": l.index }),
                );
              } else {
                outlines.append(
                  el("path", { d: l.d, class: "leader-focus-halo" }),
                  el("path", { d: l.d, class: "leader-focus", "data-focus-id": n.id, "data-leader-index": l.index }),
                );
              }
              outlines.append(
                el("circle", {
                  cx: l.tip[0], cy: l.tip[1], r: FOCUS_TIP_RADIUS_PX,
                  class: "focus-tip", "data-focus-tip": n.id, "data-leader-index": l.index,
                }),
              );
            }
          } else {
            outlines.append(
              el("path", {
                d: n.path, "fill-rule": "evenodd",
                class: n.mode === "number" ? "fine-outline" : "", "data-focus-id": n.id,
              }),
            );
          }
        }
      }
      this.svg.append(outlines);
      if (s.route?.length > 1) {
        const arrow = el("marker", {id: "core-flow-head", viewBox: "0 0 10 10",
          markerWidth: 4, markerHeight: 4, refX: 10, refY: 5, orient: "auto"});
        arrow.append(el("path", {d: "M0 0 L10 5 L0 10 Z", fill: "#174e79"}));
        defs.append(arrow);
        const points = s.route.map(id => {
          const node = s.nodes.find(n => n.id === id);
          return node.routeTip || node.leaders?.[0]?.tip || node.anchor;
        });
        const flow = el("g", {"data-route": "", "pointer-events": "none"});
        points.slice(1).forEach((point, i) => {
          const d = "M" + points[i].join(" ") + " L" + point.join(" ");
          flow.append(el("path", {d, class: "route-line", "marker-end": "url(#core-flow-head)"}),
            el("path", {d, class: "route-motion"}));
        });
        this.svg.append(flow);
      }
      const markers = el("g", { "data-numbers": "" });
      for (const n of s.showNumbers ? s.nodes : []) {
        const pos = n.labelAnchor || n.marker;
        const g = el("g", {
          "data-number-id": n.id,
          ...(s.passiveNumbers ? {} : {
            role: "button",
            tabindex: s.locked ? -1 : 0,
            "aria-label": "圖上編號 " + s.mapping[n.id],
            "aria-disabled": s.locked || !this.available(),
          }),
          class: s.passiveNumbers ? "number-marker passive-number" : "number-marker",
        });
        g.append(
          el("circle", { cx: pos[0], cy: pos[1], r: 24 }),
          el("text", {
            x: pos[0],
            y: pos[1],
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "data-diagram-text": "",
          }),
        );
        g.lastChild.textContent = s.mapping[n.id];
        markers.append(g);
      }
      this.svg.append(markers);
      if (s.multiBadges) {
        const mb = el("g", { "data-multi-badges": "" });
        for (const n of s.nodes) {
          const g = el("g", { "data-multi-badge": n.id });
          const rect = el("rect", { rx: 8, ry: 8 });
          const text = el("text", {
            x: n.labelAnchor?.[0] || v[0] + v[2] * 0.5,
            y: n.labelAnchor?.[1] || v[1] + v[3] * 0.5,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "data-diagram-text": "",
          });
          text.textContent = n.label.short;
          g.append(rect, text);
          mb.append(g);
        }
        this.svg.append(mb);
      } else if (s.pathBadges?.length) {
        const pbGroup = el("g", { "data-path-badges": "" });
        for (const pb of s.pathBadges) {
          const n = s.nodes.find((item) => item.id === pb.id);
          if (!n) continue;
          const g = el("g", { "data-path-badge": n.id, "data-path-steps": pb.steps.join(",") });
          const rect = el("rect", { rx: 8, ry: 8 });
          const text = el("text", {
            x: n.labelAnchor?.[0] || v[0] + v[2] * 0.5,
            y: n.labelAnchor?.[1] || v[1] + v[3] * 0.5,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "data-diagram-text": "",
          });
          const stepSpan = el("tspan", { class: "path-step" });
          stepSpan.textContent = pb.steps.join(",");
          const nameSpan = el("tspan");
          nameSpan.textContent = " " + n.label.short;
          text.append(stepSpan, nameSpan);
          g.append(rect, text);
          pbGroup.append(g);
        }
        this.svg.append(pbGroup);
      } else if (s.name || s.questionBadge) {
        const badgeText = s.name || s.questionBadge;
        const attrName = s.name ? "data-chinese-overlay" : "data-question-badge";
        const title = el("g", { [attrName]: "" });
        const badgeFocus = s.nav34 && s.questionBadge ? s.questionCue : s.focus;
        const fn = badgeFocus.length === 1 ? s.nodes.find((n) => n.id === badgeFocus[0]) : null;
        if (fn && (fn.leaders?.length || fn.labelAnchor)) {
          const rect = el("rect", { rx: 8, ry: 8 });
          const cx = fn.labelAnchor ? fn.labelAnchor[0] : v[0] + v[2] * 0.5;
          const cy = fn.labelAnchor ? fn.labelAnchor[1] : v[1] + v[3] * 0.1;
          const text = el("text", {
            x: cx,
            y: cy,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "data-diagram-text": "",
          });
          text.textContent = badgeText;
          title.append(rect, text);
          if (s.nav34) title.dataset.badgeNode = fn.id;
        } else {
          title.append(
            el("rect", {
              x: v[0] + v[2] * 0.12,
              y: v[1] + v[3] * 0.03,
              width: v[2] * 0.76,
              height: 64,
              fill: "white",
            }),
          );
          const text = el("text", {
            x: v[0] + v[2] * 0.5,
            y: v[1] + v[3] * 0.1,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "data-diagram-text": "",
          });
          text.textContent = badgeText;
          title.append(text);
        }
        this.svg.append(title);
      }
      if (s.navLabels?.length) this.drawNavigationLabels(s.navLabels);
      this.svg.classList.toggle("not-available", !this.available());
      this.svg.classList.toggle("is-locked", s.locked);
      this.error.hidden = this.available();
      this.error.textContent = this.ready
        ? s.noImageText
        : "圖檔未載入；請確認圖檔仍在指定資料夾內。";
      this.applyFocus(true);
      this.sizeText();
      if (activeLabel) this.svg.querySelector(`[data-nav-label="${CSS.escape(activeLabel)}"]`)?.focus({ preventScroll: true });
    }
    drawBackgroundFades() {
      const s = this.state;
      const visible = new Set([
        ...(s.navLabels || []).map(node => node.id),
        ...s.questionCue,
        ...s.focus,
        ...(s.showNumbers ? s.nodes.map(node => node.id) : []),
        ...s.route,
      ]);
      const group = el("g", { "data-background-leader-fades": "", "clip-path": "url(#core-art-clip)" });
      for (const fade of this.data.backgroundLeaderFades || []) {
        if (fade.ownerIds?.some(id => visible.has(id))) continue;
        group.append(el("path", { d: fade.path, stroke: fade.stroke, "stroke-width": fade.width ?? 4 }));
      }
      this.svg.append(group);
    }
    drawNavHighlights(outlines) {
      const s = this.state;
      const navigation = s.navLabels.length > 0;
      const neutral = s.navLabels.length || s.showNumbers ? s.nodes.map(node => node.id) : s.questionCue;
      const shown = new Set([...neutral, ...s.focus]);
      const emphasized = s.nodes.filter(node => s.focus.includes(node.id));
      const group = el("g", {
        "data-original-emphasis": "", "pointer-events": "none",
        ...(!navigation && emphasized.length ? { "data-answer-review-focus": emphasized.map(node => node.id).join(" ") } : {}),
      });
      const overlayLeaders = el("g", { "data-figure-overlay-leaders": "", "pointer-events": "none" });
      for (const node of s.nodes.filter(node => neutral.includes(node.id) && !s.focus.includes(node.id))) {
        for (const { points, overlay } of this.originalLayout.pathsFor(node)) {
          if (overlay) this.drawOverlayLeader(overlayLeaders, points, this.originalLayout.strokeWidth, true);
        }
      }
      if (overlayLeaders.childElementCount) this.svg.append(overlayLeaders);
      this.drawOriginalFocus(group, emphasized);
      for (const node of s.nodes.filter(node => shown.has(node.id))) {
        if (node.bracketPath) {
          if (!s.focus.includes(node.id)) group.append(el("path", {
            d: node.bracketPath, fill: "none", stroke: "#171717",
            "data-original-bracket": node.id, "stroke-width": this.originalLayout.highlightWidth,
          }));
          continue;
        }
        for (const [index, tip] of node.tips.entries()) {
          outlines.append(el("circle", {
            cx: tip[0], cy: tip[1], r: FOCUS_TIP_RADIUS_PX, class: "focus-tip",
            "data-focus-tip": node.id, "data-leader-index": index,
            ...(s.questionCue.includes(node.id) && !s.focus.includes(node.id) ? { "data-question-cue": "" } : {}),
            ...(navigation && s.seen.has(node.id) && !s.focus.includes(node.id) ? { "data-nav-seen-dot": "" } : {}),
          }));
        }
      }
      this.svg.append(group);
    }
    drawNavigationLabels(nodes) {
      this.svg.append(el("g", { "data-nav-connectors": "", "pointer-events": "none" }));
      const group = el("g", { "data-nav-labels": "" });
      for (const node of nodes) {
        const state = this.state.focus.includes(node.id) ? "current" : this.state.seen.has(node.id) ? "seen" : "unseen";
        const label = el("g", {
          "data-nav-label": node.id, "data-nav-state": state, role: "button",
          tabindex: this.available() ? 0 : -1, "aria-pressed": state === "current",
          "aria-label": state === "seen" ? node.label.short + "，已看" : node.label.short,
        });
        const text = el("text", {
          "data-diagram-text": "", "text-anchor": "middle", "dominant-baseline": "central",
        });
        const lines = this.navigationLabelLines(node);
        for (const [index, line] of lines.entries()) {
          const span = el("tspan");
          span.textContent = (state === "seen" && index === 0 ? "✓ " : "") + line;
          text.append(span);
        }
        label.append(el("rect"), text);
        group.append(label);
      }
      this.svg.append(group);
    }
    navigationLabelLines(node) {
      const name = node.label.short;
      const note = name.indexOf("（");
      return note > 0 && Array.from(name).length > 8
        ? [name.slice(0, note), name.slice(note)]
        : [name];
    }
    positionNavigationLabels(ratio, scale) {
      const group = this.svg.querySelector("[data-nav-connectors]");
      group.replaceChildren();
      const visible = this.visibleBox();
      const nodes = this.state.navLabels;
      const items = nodes.map(node => {
        const lines = this.navigationLabelLines(node);
        const maxLength = Math.max(...lines.map(line => Array.from(line).length));
        return {
          node, w: (maxLength * 18 * scale + 24) / ratio,
          h: Math.max(44, lines.length * 19 * scale + 5) / ratio,
        };
      });
      const slots = this.state.navLabelSlots;
      const key = JSON.stringify([visible, ratio, scale, nodes.map(node => node.id), slots]);
      if (this.navPositions?.key !== key) {
        const tips = nodes.flatMap(node => node.tips);
        this.navPositions = { key, placed: this.originalLayout.arrangeLabels(items, visible, ratio, tips, slots) };
      }
      for (const label of this.svg.querySelectorAll("[data-nav-label]")) {
        const position = this.navPositions.placed.get(label.dataset.navLabel);
        if (!position) continue;
        const [x, y, w, h] = position.box;
        const current = label.dataset.navState === "current";
        for (const [name, value] of Object.entries({ x, y, width: w, height: h, rx: 6 / ratio }))
          label.firstChild.setAttribute(name, value);
        const text = label.lastChild;
        text.setAttribute("x", x + w / 2);
        text.setAttribute("y", y + h / 2);
        text.setAttribute("font-size", (current ? 18 : 16) * scale / ratio);
        for (const [i, span] of [...text.children].entries()) {
          span.setAttribute("x", x + w / 2);
          span.setAttribute("y", y + h / 2 + (i - (text.children.length - 1) / 2) * 19 * scale / ratio);
        }
        if (Math.hypot(position.end[0] - position.head[0], position.end[1] - position.head[1]) > .1)
          group.append(el("polyline", {
            "data-nav-connector": label.dataset.navLabel,
            points: [position.head, position.end].map(point => point.join(",")).join(" "),
            "stroke-width": (current ? this.originalLayout.highlightWidth : this.originalLayout.strokeWidth),
          }));
      }
    }
    visibleBox() {
      const v = this.view();
      if (this.focusTarget && this.host.clientWidth > 0 && this.host.clientHeight > 0) {
        const ft = this.focusTarget;
        const r = ft.width / v[2];
        const x0 = Math.max(v[0], v[0] - ft.left / r);
        const y0 = Math.max(v[1], v[1] - ft.top / r);
        const x1 = Math.min(v[0] + v[2], v[0] + (this.host.clientWidth - ft.left) / r);
        const y1 = Math.min(v[1] + v[3], v[1] + (this.host.clientHeight - ft.top) / r);
        return [x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)];
      }
      return v;
    }
    placeBadgeAvoiding(rect, text, tips, vis, ratio, placedBoxes = [], avoidTips = tips) {
      const padX = 10 / ratio,
        padY = 7 / ratio;
      const tb = text.getBBox();
      const rw = tb.width + 2 * padX;
      const rh = tb.height + 2 * padY;
      const minX = Math.min(...tips.map((t) => t[0]));
      const maxX = Math.max(...tips.map((t) => t[0]));
      const minY = Math.min(...tips.map((t) => t[1]));
      const maxY = Math.max(...tips.map((t) => t[1]));
      const tcx = (minX + maxX) / 2;
      const tcy = (minY + maxY) / 2;
      const gap = 24 / ratio;
      const tipPad = 12 / ratio;
      const margin = 10 / ratio;
      const minRx = vis[0] + margin;
      const maxRx = Math.max(minRx, vis[0] + vis[2] - rw - margin);
      const minRy = vis[1] + margin;
      const maxRy = Math.max(minRy, vis[1] + vis[3] - rh - margin);
      const candidates = [
        [tcx - rw / 2, minY - gap - rh],
        [tcx - rw / 2, maxY + gap],
        [minX - gap - rw, tcy - rh / 2],
        [maxX + gap, tcy - rh / 2],
        [minX - gap - rw, minY - gap - rh],
        [maxX + gap, minY - gap - rh],
        [minX - gap - rw, maxY + gap],
        [maxX + gap, maxY + gap],
      ];
      const rectPointDist = (rx, ry, px, py) => {
        const dx = Math.max(rx - px, 0, px - (rx + rw));
        const dy = Math.max(ry - py, 0, py - (ry + rh));
        return Math.hypot(dx, dy);
      };
      const overlapsPlaced = (rx, ry) =>
        placedBoxes.some(
          (b) => rx < b[0] + b[2] + 4 / ratio && rx + rw + 4 / ratio > b[0] && ry < b[1] + b[3] + 4 / ratio && ry + rh + 4 / ratio > b[1],
        );
      let best = { rx: clamp(tcx - rw / 2, minRx, maxRx), ry: clamp(tcy - rh / 2, minRy, maxRy), score: -Infinity };
      for (const [cx0, cy0] of candidates) {
        const rx = clamp(cx0, minRx, maxRx);
        const ry = clamp(cy0, minRy, maxRy);
        const minTipDist = Math.min(...avoidTips.map((t) => rectPointDist(rx, ry, t[0], t[1])));
        const centerDist = Math.hypot(rx + rw / 2 - tcx, ry + rh / 2 - tcy);
        const boxPenalty = overlapsPlaced(rx, ry) ? -50000 : 0;
        const score = (minTipDist >= tipPad ? 10000 : minTipDist * 100) + boxPenalty - centerDist;
        if (score > best.score) best = { rx, ry, score };
      }
      const { rx, ry } = best;
      text.setAttribute("x", String(rx + rw / 2));
      text.setAttribute("y", String(ry + rh / 2));
      rect.setAttribute("x", String(rx));
      rect.setAttribute("y", String(ry));
      rect.setAttribute("width", String(rw));
      rect.setAttribute("height", String(rh));
      rect.setAttribute("rx", String(8 / ratio));
      rect.setAttribute("ry", String(8 / ratio));
      return [rx, ry, rw, rh];
    }
    sizeText() {
      const m = this.svg.getScreenCTM();
      if (!m) return;
      const liveRatio = Math.hypot(m.a, m.b);
      const ratio = this.focusTarget
        ? this.focusTarget.width / this.baseBox()[2]
        : liveRatio;
      if (!ratio) return;
      const scale =
        Number(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--font-scale",
          ),
        ) || 1;
      for (const t of this.svg.querySelectorAll("[data-diagram-text]"))
        t.setAttribute("font-size", String((19 * scale) / ratio));
      for (const g of this.svg.querySelectorAll("[data-number-id]"))
        g.querySelector("circle").setAttribute(
          "r",
          String(23 / ratio),
        );
      for (const c of this.svg.querySelectorAll(".focus-tip"))
        c.setAttribute("r", String(FOCUS_TIP_RADIUS_PX / ratio));
      if (this.originalLeaders) {
        this.sizeOriginalArrows(ratio);
        if (this.state?.navLabels?.length) {
          this.positionNavigationLabels(ratio, scale);
          return;
        }
        const badges = this.placeOriginalBadges(ratio);
        this.placeOriginalNumbers((scale > 1 ? 17 : 15) / ratio, badges, ratio);
        return;
      }
      const vis = this.visibleBox();
      const [vx, vy, vw, vh] = vis;
      const numRadius = 23 / ratio;
      const numInset = numRadius + 5.6 / ratio;
      for (const g of this.svg.querySelectorAll("[data-number-id]")) {
        const node = this.state?.nodes?.find((n) => n.id === g.dataset.numberId);
        const pos = node?.labelAnchor || node?.marker;
        const circle = g.querySelector("circle");
        circle.setAttribute("r", String(numRadius));
        if (pos) {
          const x = clamp(pos[0], vx + numInset, vx + vw - numInset);
          const y = clamp(pos[1], vy + numInset, vy + vh - numInset);
          circle.setAttribute("cx", String(x));
          circle.setAttribute("cy", String(y));
          const text = g.querySelector("text");
          if (text) {
            text.setAttribute("x", String(x));
            text.setAttribute("y", String(y));
          }
        }
      }
      if (this.state?.multiBadges) {
        const allTips = this.state.nodes.flatMap((n) => (n.leaders || []).map((l) => l.tip));
        const placed = [];
        for (const n of this.state.nodes) {
          const g = this.svg.querySelector(`[data-multi-badge="${n.id}"]`);
          if (!g) continue;
          const tips = n.leaders?.length ? n.leaders.map((l) => l.tip) : [n.labelAnchor];
          const box = this.placeBadgeAvoiding(g.querySelector("rect"), g.querySelector("text"), tips, vis, ratio, placed, allTips.length ? allTips : tips);
          placed.push(box);
          for (const l of n.leaders || []) {
            const sx = clamp(l.tip[0], box[0], box[0] + box[2]);
            const sy = clamp(l.tip[1], box[1], box[1] + box[3]);
            for (const line of this.svg.querySelectorAll(`[data-leader-index="${l.index}"][data-focus-id="${n.id}"], line[data-multi-halo="${n.id}"][data-leader-index="${l.index}"]`)) {
              line.setAttribute("x1", String(sx));
              line.setAttribute("y1", String(sy));
              line.setAttribute("x2", String(l.tip[0]));
              line.setAttribute("y2", String(l.tip[1]));
            }
          }
        }
        return;
      }
      if (this.state?.pathBadges?.length) {
        const allTips = this.state.nodes.flatMap((n) => (n.leaders || []).map((l) => l.tip));
        const placed = [];
        for (const pb of this.state.pathBadges) {
          const n = this.state.nodes.find((item) => item.id === pb.id);
          const g = this.svg.querySelector(`[data-path-badge="${pb.id}"]`);
          if (!n || !g) continue;
          const tips = n.leaders?.length ? n.leaders.map((l) => l.tip) : [n.labelAnchor];
          const box = this.placeBadgeAvoiding(g.querySelector("rect"), g.querySelector("text"), tips, vis, ratio, placed, allTips.length ? allTips : tips);
          placed.push(box);
          for (const l of n.leaders || []) {
            const sx = clamp(l.tip[0], box[0], box[0] + box[2]);
            const sy = clamp(l.tip[1], box[1], box[1] + box[3]);
            for (const line of this.svg.querySelectorAll(`[data-leader-index="${l.index}"][data-focus-id="${n.id}"], line[data-path-halo="${n.id}"][data-leader-index="${l.index}"]`)) {
              line.setAttribute("x1", String(sx));
              line.setAttribute("y1", String(sy));
              line.setAttribute("x2", String(l.tip[0]));
              line.setAttribute("y2", String(l.tip[1]));
            }
          }
        }
        return;
      }
      const overlay = this.svg.querySelector("[data-chinese-overlay],[data-question-badge]");
      if (overlay && this.state?.focus?.length === 1) {
        const fn = this.state.nodes.find((n) => n.id === this.state.focus[0]);
        if (fn && (fn.leaders?.length || fn.labelAnchor)) {
          const tips = fn.leaders?.length
            ? fn.leaders.map((l) => l.tip)
            : [fn.labelAnchor || [vis[0] + vis[2] / 2, vis[1] + vis[3] / 2]];
          const [rx, ry, rw, rh] = this.placeBadgeAvoiding(
            overlay.querySelector("rect"),
            overlay.querySelector("text"),
            tips,
            vis,
            ratio,
          );
          for (const l of fn.leaders || []) {
            const sx = clamp(l.tip[0], rx, rx + rw);
            const sy = clamp(l.tip[1], ry, ry + rh);
            for (const line of this.svg.querySelectorAll(`[data-leader-index="${l.index}"][data-focus-id="${fn.id}"], line[data-halo-index="${l.index}"]`)) {
              line.setAttribute("x1", String(sx));
              line.setAttribute("y1", String(sy));
              line.setAttribute("x2", String(l.tip[0]));
              line.setAttribute("y2", String(l.tip[1]));
            }
          }
        }
      }
    }
    click(e) {
      if (this.suppressClick) {
        this.suppressClick = false;
        return;
      }
      const label = e.target.closest("[data-nav-label]");
      if (label && !this.inspectMode && this.available()) {
        this.onPick(label.dataset.navLabel);
        return;
      }
      if (this.inspectMode && this.shouldUseFrame()) {
        const rect = this.svg.getBoundingClientRect();
        const nx = clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
        const ny = clamp((e.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
        const W = this.host.clientWidth;
        const H = this.host.clientHeight;
        const [, , rw, rh] = this.baseBox();
        const base = Math.min(W, (H * rw) / rh);
        const s = this.manualView ? Math.max(2.5, this.manualView.scale) : 2.5;
        const width = base * s;
        const height = (width * rh) / rw;
        const hostRect = this.host.getBoundingClientRect();
        const left = e.clientX - hostRect.left - nx * width;
        const top = e.clientY - hostRect.top - ny * height;
        this.manualView = {
          scale: s,
          cx: clamp((W / 2 - left) / width, 0, 1),
          cy: clamp((H / 2 - top) / height, 0, 1),
        };
        this.applyFocus(true);
        this.onViewChange?.();
        return;
      }
      if (!this.available() || this.state.locked || this.originalLeaders) return;
      const number = e.target.closest("[data-number-id]");
      if (number) {
        this.onPick(number.dataset.numberId);
        return;
      }
      this.onAmbiguous([]);
    }
    metrics() {
      return [];
    }
  }
  window.FigureView = FigureView;
})();
