/* One mounted stage per document, managed by MaterialShell. */
(() => {
  'use strict';
  let active;

  function fail(session) {
    if (active !== session) return;
    const onError = session.onError;
    unmount();
    onError?.();
  }

  async function load(session, { lesson, stage, events, onPass }) {
    try {
      const response = await fetch(new URL(lesson, document.baseURI), {
        signal: session.controller.signal
      });
      if (!response.ok) throw new Error('Figure lesson unavailable');
      const data = await response.json();
      if (active !== session) return;
      const stageIndex = data.stages.findIndex(entry => entry.id === stage);
      if (stageIndex < 0 || !data.stages[stageIndex].questions?.length) {
        throw new Error('Figure stage unavailable');
      }
      data.figure.src = new URL(data.figure.src, response.url).href;
      session.root.replaceChildren();
      session.app = new window.InteractiveCore.App(session.root, data, {
        events,
        embedding: {
          stageIndex,
          fontScale: session.fontScale,
          onPass,
          onError: () => fail(session)
        }
      });
    } catch {
      fail(session);
    }
  }

  function unmount() {
    const session = active;
    active = null;
    if (!session) return;
    session.controller.abort();
    session.app?.destroy();
    session.root.remove();
  }

  window.FigureLevel = Object.freeze({
    mount(container, config) {
      unmount();
      const root = document.createElement('section');
      root.className = 'ap2-figure is-embedded';
      root.setAttribute('aria-label', '互動圖關卡');
      root.innerHTML = '<p role="status">教學圖載入中…</p>';
      root.style.setProperty('--font-scale', String(config.fontScale));
      container.append(root);
      active = {
        root, onError: config.onError, fontScale: config.fontScale,
        controller: new AbortController(), app: null
      };
      void load(active, config);
    },
    setFontScale(scale) {
      if (!active) return;
      active.fontScale = scale;
      if (active.app) active.app.scale(scale, false);
      else active.root.style.setProperty('--font-scale', String(scale));
    },
    unmount
  });
})();
