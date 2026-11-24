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
