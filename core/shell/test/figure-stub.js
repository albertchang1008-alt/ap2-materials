/* Synthetic integration double; never loaded by production lessons. */
(() => {
  let root, button, options, finish;
  window.FigureLevel = {
    mount(container, config) {
      root = container;
      options = config;
      root.dataset.fontScale = String(config.fontScale);
      const p = document.createElement('p');
      p.className = 'text-body';
      p.textContent = '互動圖關卡（替身）';
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-primary btn-block';
      button.id = 'btn-figure-pass';
      button.textContent = '完成這關';
      finish = () => { options.events.answer('1', true); options.onPass(); };
      button.addEventListener('click', finish);
      root.append(p, button);
      options.events.explore('p1');
    },
    setFontScale(scale) { if (root) root.dataset.fontScale = String(scale); },
    unmount() {
      if (button) button.removeEventListener('click', finish);
      if (root) root.replaceChildren();
      root = button = options = finish = null;
    }
  };
})();
