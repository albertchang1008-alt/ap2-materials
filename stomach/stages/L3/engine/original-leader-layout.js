/* Original leader placement in source-image coordinates. */
(() => {
  "use strict";

  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const samePoint = (a, b) => distance(a, b) < 1e-5;
  const legs = points => points.slice(1).map((point, i) => [points[i], point]);
  const nearBox = ([x, y], [left, top, w, h]) =>
    Math.hypot(Math.max(left - x, 0, x - left - w), Math.max(top - y, 0, y - top - h));
  function nearSegment(p, [a, b]) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
    return distance(p, [a[0] + t * dx, a[1] + t * dy]);
  }
  function segmentGap([a, b], [c, d]) {
    const side = (p, q, v) => (q[0] - p[0]) * (v[1] - p[1]) - (q[1] - p[1]) * (v[0] - p[0]);
    if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) return 0;
    return Math.min(nearSegment(a, [c, d]), nearSegment(b, [c, d]),
      nearSegment(c, [a, b]), nearSegment(d, [a, b]));
  }
  function perimeter(center, from, radius) {
    const fraction = radius / distance(center, from);
    return [center[0] + (from[0] - center[0]) * fraction, center[1] + (from[1] - center[1]) * fraction];
  }

  class OriginalLeaderLayout {
    constructor(figure) {
      const { step, columns, rows, bits } = figure.originalPlacement;
      this.step = step;
      this.columns = columns;
      this.rows = rows;
      this.occupied = Uint8Array.from(bits.match(/../g), hex => parseInt(hex, 16));
      this.masks = figure.maskRects;
      this.paths = figure.retainedLeaderPaths.map((leader, index) => {
        const coordinates = leader.path.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/g).map(Number);
        const points = Array.from({ length: coordinates.length / 2 }, (_, i) => coordinates.slice(2 * i, 2 * i + 2));
        if (leader.textEnd === "end") points.reverse();
        return { index, points, head: leader.textEnd === null ? null : points[0] };
      });
      this.ink = this.paths.flatMap(path => legs(path.points).map(segment => ({ path, segment })));
      this.strokeWidth = figure.originalPlacement.strokeWidth;
      this.highlightWidth = this.strokeWidth * 2.75;
    }
    pathsFor(node) {
      return node.originalLeaderPaths.map(index => this.paths[index]);
    }
    headFor(node) {
      return this.pathsFor(node).find(path => path.head)?.head || node.bracketAnchor || node.labelAnchor;
    }
    arrangeLabels(items, visible, ratio, tips) {
      const [left, top, width, height] = visible;
      const gap = 3 / ratio;
      const positions = items.map(({ node, w, h }) => {
        const head = this.headFor(node);
        const own = new Set(node.originalLeaderPaths);
        const x0 = left + gap, x1 = Math.max(x0, left + width - w - gap);
        const y0 = top + gap, y1 = Math.max(y0, top + height - h - gap);
        const xs = [x1, Math.max(x0, Math.min(x1, head[0] - w / 2))];
        const ys = [y1, Math.max(y0, Math.min(y1, head[1] - h / 2))];
        for (let x = x0; x < x1; x += 10 / ratio) xs.push(x);
        for (let y = y0; y < y1; y += 10 / ratio) ys.push(y);
        const candidates = [];
        for (const x of xs) for (const y of ys) {
          const box = [x, y, w, h];
          if (tips.some(tip => nearBox(tip, box) < 9 / ratio)) continue;
          const end = [Math.max(x, Math.min(x + w, head[0])), Math.max(y, Math.min(y + h, head[1]))];
          const edge = nearBox(head, box) * ratio;
          const art = [.14, .5, .86].flatMap(a => [.2, .5, .8].map(b => [x + a * w, y + b * h]))
            .filter(point => this.hasArt(point, gap)).length;
          const crosses = edge > .1 && this.ink.some(({ path, segment }) =>
            !own.has(path.index) && segmentGap([head, end], segment) < gap);
          const score = distance(head, [x + w / 2, y + h / 2]) * ratio + 2 * edge + 22 * art +
            (crosses ? 110 : 0);
          candidates.push({ box, head, end, score });
        }
        return { id: node.id, candidates: candidates.sort((a, b) => a.score - b.score).slice(0, 200) };
      }).sort((a, b) => a.candidates.length - b.candidates.length);
      const placed = new Map();
      const separate = (a, b) => {
        const [x, y, w, h] = a.box, [u, v, s, t] = b.box;
        return x + w + gap <= u || u + s + gap <= x || y + h + gap <= v || v + t + gap <= y;
      };
      let attempts = 0;
      function pack(index) {
        if (index === positions.length) return true;
        const { id, candidates } = positions[index];
        for (const candidate of candidates) {
          if (++attempts > 40000) return false;
          if (![...placed.values()].every(other => separate(other, candidate))) continue;
          placed.set(id, candidate);
          if (pack(index + 1)) return true;
          placed.delete(id);
        }
        return false;
      }
      pack(0);
      return placed;
    }
    arrowDirection(node, tip) {
      const terminalSegments = this.pathsFor(node).flatMap(({ points, head }) => [
        [points.at(-2), points.at(-1)],
        ...(head ? [] : [[points[1], points[0]]]),
      ]);
      const [from, end] = terminalSegments.reduce((nearest, segment) =>
        distance(segment[1], tip) < distance(nearest[1], tip) ? segment : nearest);
      const length = distance(from, end);
      return [(end[0] - from[0]) / length, (end[1] - from[1]) / length];
    }
    hasArt([x, y], radius) {
      const s = this.step;
      for (let row = Math.max(0, Math.floor((y - radius) / s)); row <= Math.min(this.rows - 1, Math.floor((y + radius) / s)); row++) {
        for (let col = Math.max(0, Math.floor((x - radius) / s)); col <= Math.min(this.columns - 1, Math.floor((x + radius) / s)); col++) {
          const i = row * this.columns + col;
          if ((this.occupied[i >> 3] & (128 >> (i & 7))) && nearBox([x, y], [col * s, row * s, s, s]) < radius)
            return true;
        }
      }
      return false;
    }
    clearLeg(segment, head, badges, ink) {
      const [from, to] = segment;
      const length = distance(from, to);
      if (length < .01) return false;
      const clearance = (this.highlightWidth + this.strokeWidth) / 2;
      // A line may share its own text terminal, provided it leaves the
      // retained segment at the join.
      if (ink.some(({ path, segment: other }) => {
        if (!head || !path.head || !samePoint(path.head, head) || !samePoint(other[0], head))
          return segmentGap(segment, other) < clearance;
        if (samePoint(...other)) return false;
        const v = [to[0] - from[0], to[1] - from[1]];
        const w = [other[1][0] - from[0], other[1][1] - from[1]];
        return (v[0] * w[0] + v[1] * w[1]) / (length * distance(...other)) > .8;
      })) return false;
      const count = Math.ceil(length / Math.max(1, this.step / 2));
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const p = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
        if (badges.some(box => nearBox(p, box) <= clearance)) return false;
        if ((!head || distance(p, head) > this.step) && this.hasArt(p, clearance)) return false;
      }
      return true;
    }
    choices(node, radius, visible, badges, tips, padding, tipClearance) {
      const own = new Set(node.originalLeaderPaths);
      const sources = this.pathsFor(node).filter(path => path.head);
      const head = sources[0]?.head;
      if (!head || sources.some(path => !path.head || !samePoint(path.head, head))) return [];
      const [vx, vy, vw, vh] = visible;
      const edge = radius + padding;
      const gap = this.highlightWidth / 2;
      const within = ([x, y], pad) => x >= vx + pad && x <= vx + vw - pad && y >= vy + pad && y <= vy + vh - pad;
      const clearDisk = (point, mode) =>
        within(point, edge) && (mode === "C" || !this.hasArt(point, edge)) &&
        !badges.some(box => nearBox(point, box) <= edge) &&
        !tips.some(tip => distance(point, tip) <= edge + tipClearance) &&
        !this.ink.some(({ path, segment }) => !(mode === "B" && own.has(path.index)) && nearSegment(point, segment) < edge + gap);

      // C is restricted to the registered large structure. All other markers
      // first try their exact text terminal, then search the surrounding space.
      if (node.originalNumberOnStructure && clearDisk(node.originalNumberOnStructure, "C"))
        return [{ mode: "C", center: node.originalNumberOnStructure }];
      const result = [];
      if (clearDisk(head, "B")) result.push({ mode: "B", center: head });
      const nearby = new Map();
      const add = p => nearby.set(p.map(n => n.toFixed(2)).join(","), p);
      const step = Math.max(3, radius / 3);
      for (let r = radius + 2; r <= 5.5 * radius; r += step) {
        const count = Math.ceil(2 * Math.PI * r / step);
        for (let i = 0; i < count; i++) {
          const angle = 2 * Math.PI * i / count;
          add([head[0] + r * Math.cos(angle), head[1] + r * Math.sin(angle)]);
        }
      }
      const rank = p => distance(p, head) - (this.masks.some(box => nearBox(p, box) === 0) ? radius : 0);
      const candidates = [...nearby.values()].filter(p => clearDisk(p, "A")).sort((a, b) => rank(a) - rank(b));
      const ink = this.ink;
      for (const center of candidates) {
        const end = perimeter(center, head, radius);
        if (this.clearLeg([head, end], head, badges, ink)) {
          result.push({ mode: "A", center, line: [head, end] });
          continue;
        }
        const [hx, hy] = head;
        const [ex, ey] = center;
        const bends = [[hx, ey], [ex, hy], [hx + (ex - hx) / 2, hy], [hx, hy + (ey - hy) / 2]];
        for (const bend of bends) {
          if (!within(bend, gap) || distance(center, bend) < radius + 1) continue;
          if (!this.clearLeg([head, bend], head, badges, ink)) continue;
          const end = perimeter(center, bend, radius);
          if (this.clearLeg([bend, end], null, badges, ink)) {
            result.push({ mode: "A", center, line: [head, bend, end] });
            break;
          }
        }
      }
      return result;
    }
    place(nodes, radius, visible, badges, shownTips, padding, tipClearance = 0) {
      const accepted = new Map();
      const clearance = this.highlightWidth + 1;
      const fits = (a, b) => distance(a.center, b.center) >= 2 * (radius + padding) &&
        !legs(a.line || []).some(segment => nearSegment(b.center, segment) <= radius + clearance) &&
        !legs(b.line || []).some(segment => nearSegment(a.center, segment) <= radius + clearance) &&
        !legs(a.line || []).some(aLeg => legs(b.line || []).some(bLeg => segmentGap(aLeg, bLeg) < clearance));
      const choices = nodes.map(node => ({
        node, positions: this.choices(node, radius, visible, badges, shownTips, padding, tipClearance),
      }));
      // Try feasible B positions before A. Eliminate incompatible positions
      // from the other nodes before descending into the next choice.
      let attempts = 0;
      function search(remaining) {
        if (!remaining.length) return true;
        remaining.sort((a, b) => Number(b.positions[0]?.mode === "B") - Number(a.positions[0]?.mode === "B") ||
          a.positions.length - b.positions.length);
        const [{ node, positions }, ...rest] = remaining;
        for (const position of positions) {
          if (++attempts > 40000) return false;
          const next = [];
          for (const slot of rest) {
            const candidates = slot.positions.filter(other => fits(position, other));
            if (!candidates.length) break;
            next.push({ node: slot.node, positions: candidates });
          }
          if (next.length !== rest.length) continue;
          accepted.set(node.id, position);
          if (search(next)) return true;
          accepted.delete(node.id);
        }
        return false;
      }
      search(choices);
      return accepted;
    }
  }
  window.OriginalLeaderLayout = OriginalLeaderLayout;
})();
