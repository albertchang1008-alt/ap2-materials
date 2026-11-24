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
      this.onPick = onPick;
      this.onAmbiguous = onAmbiguous;
      this.readOnly = opts.readOnly;
      this.lifecycle = new AbortController();
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
      const listener = { signal: this.lifecycle.signal };
      this.svg.addEventListener("click", (e) => this.click(e), listener);
      this.bindZoomGestures();
      this.svg.addEventListener("keydown", (e) => {
        const id =
          e.target.dataset.directId ||
          e.target.closest("[data-number-id]")?.dataset.numberId;
        if (!this.readOnly && id && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (this.available()) this.onPick(id);
        }
      }, listener);
      this.observer = new ResizeObserver(() => {
        if (this.shouldUseFrame()) {
          this.applyFocus(false);
        } else {
          this.sizeText();
        }
      });
      this.observer.observe(host);
    }
    destroy() {
      this.lifecycle.abort();
      this.observer.disconnect();
      if (this.focusRafId !== null) cancelAnimationFrame(this.focusRafId);
      this.probe.onload = this.probe.onerror = null;
      this.probe.removeAttribute("src");
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
      const listener = { signal: this.lifecycle.signal };
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
        { ...listener, passive: false },
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
      }, listener);
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
      }, listener);
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
      this.host.addEventListener("pointerup", endPointer, listener);
      this.host.addEventListener("pointercancel", endPointer, listener);
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
      } else if (s.autoBox) {
        target = s.findWhole
          ? this.wholeRect(W, H)
          : this.focusRect(W, H, this.focusBox(s.nodes, s.showNumbers), 0.88);
      } else {
        const focusedNode =
          !s.focusWhole && s.focus?.length === 1
            ? s.nodes.find((n) => n.id === s.focus[0])
            : null;
        target = focusedNode
          ? this.focusRect(W, H, this.focusBox([focusedNode], false), 0.55)
          : this.wholeRect(W, H);
      }
      this.focusTarget = target;
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (animate && !s.autoBox && !reducedMotion) {
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
      const leaders = el("g", { "data-number-leaders": "" });
      for (const n of s.showNumbers ? s.nodes : []) {
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
      const outlines = el("g", { "data-outlines": "" });
      const hasBadge = !!(s.name || s.questionBadge) && s.focus.length === 1;
      if (s.multiBadges) {
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
      const markers = el("g", { "data-numbers": "" });
      for (const n of s.showNumbers ? s.nodes : []) {
        const pos = n.labelAnchor || n.marker;
        const g = el("g", {
          "data-number-id": n.id,
          role: this.readOnly ? "img" : "button",
          tabindex: s.locked || this.readOnly ? -1 : 0,
          "aria-label": "圖上編號 " + s.mapping[n.id],
          "aria-disabled": s.locked || this.readOnly || !this.available(),
          class: "number-marker",
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
      } else if (s.name || s.questionBadge) {
        const badgeText = s.name || s.questionBadge;
        const attrName = s.name ? "data-chinese-overlay" : "data-question-badge";
        const title = el("g", { [attrName]: "" });
        const fn = s.focus.length === 1 ? s.nodes.find((n) => n.id === s.focus[0]) : null;
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
      this.svg.classList.toggle("not-available", !this.available());
      this.svg.classList.toggle("is-locked", s.locked);
      this.error.hidden = this.available();
      this.error.textContent = this.ready
        ? s.noImageText
        : "圖檔未載入；請確認圖檔仍在指定資料夾內。";
      this.applyFocus(true);
      this.sizeText();
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
          getComputedStyle(this.host).getPropertyValue(
            "--font-scale",
          ),
        ) || 1;
      for (const t of this.svg.querySelectorAll("[data-diagram-text]"))
        t.setAttribute("font-size", String((19 * scale) / ratio));
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
      for (const c of this.svg.querySelectorAll(".focus-tip"))
        c.setAttribute("r", String(FOCUS_TIP_RADIUS_PX / ratio));
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
      if (this.readOnly || !this.available() || this.state.locked) return;
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
