/* FigureLevel provider for the D4 L4 gastric acid lesson. */
(() => {
  'use strict';

  const sharedLevel = window.FigureLevel;
  const scales = { small: 1, default: 1, large: 1.15, xlarge: 1.3 };
  const scaleValue = value => Number(Object.hasOwn(scales, value) ? scales[value] : value);
  let active;

  function shuffled(items) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function createApp(session, stage, { events, onPass }) {
    const { root, controller } = session;
    const select = selector => root.querySelector(selector);
    const all = selector => [...root.querySelectorAll(selector)];
    const listen = (el, event, callback) => el.addEventListener(event, callback, { signal: controller.signal });

    root.innerHTML = window.GastricAcidMarkup;
    const lesson = select('#lesson');
    const recall = select('#recall');
    const quiz = select('#acid-quiz');
    const done = select('#acid-done');
    const stepButtons = all('.steps button');
    const stepContent = all('.step-content');
    const diagram = select('#lesson .diagram');
    const quizDiagram = select('.quiz-diagram');
    const svg = diagram.querySelector('svg');
    const layers = stepButtons.map(button => svg.querySelector('#s' + button.dataset.s));
    const advance = select('#advance');
    const cards = all('.flash');
    const recalled = new Set();
    const visited = new Set();
    const beginQuiz = select('#start-quiz');
    const recallGate = select('#recall-gate');
    const returnToQuiz = select('#back-to-quiz');
    const previous = select('#prev');
    const next = select('#next');
    const quizBody = select('.quiz-body');
    let currentStep = 0;
    let currentRecall = 0;
    let quizIndex = 0;
    let quizState;
    let quizStarted = false;
    let passed = false;
    let visible = lesson;

    function display(section) {
      visible.hidden = true;
      visible = section;
      visible.hidden = false;
    }

    function nextStep() {
      if (currentStep < stepButtons.length - 1) return currentStep + 1;
      return stepButtons.findIndex((_, step) => !visited.has(step));
    }

    function showStep(index, focus = false) {
      currentStep = index;
      const track = visited.has(index) ? events?.resumeExplore : events?.explore;
      visited.add(index);
      diagram.append(svg);
      for (const [step, button] of stepButtons.entries()) {
        const selected = step === index;
        button.setAttribute('aria-pressed', String(selected));
        layers[step].setAttribute('opacity', selected ? '1' : '0');
        layers[step].setAttribute('aria-hidden', String(!selected));
        stepContent[step].hidden = !selected;
      }
      svg.setAttribute('aria-describedby', index === 3 ? 'acid-teacher-note' : 'step-' + (index + 1));
      const upcoming = nextStep();
      advance.textContent = upcoming < 0 ? '開始回想' : '看第 ' + (upcoming + 1) + ' 步';
      track?.('p' + (index + 1));
      if (focus) stepButtons[index].focus();
    }

    function showRecall(index) {
      cards[currentRecall].hidden = true;
      currentRecall = index;
      cards[index].hidden = false;
      previous.disabled = index === 0;
      next.textContent = index === cards.length - 1 ? '回到第一題' : '下一題';
      updateRecallGate();
      cards[index].querySelector('h2').focus();
    }

    // 看完每張白話解答才開放看圖題；鎖住時說明原因，並以黃框指出下一個該按的按鈕。
    function updateRecallGate() {
      const total = cards.length;
      const ready = recalled.size === total;
      beginQuiz.disabled = !ready;
      recallGate.hidden = ready;
      recallGate.textContent = ready ? '' : `每張都按「看白話解答」後，才能開始看圖題（已看 ${recalled.size}／${total}）。`;
      for (const el of [...cards.map(card => card.querySelector('.flip')), next, beginQuiz]) el.classList.remove('gate-target');
      if (ready) beginQuiz.classList.add('gate-target');
      else if (!recalled.has(currentRecall)) cards[currentRecall].querySelector('.flip').classList.add('gate-target');
      else next.classList.add('gate-target');
    }

    stepButtons.forEach((button, index) => listen(button, 'click', () => showStep(index)));
    listen(advance, 'click', () => {
      const upcoming = nextStep();
      if (upcoming >= 0) {
        showStep(upcoming, true);
        return;
      }
      events?.endExplore?.();
      display(recall);
      updateRecallGate();
      select('#recall-title').focus();
    });
    listen(select('#back-to-lesson'), 'click', () => {
      display(lesson);
      showStep(currentStep, true);
    });
    listen(previous, 'click', () => showRecall(currentRecall - 1));
    listen(next, 'click', () => {
      // 還有沒看過解答的卡片時，直接跳到下一張未看的。
      const pending = cards.map((_, i) => (currentRecall + 1 + i) % cards.length).find(i => !recalled.has(i));
      showRecall(pending ?? (currentRecall + 1) % cards.length);
    });

    for (const [index, card] of cards.entries()) {
      const flip = card.querySelector('.flip');
      const reply = card.querySelector('.reply');
      listen(flip, 'click', () => {
        reply.hidden = !reply.hidden;
        flip.setAttribute('aria-expanded', String(!reply.hidden));
        flip.textContent = reply.hidden ? '看白話解答' : '收起白話解答';
        if (!reply.hidden) recalled.add(index);
        updateRecallGate();
      });
    }

    const zoom = select('#zoom');
    const zoomFrame = select('.zoom-frame');
    let zoomTrigger;
    const openZoom = event => {
      zoomTrigger = event.currentTarget;
      zoomFrame.append(svg);
      zoom.showModal();
      zoomFrame.scrollLeft = 0;
    };
    listen(select('#show-zoom'), 'click', openZoom);
    listen(select('#quiz-zoom'), 'click', openZoom);
    listen(select('#close-zoom'), 'click', () => zoom.close());
    listen(zoom, 'close', () => {
      (visible === quiz ? quizDiagram : diagram).append(svg);
      zoomTrigger.focus();
    });

    function showQuiz() {
      events?.endExplore?.();
      for (const layer of layers) {
        layer.setAttribute('opacity', '0');
        layer.setAttribute('aria-hidden', 'true');
      }
      svg.removeAttribute('aria-describedby');
      quizDiagram.append(svg);
      display(quiz);
      select('.quiz-prompt').focus();
    }

    function prepareQuestion() {
      const question = stage.questions[quizIndex];
      quizState = {
        question,
        choices: shuffled(question.items || question.options),
        picked: [],
        result: null
      };
      renderQuestion();
    }

    function renderQuestion() {
      const { question, choices, picked, result } = quizState;
      const order = question.mode === 'order';
      const available = order ? choices.filter(choice => !picked.includes(choice.id)) : choices;
      const ordered = order ? picked.map(id => choices.find(choice => choice.id === id)) : [];
      const ready = order ? picked.length === choices.length : picked.length > 0;

      quizBody.innerHTML = '<h2 class="quiz-prompt" tabindex="-1"></h2><ol class="quiz-order"></ol>' +
        '<div class="quiz-options" role="group" aria-label="作答選項"></div><div class="quiz-actions"></div>';
      select('.quiz-prompt').textContent = `${quizIndex + 1} / ${stage.questions.length}　${question.prompt}`;
      for (const choice of ordered) {
        const item = document.createElement('li');
        item.textContent = choice.text;
        select('.quiz-order').append(item);
      }
      for (const choice of available) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.choice = choice.id;
        button.textContent = choice.text;
        button.disabled = result !== null;
        if (!order) button.setAttribute('aria-pressed', String(result === null && picked.includes(choice.id)));
        select('.quiz-options').append(button);
      }

      const actions = select('.quiz-actions');
      if (result === null) {
        actions.innerHTML = '<button type="button" data-action="submit" class="primary">確定答案</button>';
        select('[data-action="submit"]').disabled = !ready;
        if (order && picked.length) {
          actions.insertAdjacentHTML('afterbegin', '<button type="button" data-action="reset">重選順序</button>');
        }
        return;
      }
      actions.innerHTML = '<p class="quiz-feedback" role="status"></p><button type="button" class="primary"></button>';
      select('.quiz-feedback').textContent = result ? question.feedbackCorrect : question.feedbackWrong;
      const action = actions.querySelector('button');
      action.dataset.action = result ? 'next' : 'retry';
      action.textContent = result
        ? (quizIndex + 1 === stage.questions.length ? '完成本關' : '下一題')
        : '再試一次';
    }

    function submitAnswer() {
      const { question, picked } = quizState;
      const expected = question.expectedOrder || question.options.filter(choice => choice.correct).map(choice => choice.id);
      const correct = picked.length === expected.length && (
        question.mode === 'order' ? picked.every((id, index) => id === expected[index]) : expected.every(id => picked.includes(id))
      );
      quizState.result = correct;
      events?.answer?.(question.id, correct);
      renderQuestion();
      select('.quiz-actions button').focus();
    }

    listen(quizBody, 'click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      const { choice, action } = button.dataset;
      if (choice) {
        const { question, picked } = quizState;
        quizState.picked = question.mode === 'single' ? [choice] :
          (picked.includes(choice) ? picked.filter(id => id !== choice) : [...picked, choice]);
        renderQuestion();
        (select(`[data-choice="${choice}"]`) || select('[data-choice]:first-child') ||
          select('[data-action="submit"]')).focus();
      } else if (action === 'submit') {
        submitAnswer();
      } else if (action === 'reset' || action === 'retry') {
        if (action === 'retry') prepareQuestion();
        else {
          quizState.picked = [];
          renderQuestion();
        }
        select('[data-choice]').focus();
      } else if (action === 'next') {
        quizIndex += 1;
        if (quizIndex < stage.questions.length) {
          prepareQuestion();
          select('.quiz-prompt').focus();
        } else {
          display(done);
          done.querySelector('h2').focus();
          if (!passed) {
            passed = true;
            onPass?.();
          }
        }
      }
    });

    listen(beginQuiz, 'click', () => {
      if (!quizStarted) {
        quizStarted = true;
        prepareQuestion();
      }
      showQuiz();
    });
    listen(select('#review-steps'), 'click', () => {
      display(lesson);
      returnToQuiz.hidden = false;
      showStep(currentStep, true);
    });
    listen(returnToQuiz, 'click', showQuiz);
    listen(select('#replay'), 'click', () => {
      quizStarted = false;
      quizIndex = 0;
      returnToQuiz.hidden = true;
      display(lesson);
      showStep(0, true);
    });
    showStep(0);
  }

  function unmount() {
    const session = active;
    active = null;
    if (!session) return;
    session.controller.abort();
    session.root.remove();
  }

  async function load(session, config) {
    try {
      let data = config.lesson;
      if (typeof data === 'string') {
        const response = await fetch(new URL(data, document.baseURI), { signal: session.controller.signal });
        if (!response.ok) throw new Error('Figure lesson unavailable');
        data = await response.json();
      }
      if (active !== session) return;
      const stage = data?.stages?.find(entry => entry.id === config.stage);
      if (data?.id !== 'd4-l4-gastric-acid' || data.schemaVersion !== 2 || !stage?.questions?.length ||
          typeof window.GastricAcidMarkup !== 'string') {
        throw new Error('Gastric acid lesson unavailable');
      }
      createApp(session, stage, config);
    } catch {
      if (active !== session) return;
      unmount();
      config.onError?.();
    }
  }

  const gastricLevel = Object.freeze({
    mount(container, config) {
      unmount();
      const root = document.createElement('section');
      root.className = 'acid-level';
      root.setAttribute('aria-label', '胃酸怎麼來');
      root.innerHTML = '<p role="status">教學圖載入中…</p>';
      const controller = new AbortController();
      active = { root, controller };
      this.setFontScale(config.fontScale);
      container.append(root);
      void load(active, config);
    },
    setFontScale(value) {
      const scale = scaleValue(value);
      active?.root.style.setProperty('--font-scale', String(Number.isFinite(scale) ? Math.max(1, scale) : 1));
    },
    unmount
  });

  if (!sharedLevel) {
    window.FigureLevel = gastricLevel;
    return;
  }

  // The shell only calls one provider. Retain the shared one for all other stages.
  let mounted;
  window.FigureLevel = Object.freeze({
    mount(container, config) {
      const { lesson, stage } = config;
      const route = typeof lesson === 'string' ? new URL(lesson, document.baseURI).pathname : '';
      const provider = stage === 'L4' && /\/gastric-acid\/lesson\.json$/.test(route) ? gastricLevel : sharedLevel;
      this.unmount();
      mounted = provider;
      provider.mount(container, config);
    },
    setFontScale(scale) { mounted?.setFontScale(scale); },
    unmount() {
      const previous = mounted;
      mounted = null;
      previous?.unmount();
    }
  });
})();
