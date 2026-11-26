/* Runs in the stage document. Figure assets and lesson data use ordinary document loads. */
(() => {
  'use strict';
  const stageId = document.body.dataset.stage;
  const root = document.querySelector('#app');
  let started = false;
  addEventListener('message', event => {
    if (started || event.source !== parent || event.data?.type !== 'launch-stage' || !event.ports[0]) return;
    started = true;
    const port = event.ports[0];
    const send = (type, ...values) => port.postMessage({ type, values });
    const events = Object.fromEntries(['explore', 'resumeExplore', 'endExplore', 'answer', 'hint', 'findError']
      .map(type => [type, (...values) => send(type, ...values)]));
    events.nodeTime = events.complete = () => {};
    const layout = ({ height, top }) => {
      const style = document.documentElement.style;
      style.setProperty('--review-viewport-height', height + 'px');
      style.setProperty('--review-available-height', Math.max(0, height - top) + 'px');
    };
    layout(event.data);
    let scale;
    try {
      if (window.MECHANISM_LESSON_DATA) {
        const provider = window.FigureLevel;
        provider.mount(root, { lesson: window.MECHANISM_LESSON_DATA, stage: stageId,
          fontScale: event.data.scale, events, onError: () => send('error'), onPass: () => send('pass') });
        scale = n => provider.setFontScale(n);
      } else {
        const data = window.LESSON_DATA;
        const stageIndex = data.stages.findIndex(s => s.id === stageId);
        if (stageIndex < 0) throw new Error('Missing stage');
        const stage = data.stages[stageIndex];
        const nativeEmbedding = document.body.dataset.embedding === 'true';
        if (!nativeEmbedding) {
          // Legacy engines emit a full exploration ID. The shell adds the unit and level.
          const prefix = stage.nodePrefix + '-';
          events.explore = id => send('explore', id.slice(prefix.length));
        }
        if (nativeEmbedding) root.classList.add('is-embedded');
        const opts = nativeEmbedding ? { events, embedding: { stageIndex,
          fontScale: event.data.scale, onPass: () => send('pass'), onError: () => send('error') } } : { events };
        const app = new window.InteractiveCore.App(root, data, opts);
        window.PilotApp = app;
        if (!nativeEmbedding) {
          app.s.stage = stageIndex;
          app.shuffle();
          app.scale(event.data.scale, false);
          app.render();
          app.figure.probe.addEventListener('error', () => send('error'), { once: true });
          let phase, previousActive;
          new MutationObserver(() => {
            if (app.s.phase === 'find' && phase !== 'find') send('endExplore');
            if (app.s.phase === 'explore' && app.s.active && app.s.active !== previousActive) send('resumeExplore', app.s.active);
            if (app.s.phase === 'stage-done' && phase !== 'stage-done') send('pass');
            phase = app.s.phase;
            previousActive = app.s.active;
          }).observe(app.work, { childList: true });
        }
        const svg = app.figure.svg;
        const canGuide = event => data.navVersion === '3.4' && app.s.phase === 'explore' &&
          event.target.closest('[data-nav-label]');
        svg.addEventListener('click', event => {
          if (!app.figure.inspectMode && !canGuide(event)) event.stopImmediatePropagation();
        }, true);
        svg.addEventListener('keydown', event => {
          if (['Enter', ' '].includes(event.key) && !canGuide(event)) event.stopImmediatePropagation();
        }, true);
        const badges = () => {
          for (const mark of svg.querySelectorAll('[data-number-id][role="button"]')) {
            mark.setAttribute('role', 'img');
            mark.removeAttribute('tabindex');
            mark.removeAttribute('aria-disabled');
          }
        };
        new MutationObserver(badges).observe(svg, { childList: true });
        badges();
        // 進下一步的按鈕鎖住時，寫出原因並用黃框指出下一個要按的（2026-11-26 教師：每一關都加提示）。
        const gateStyle = document.createElement('style');
        gateStyle.textContent = '.gate-hint{margin:8px 0;padding:8px 10px;border-radius:6px;background:#fffbeb;color:#92400e;font-weight:700}' +
          '.gate-target{outline:3px solid #f59e0b !important;outline-offset:2px;box-shadow:0 0 0 6px rgba(245,158,11,.25)}' +
          '[data-nav-label].gate-target rect{stroke:#f59e0b;stroke-width:5}';
        document.head.append(gateStyle);
        let gateQueued = false;
        const gateGuide = () => {
          gateQueued = false;
          const start = root.querySelector('#start-find');
          const marked = root.querySelectorAll('.gate-target');
          const oldHint = root.querySelector('.gate-hint');
          let target = null, text = '';
          if (app.s.phase === 'explore' && start && start.checkVisibility()) {
            const label = start.textContent.trim();
            const guideNext = root.querySelector('#guide-next');
            if (!start.disabled) target = start;
            else if (guideNext && guideNext.checkVisibility()) {
              target = guideNext;
              text = '按「下一處」看完導覽（或按「跳過」自己點名稱），才能按「' + label + '」。';
            } else {
              const ids = app.nodes().map(node => node.id);
              const seen = ids.filter(id => app.s.seen.has(id)).length;
              const pending = (app.guideNodes ? app.guideNodes() : ids).find(id => !app.s.seen.has(id));
              if (pending) target = root.querySelector('[data-nav-label="' + pending + '"], [data-name-choice="' + pending + '"]');
              text = '每個名稱都點開看過（已看 ' + seen + '／' + ids.length + '），才能按「' + label + '」。';
            }
          }
          for (const el of marked) if (el !== target) el.classList.remove('gate-target');
          if (target && !target.classList.contains('gate-target')) target.classList.add('gate-target');
          if (!text) { oldHint?.remove(); return; }
          const holder = start.closest('.actions') || start;
          if (oldHint && oldHint.nextElementSibling === holder) {
            if (oldHint.textContent !== text) oldHint.textContent = text;
            return;
          }
          oldHint?.remove();
          const hint = document.createElement('p');
          hint.className = 'gate-hint';
          hint.setAttribute('role', 'status');
          hint.textContent = text;
          holder.before(hint);
        };
        const queueGate = () => { if (!gateQueued) { gateQueued = true; requestAnimationFrame(gateGuide); } };
        new MutationObserver(queueGate).observe(root, { childList: true, subtree: true });
        queueGate();
        scale = n => app.scale(n, false);
      }
      port.onmessage = ({ data }) => {
        layout(data);
        scale(data.scale);
      };
      new ResizeObserver(() => send('height', root.getBoundingClientRect().height)).observe(root);
      send('height', root.getBoundingClientRect().height);
      send('ready');
    } catch (error) {
      console.error(error.message);
      send('error');
    }
  });
})();
