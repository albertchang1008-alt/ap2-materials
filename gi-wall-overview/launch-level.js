/* Stage adapter for immutable figure engines. MessageChannel works inside the player sandbox. */
(() => {
  'use strict';
  let active;
  function unmount() {
    if (!active) return;
    clearTimeout(active.timeout);
    active.channel.port1.close();
    active.frame.remove();
    active = null;
  }
  function layout(session) {
    const { frame, scale } = session;
    session.channel.port1.postMessage({ scale, height: innerHeight,
      top: frame.getBoundingClientRect().top + scrollY });
  }
  addEventListener('resize', () => { if (active) layout(active); });

  window.FigureLevel = Object.freeze({
    mount(container, config) {
      unmount();
      const entry = window.LaunchStages[config.stage];
      if (!entry) return config.onError();
      const frame = document.createElement('iframe');
      frame.title = '教學圖與看圖練習';
      frame.className = 'launch-frame';
      frame.src = entry.url;
      const channel = new MessageChannel();
      const session = { frame, scale: config.fontScale, channel };
      active = session;
      const fail = () => { if (active === session) config.onError(); };
      session.timeout = setTimeout(fail, 8000);
      channel.port1.onmessage = ({ data }) => {
        if (active !== session || !data) return;
        const { type, values = [] } = data;
        if (type === 'ready') {
          clearTimeout(session.timeout);
          layout(session);
        } else if (type === 'height' && Number.isFinite(values[0]) && values[0] > 0) {
          // Phone: cap the frame at the visible area so the stage scrolls inside it and its figure stays pinned on top.
          const content = Math.ceil(values[0]);
          const avail = Math.floor(innerHeight - frame.getBoundingClientRect().top - scrollY);
          frame.style.height = (frame.clientWidth <= 600 && avail > 320 ? Math.min(content, avail) : content) + 'px';
        } else if (type === 'error') {
          fail();
        } else if (type === 'pass') {
          config.onPass();
        } else if (['explore', 'resumeExplore', 'answer', 'hint', 'findError', 'endExplore'].includes(type)) {
          if (['answer', 'hint', 'findError'].includes(type)) {
            const prefix = entry.questionPrefix;
            if (values[0].startsWith(prefix)) values[0] = values[0].slice(prefix.length);
          }
          config.events[type]?.(...values);
        }
      };
      frame.addEventListener('load', () => {
        if (active === session) {
          frame.contentWindow.postMessage({
            type: 'launch-stage', scale: session.scale, height: innerHeight,
            top: frame.getBoundingClientRect().top + scrollY,
          }, '*', [channel.port2]);
        }
      }, { once: true });
      container.append(frame);
    },
    setFontScale(scale) {
      if (active) {
        active.scale = scale;
        layout(active);
      }
    },
    unmount,
  });

  // The shared shell submits the answer and stops its timer before calling this hook.
  // Let students read the explanation before the existing progression resumes.
  addEventListener('load', () => {
    const app = window.App;
    const advance = app.advanceAssessment;
    const dialog = document.getElementById('msg-dialog');
    app.advanceAssessment = function() {
      const { assStage, assIdx } = this.state;
      const question = this.data.assessment[assStage][assIdx];
      const text = question?.feedbackCorrect;
      if (!text?.startsWith('答對了！') || text === '答對了！') return advance.call(this);
      const keepOpen = event => event.preventDefault();
      dialog.addEventListener('cancel', keepOpen);
      this.showMsgDialog(text, () => {
        dialog.removeEventListener('cancel', keepOpen);
        advance.call(this);
      });
    };
  }, { once: true });
})();
