/* Offline adapter and reusable visible-state timer; no network or persistence. */
(function () {
  "use strict";
  window.CoreEvents = {
    createMock() {
      const records = [];
      return {
        records,
        explore(nodeId) {
          records.push({ type: "explore", nodeId: String(nodeId) });
        },
        answer(questionId, correct) {
          records.push({
            type: "answer",
            questionId: String(questionId),
            correct: !!correct,
          });
        },
        nodeTime(nodeId, seconds) {
          if (!Number.isFinite(seconds)) return;
          const whole = Math.min(60, Math.floor(seconds));
          if (whole > 0)
            records.push({
              type: "node_time",
              nodeId: String(nodeId),
              seconds: whole,
            });
        },
        // Proposed local extension, NOT part of the deployed course-learning.js API.
        findError(questionId, hotspotId, { mode, position }) {
          records.push({
            type: "find_error",
            questionId: String(questionId),
            hotspotId: String(hotspotId),
            mode,
            position,
          });
        },
        complete() {
          records.push({ type: "completed" });
        },
      };
    },
    createNodeTimer(
      events,
      {
        now = () => performance.now(),
        doc = document,
        win = window,
        schedule = setInterval,
        cancel = clearInterval,
      } = {},
    ) {
      let node = null,
        started = null,
        disposed = false,
        suspended = false;
      const remainder = new Map();
      const visible = () => !doc.hidden && !suspended;
      function flush() {
        if (started === null || node === null) return;
        const end = now();
        const ms = Math.max(0, end - started) + (remainder.get(node) || 0);
        const whole = Math.floor(ms / 1000);
        remainder.set(node, ms - whole * 1000);
        started = end;
        for (let left = whole; left > 0; left -= 60)
          events.nodeTime?.(node, Math.min(60, left));
      }
      function visibility() {
        flush();
        started = node !== null && visible() ? now() : null;
      }
      function pagehide() {
        suspended = true;
        visibility();
      }
      function pageshow() {
        suspended = false;
        visibility();
      }
      const timer = schedule(flush, 15000);
      doc.addEventListener("visibilitychange", visibility);
      win.addEventListener("pagehide", pagehide);
      win.addEventListener("pageshow", pageshow);
      return {
        enter(id) {
          if (disposed) return;
          const next = id == null ? null : String(id);
          if (next === node) return; // redraws and reading countdowns never reset timing
          flush();
          node = next;
          started = node !== null && visible() ? now() : null;
        },
        flush,
        dispose() {
          if (disposed) return;
          flush();
          started = null;
          node = null;
          disposed = true;
          cancel(timer);
          doc.removeEventListener("visibilitychange", visibility);
          win.removeEventListener("pagehide", pagehide);
          win.removeEventListener("pageshow", pageshow);
        },
      };
    },
  };
})();
