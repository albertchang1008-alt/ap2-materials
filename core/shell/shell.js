/* Shared post-midterm shell. Content must be supplied separately. */
(() => {
  'use strict';
/* Shared adapter installed by shell.js; this file is not shipped as a separate dependency. */
function installFigureLevels(App) {
  let active = null;
  const scaleMap = { small: 1, default: 1, large: 1.15, xlarge: 1.3 };
  const scaleValue = value => Math.max(1, Number(scaleMap[value] ?? value) || 1);
  const currentScale = () => scaleValue(getComputedStyle(document.documentElement).getPropertyValue('--font-scale'));
  const syncStorage = () => {
    try {
      const v = localStorage.getItem('course-font-scale');
      if (v !== null) document.documentElement.style.setProperty('--font-scale', String(scaleValue(v)));
    } catch { /* Sandboxed documents may disable localStorage. */ }
  };
  syncStorage();
  addEventListener('storage', event => { if (event.key === 'course-font-scale' || event.key === null) syncStorage(); });
  new MutationObserver(() => {
    const raw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale'));
    if (raw < 1) document.documentElement.style.setProperty('--font-scale', '1');
    const fontScale = currentScale();
    if (fontScale < 1) return;
    if (active && active.fontScale !== fontScale) {
      active.fontScale = fontScale;
      active.core.setFontScale(fontScale);
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
  const dispose = () => {
    if (!active) return;
    const previous = active;
    active = null; // Invalidate asynchronous onPass/events before core cleanup.
    previous.core.unmount();
    App.trackTime(null);
  };
  const render = App.render;
  App.render = function() {
    const level = this.data.levels[this.state.levelIdx];
    if (active && (this.state.phase !== 'TEACH' || active.level !== level)) dispose();
    return render.call(this);
  };
  const teach = App.renderTeach;
  App.renderTeach = function(view, level) {
    if (level.kind !== 'figure') return teach.call(this, view, level);
    if (active?.level === level) return;
    view.replaceChildren();
    const core = window.FigureLevel;
    if (!core || !['mount','setFontScale','unmount'].every(k => typeof core[k] === 'function')) {
      throw new Error('FigureLevel mount/setFontScale/unmount required');
    }
    if (!level.figure?.lesson || !level.figure?.stage) throw new Error('figure.lesson and figure.stage required');
    const token = { level, core, fontScale: currentScale() };
    active = token;
    const prefix = this.data.slug;
    const questionPrefix = `${prefix}-level-${this.state.levelIdx + 1}-`;
    const nodePrefix = `${prefix}-node-${level.id}-`;
    const local = id => {
      if (typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id)) throw new Error('local tracking suffix required');
      return id;
    };
    const events = Object.freeze({
      explore: id => {
        if (active !== token) return;
        const nodeId = nodePrefix + local(id);
        window.CourseLearning.explore(nodeId);
        this.trackTime(nodeId);
      },
      answer: (id, correct) => { if (active === token) window.CourseLearning.answer(questionPrefix + local(id), !!correct); },
      hint: id => { if (active === token) window.CourseLearning.hint(questionPrefix + local(id)); },
      nodeTime: (id, seconds) => { if (active === token) window.CourseLearning.nodeTime(nodePrefix + local(id), seconds); }
    });
    try {
      core.mount(view, {
        lesson: level.figure.lesson, stage: level.figure.stage,
        fontScale: token.fontScale, events, trackingPrefix: prefix,
        onPass: () => {
          if (active !== token || this.state.phase !== 'TEACH' || this.data.levels[this.state.levelIdx] !== level) return;
          this.setPhase('LEVEL_PASS');
        }
      });
    } catch (error) { dispose(); throw error; }
  };
}

  function mount(DATA) {
    if (window.App) throw new Error('MaterialShell supports one mount per document');
    document.body.insertAdjacentHTML('afterbegin', "\n  <div class=\"app-shell\" id=\"app\">\n    <!-- Header -->\n    <header class=\"header-bar\" id=\"app-header\">\n      <div class=\"header-top\">\n        <span class=\"header-label\" id=\"hdr-stage\">載入中</span>\n        <span class=\"header-step\" id=\"hdr-step\"></span>\n      </div>\n      <div class=\"progress-track\">\n        <div class=\"progress-fill\" id=\"hdr-progress\"></div>\n      </div>\n      <div class=\"timer-wrap\" id=\"timer-box\" style=\"display: none;\">\n        <div class=\"timer-track\">\n          <div class=\"timer-fill\" id=\"timer-fill\"></div>\n        </div>\n        <div class=\"timer-text\" id=\"timer-text\">剩下 0 秒</div>\n      </div>\n    </header>\n\n    <!-- Main View Area -->\n    <main class=\"main-content\" id=\"app-view\">\n      <!-- Dynamic views will render here -->\n    </main>\n\n    <!-- Legend Sample Dialog -->\n    <dialog class=\"modal-sheet\" id=\"legend-dialog\">\n      <div class=\"modal-body\">\n        <h3 class=\"title-stem\" id=\"legend-dlg-title\">放大圖例</h3>\n        <p class=\"text-sm text-muted\" id=\"legend-dlg-hint\">請查看全部圖例，再按「圖例看完了」。</p>\n        <div class=\"modal-samples-list\" id=\"legend-dlg-list\"></div>\n        <button class=\"btn btn-primary btn-block\" type=\"button\" id=\"btn-legend-confirm\">圖例看完了</button>\n      </div>\n    </dialog>\n\n    <!-- Fail / Message Dialog -->\n    <dialog class=\"modal-sheet\" id=\"msg-dialog\">\n      <div class=\"modal-body\">\n        <h3 class=\"title-stem\" id=\"msg-dlg-title\">提示</h3>\n        <p class=\"text-body\" id=\"msg-dlg-content\"></p>\n        <button class=\"btn btn-primary btn-block\" type=\"button\" id=\"btn-msg-confirm\">確定</button>\n      </div>\n    </dialog>\n  </div>");


    // Global SDK Fallback if not inside iframe or standalone
    if (!window.CourseLearning) {
      console.error('[CourseLearning SDK Missing] course-learning.js not loaded. Event reporting disabled.');
      window.CourseLearning = {
        explore(id) { console.error('[CourseLearning SDK Missing] Event dropped: explore', id); },
        answer(id, ok) { console.error('[CourseLearning SDK Missing] Event dropped: answer', id, ok); },
        hint(id) { console.error('[CourseLearning SDK Missing] Event dropped: hint', id); },
        nodeTime(id, s) { console.error('[CourseLearning SDK Missing] Event dropped: nodeTime', id, s); },
        complete() { console.error('[CourseLearning SDK Missing] Event dropped: complete'); }
      };
    }

    const READ_CHARS_PER_SEC = 15;
    const READ_MAX_SEC = 6;
    const GATE_VERSION = '1.0.0';

    function gate(config) {
      const isLocked = typeof config.locked === 'function' ? config.locked() : !!config.locked;
      return {
        locked: isLocked,
        unlocked: !isLocked,
        hint: typeof config.hint === 'function' ? config.hint() : (config.hint || ''),
        check(onPass) {
          if (isLocked) {
            if (typeof config.onLockedTap === 'function') {
              config.onLockedTap();
            }
            return false;
          }
          if (typeof onPass === 'function') {
            onPass();
          }
          return true;
        }
      };
    }

    // State Machine & Controller
    const App = {
      data: DATA,
      ui: DATA.ui,
      state: {
        phase: 'OPENING',
        levelIdx: 0,
        stateIdx: 0,
        seenStates: new Set(),
        seenLegends: new Set(),
        globalSeenTeach: new Set(),
        globalSeenLegends: new Set(),
        guideTargetStateIdx: null,
        guideTargetSubIdx: null,
        legendDwellSec: 0,
        retryDwellSec: 0,
        explainSeenMap: {},
        isLegendExpanded: false,
        isZoomed: false,
        // Quiz state
        questionIdx: 0,
        quizSubStateIdx: 0,
        quizAnswerLocked: false,
        matchAnswers: {},
        matchLockedRows: new Set(),
        multiSelections: new Set(),
        orderPicks: [],
        currentOptions: [],
        feedback: null,
        selectedOptId: null,
        selectedTfVal: null,
        selectedEndOptId: null,
        selectedAssOptId: null,
        activeReadingKey: null,
        readingTimer: null,
        readingDuration: 0,
        legendTimer: null,
        retryTimer: null,
        // Ending state
        endingStepIdx: 0,
        // TrueFalse state
        tfIdx: 0,
        // Assessment state
        assStage: 'foundation',
        assIdx: 0,
        assTimer: null,
        assTimeLeft: 0,
        assTimeTotal: 0,
        // Time tracking
        currentNodeId: null,
        nodeEnterTime: Date.now()
      },

      init() {
        this.render();
      },

      trackTime(newNodeId) {
        const now = Date.now();
        if (this.state.currentNodeId) {
          const elapsed = Math.floor((now - this.state.nodeEnterTime) / 1000);
          if (elapsed > 0) {
            window.CourseLearning.nodeTime(this.state.currentNodeId, Math.min(60, elapsed));
          }
        }
        this.state.currentNodeId = newNodeId;
        this.state.nodeEnterTime = now;
      },

      setPhase(newPhase) {
        this.state.phase = newPhase;
        this.render();
      },

      render() {
        const view = document.getElementById('app-view');
        const hdrStage = document.getElementById('hdr-stage');
        const hdrStep = document.getElementById('hdr-step');
        const hdrProgress = document.getElementById('hdr-progress');
        const timerBox = document.getElementById('timer-box');
        timerBox.style.display = 'none';

        switch (this.state.phase) {
          case 'OPENING':
            hdrStage.textContent = this.ui.opening;
            hdrStep.textContent = '';
            hdrProgress.style.width = '0%';
            this.renderOpening(view);
            break;

          case 'TEACH':
            const currentLevel = this.data.levels[this.state.levelIdx];
            const lvlTotal = this.data.levels.length;
            hdrStage.textContent = this.ui.levelTab.replace('{n}', this.state.levelIdx + 1);
            hdrStep.textContent = `${this.state.levelIdx + 1} / ${lvlTotal}`;
            hdrProgress.style.width = `${((this.state.levelIdx) / (lvlTotal + 4)) * 100}%`;
            this.renderTeach(view, currentLevel);
            break;

          case 'QUIZ':
            const qLevel = this.data.levels[this.state.levelIdx];
            const qTotal = qLevel.questions.length;
            hdrStage.textContent = this.ui.levelTab.replace('{n}', this.state.levelIdx + 1);
            hdrStep.textContent = `${this.ui.questionHeader.replace('{n}', this.state.questionIdx + 1).replace('{total}', qTotal)}`;
            hdrProgress.style.width = `${((this.state.levelIdx + (this.state.questionIdx / qTotal)) / (this.data.levels.length + 4)) * 100}%`;
            this.renderQuiz(view, qLevel);
            break;

          case 'LEVEL_PASS':
            hdrStage.textContent = this.ui.passTitle.replace('{n}', this.state.levelIdx + 1);
            hdrStep.textContent = '';
            hdrProgress.style.width = `${((this.state.levelIdx + 1) / (this.data.levels.length + 4)) * 100}%`;
            this.renderLevelPass(view);
            break;

          case 'ENDING':
            hdrStage.textContent = this.ui.ending;
            hdrStep.textContent = `${this.state.endingStepIdx + 1} / ${this.data.ending.steps.length}`;
            hdrProgress.style.width = '75%';
            this.renderEnding(view);
            break;

          case 'TRUEFALSE':
            hdrStage.textContent = this.ui.truefalse;
            hdrStep.textContent = `${this.state.tfIdx + 1} / ${this.data.truefalse.length}`;
            hdrProgress.style.width = '85%';
            this.renderTrueFalse(view);
            break;

          case 'ASSESSMENT':
            timerBox.style.display = 'block';
            const isCase = this.state.assStage === 'case';
            const list = isCase ? this.data.assessment.case : this.data.assessment.foundation;
            hdrStage.textContent = isCase ? this.ui.case : this.ui.foundation;
            hdrStep.textContent = `${this.state.assIdx + 1} / ${list.length}`;
            hdrProgress.style.width = isCase ? '95%' : '90%';
            this.renderAssessment(view, list[this.state.assIdx]);
            break;

          case 'COMPLETE':
            hdrStage.textContent = this.ui.complete;
            hdrStep.textContent = '';
            hdrProgress.style.width = '100%';
            this.renderComplete(view);
            break;
        }
      },

      renderOpening(view) {
        this.trackTime(null);
        view.innerHTML = `
          <div style="margin-top: 24px;">
            <h1 class="title-lg" style="color: var(--primary);">${this.data.title}</h1>
          </div>
          <div class="caption-box" style="margin-top: 16px;">
            <p class="text-body">${this.data.opening.prompt}</p>
          </div>
          <div class="actions-bar">
            <button class="btn btn-primary btn-block" type="button" id="btn-start">${this.ui.start}</button>
          </div>
        `;
        document.getElementById('btn-start').onclick = () => {
          this.state.levelIdx = 0;
          this.startLevel(0);
        };
      },

      showToast(msg) {
        let t = document.getElementById('gate-toast');
        if (!t) {
          t = document.createElement('div');
          t.id = 'gate-toast';
          t.className = 'gate-toast';
          document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        if (this._toastTimer) clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
          t.classList.remove('show');
        }, 2200);
      },

      triggerGateWiggle(target) {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        let arrow = el ? el.querySelector('.gate-arrow, .gate-arrow-down') : null;
        if (!arrow && el && el.parentElement) {
          arrow = el.parentElement.querySelector('.gate-arrow, .gate-arrow-down');
        }
        const targetArrow = arrow || document.querySelector('.gate-arrow, .gate-arrow-down');
        if (targetArrow) {
          targetArrow.classList.remove('wiggle');
          void targetArrow.offsetWidth;
          targetArrow.classList.add('wiggle');
        }
      },

      startLevel(idx) {
        this.state.levelIdx = idx;
        this.state.stateIdx = 0;
        this.state.seenStates = new Set();
        this.state.seenLegends = new Set();
        const lvl = this.data.levels[idx];
        if (lvl && lvl.states) {
          lvl.states.forEach((s, sIdx) => {
            if (this.isTeachSeen(idx, sIdx)) {
              this.state.seenStates.add(sIdx);
            }
            if (this.isLegendSeen(idx, sIdx)) {
              this.state.seenLegends.add(sIdx);
            }
          });
        }
        this.clearActiveReading();
        this.state.isLegendExpanded = false;
        this.state.isZoomed = false;
        this.state.guideTargetStateIdx = null;
        this.state.questionIdx = 0;
        this.state.feedback = null;
        this.state.selectedOptId = null;
        this.setPhase('TEACH');
      },

      isTeachSeen(levelIdx, stateIdx) {
        const key = `${levelIdx}_${stateIdx}`;
        return !!(this.state.globalSeenTeach && this.state.globalSeenTeach.has(key));
      },

      markTeachSeen(levelIdx, stateIdx) {
        const key = `${levelIdx}_${stateIdx}`;
        if (!this.state.globalSeenTeach) this.state.globalSeenTeach = new Set();
        this.state.globalSeenTeach.add(key);
      },

      getLegendStorageKey(levelIdx, stateIdx) {
        const lvl = this.data.levels[levelIdx];
        const st = lvl && lvl.states && lvl.states[stateIdx];
        if (st && st.legendKey) return String(st.legendKey);
        if (st && Array.isArray(st.legends) && st.legends.length > 0) {
          return 'legend_' + st.legends.map(lg => `${lg.num || ''}:${lg.name || ''}:${lg.func || ''}:${(lg.sample && (lg.sample.img || lg.sample.pending)) || ''}`).join('|');
        }
        return `level_${lvl ? lvl.id : levelIdx}`;
      },

      isLegendSeen(levelIdx, stateIdx) {
        const key = this.getLegendStorageKey(levelIdx, stateIdx);
        if (this.state.globalSeenLegends && this.state.globalSeenLegends.has(key)) {
          return true;
        }
        try {
          const storeKey = `seenLegend_${this.data.activityId || 'ag'}_${key}`;
          if (localStorage.getItem(storeKey) === '1') {
            if (!this.state.globalSeenLegends) this.state.globalSeenLegends = new Set();
            this.state.globalSeenLegends.add(key);
            return true;
          }
        } catch (e) {}
        return false;
      },

      markLegendSeen(levelIdx, stateIdx) {
        const key = this.getLegendStorageKey(levelIdx, stateIdx);
        if (!this.state.globalSeenLegends) this.state.globalSeenLegends = new Set();
        this.state.globalSeenLegends.add(key);
        try {
          const storeKey = `seenLegend_${this.data.activityId || 'ag'}_${key}`;
          localStorage.setItem(storeKey, '1');
        } catch (e) {}
        const lvl = this.data.levels[this.state.levelIdx];
        if (lvl && lvl.states && this.state.seenLegends) {
          lvl.states.forEach((s, sIdx) => {
            if (this.isLegendSeen(this.state.levelIdx, sIdx)) {
              this.state.seenLegends.add(sIdx);
            }
          });
        }
      },

      calcDwellTime(text, minSec, maxSec = READ_MAX_SEC) {
        const chars = (text || '').replace(/\s+/g, '').length;
        return Math.min(maxSec, Math.max(minSec, Math.ceil(chars / READ_CHARS_PER_SEC)));
      },

      clearActiveReading() {
        if (this.state.readingTimer) {
          clearTimeout(this.state.readingTimer);
          this.state.readingTimer = null;
        }
        this.state.activeReadingKey = null;
        this.state.readingDuration = 0;
      },

      startTeachReading(idx, text) {
        this.clearActiveReading();
        const sec = this.calcDwellTime(text, 2, READ_MAX_SEC);
        const key = `teach_${this.state.levelIdx}_${idx}`;
        this.state.activeReadingKey = key;
        this.state.readingDuration = sec;
        this.state.readingTimer = setTimeout(() => {
          this.state.seenStates.add(idx);
          this.markTeachSeen(this.state.levelIdx, idx);
          this.clearActiveReading();
          this.render();
        }, sec * 1000);
      },

      startExplainReading(qId, subIdx, text) {
        this.clearActiveReading();
        const sec = this.calcDwellTime(text, 2, READ_MAX_SEC);
        const key = `explain_${qId}_${subIdx}`;
        this.state.activeReadingKey = key;
        this.state.readingDuration = sec;
        this.state.readingTimer = setTimeout(() => {
          this.markExplainSeen(qId, subIdx);
          this.clearActiveReading();
          this.render();
        }, sec * 1000);
      },

      startRetryCountdown(btnId, text) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        let sec = this.calcDwellTime(text, 2, READ_MAX_SEC);
        this.state.retryDwellSec = sec;
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('gate-locked');
        btn.textContent = `${this.ui.retry} (${sec})`;
        if (this.state.retryTimer) clearInterval(this.state.retryTimer);
        this.state.retryTimer = setInterval(() => {
          sec--;
          this.state.retryDwellSec = sec;
          const curBtn = document.getElementById(btnId);
          if (!curBtn) {
            clearInterval(this.state.retryTimer);
            return;
          }
          if (sec > 0) {
            curBtn.setAttribute('aria-disabled', 'true');
            curBtn.classList.add('gate-locked');
            curBtn.textContent = `${this.ui.retry} (${sec})`;
          } else {
            clearInterval(this.state.retryTimer);
            this.state.retryDwellSec = 0;
            curBtn.removeAttribute('aria-disabled');
            curBtn.classList.remove('gate-locked');
            curBtn.textContent = this.ui.retry;
          }
        }, 1000);
      },

      getExplainSeen(qId) {
        if (!this.state.explainSeenMap) this.state.explainSeenMap = {};
        if (!this.state.explainSeenMap[qId]) {
          const s = new Set();
          try {
            const storeKey = `seenExplain_${this.data.activityId || 'ag'}_${qId}`;
            const saved = localStorage.getItem(storeKey);
            if (saved) {
              JSON.parse(saved).forEach(x => s.add(Number(x)));
            }
          } catch (e) {}
          this.state.explainSeenMap[qId] = s;
        }
        return this.state.explainSeenMap[qId];
      },

      markExplainSeen(qId, subIdx) {
        const s = this.getExplainSeen(qId);
        s.add(Number(subIdx));
        try {
          const storeKey = `seenExplain_${this.data.activityId || 'ag'}_${qId}`;
          localStorage.setItem(storeKey, JSON.stringify(Array.from(s)));
        } catch (e) {}
      },

      renderOverlaysSvg(overlays) {
        if (!overlays || !overlays.viewBox || !Array.isArray(overlays.items)) return '';
        const [vx, vy, vw, vh] = overlays.viewBox;
        const shapesHtml = overlays.items.map(item => {
          if (item.type === 'region' && Array.isArray(item.shapes)) {
            return item.shapes.map(poly => {
              const pts = poly.map(p => `${p[0]},${p[1]}`).join(' ');
              return `<polygon points="${pts}" fill="rgba(2, 132, 199, 0.22)" stroke="#0284c7" stroke-width="4" stroke-dasharray="6,4" />`;
            }).join('');
          }
          if (item.type === 'arrow' && Array.isArray(item.paths)) {
            return item.paths.map(line => {
              if (line.length >= 2) {
                const p1 = line[0], p2 = line[1];
                return `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#0284c7" stroke-width="6" stroke-linecap="round" />`;
              }
              return '';
            }).join('');
          }
          if (item.type === 'segment' && Array.isArray(item.paths)) {
            return item.paths.map(seg => {
              const pts = seg.map(p => `${p[0]},${p[1]}`).join(' ');
              return `<polyline points="${pts}" fill="none" stroke="#0284c7" stroke-width="${item.width || 6}" stroke-linecap="round" stroke-linejoin="round" />`;
            }).join('');
          }
          return '';
        }).join('');

        return `
          <svg class="overlay-svg" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">
            ${shapesHtml}
          </svg>
        `;
      },

      renderTeach(view, level) {
        const states = level.states || [];
        const currentState = states[this.state.stateIdx] || {};

        // Start reading timer for current state if not yet seen
        if (this.isTeachSeen(this.state.levelIdx, this.state.stateIdx)) {
          this.state.seenStates.add(this.state.stateIdx);
        }
        if (states.length > 0 && !this.state.seenStates.has(this.state.stateIdx)) {
          const readingKey = `teach_${this.state.levelIdx}_${this.state.stateIdx}`;
          if (this.state.activeReadingKey !== readingKey) {
            this.startTeachReading(this.state.stateIdx, currentState.caption || '');
          }
        }

        // Track explore only if user has interacted with this state, or immediately if noFigure level
        const trackingNodes = this.data.tracking?.nodeIds || [];
        if (level.noFigure && level.nodeId && trackingNodes.includes(level.nodeId)) {
          window.CourseLearning.explore(level.nodeId);
          this.trackTime(level.nodeId);
        } else if (currentState.nodeId && this.state.seenStates.has(this.state.stateIdx)) {
          window.CourseLearning.explore(currentState.nodeId);
          this.trackTime(currentState.nodeId);
        }

        const hasFocus = Array.isArray(currentState.focus) && currentState.focus.length === 4;
        const [x1, y1, x2, y2] = hasFocus ? currentState.focus : [0, 0, 1, 1];
        const originX = ((x1 + x2) / 2) * 100;
        const originY = ((y1 + y2) / 2) * 100;
        const scaleVal = Math.min(3, 1 / Math.max(x2 - x1, y2 - y1, 0.25));

        const allStatesSeen = states.every((_, idx) => this.state.seenStates.has(idx));
        const requiredLegendSeen = (currentState.legendMode !== 'required') || this.isLegendSeen(this.state.levelIdx, this.state.stateIdx);
        const canStartQuiz = allStatesSeen && requiredLegendSeen;
        const isLocked = (currentState.legendMode === 'required') && !requiredLegendSeen;

        // Gate 1: Required Legend Gate
        const legendGate = gate({
          locked: isLocked,
          hint: `👉 先按黃框的「${this.ui.legendRead}」，認識圖中每種符號，才能切換下一張圖。`,
          onLockedTap: () => {
            this.showToast('要先看圖例喔！已幫你打開圖例 ↓');
            this.openLegendDialog(currentState.legends);
            this.triggerGateWiggle('btn-open-legend');
          }
        });

        // Gate 2: All States Seen Gate
        const remainingStates = states.length - this.state.seenStates.size;
        const firstUnseenIdx = states.findIndex((_, idx) => !this.state.seenStates.has(idx));
        const quizGate = gate({
          locked: !allStatesSeen,
          hint: `還有 ${remainingStates} 張圖沒看`,
          onLockedTap: () => {
            this.showToast(`還有 ${remainingStates} 張圖沒看`);
            if (firstUnseenIdx >= 0) {
              this.state.guideTargetStateIdx = firstUnseenIdx;
              this.render();
              const targetEl = document.querySelector(`[data-state-idx="${firstUnseenIdx}"]`);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                this.triggerGateWiggle(targetEl);
              }
            }
          }
        });

        // Legends HTML (Handles both numbered and particle/sample legends)
        let legendsHtml = '';
        const legendsList = currentState.legends || [];
        if (legendsList.length > 0) {
          const isCollapsible = legendsList.length > 5;
          const isExpanded = !isCollapsible || this.state.isLegendExpanded;

          const rows = legendsList.map(lg => {
            const isHighlight = currentState.highlightNums && (currentState.highlightNums.includes(lg.num) || currentState.highlightNums.includes(lg.name));
            let sampleBox = '';
            if (lg.sample) {
              if (lg.sample.img) {
                sampleBox = `<div class="legend-sample-thumb"><img src="${lg.sample.img}" alt="${lg.name}"></div>`;
              } else {
                sampleBox = `<div class="legend-sample-thumb pending"><span>${this.ui.legendUnavailable}</span></div>`;
              }
            }
            return `
              <div class="legend-row ${isHighlight ? 'highlight' : ''}">
                ${lg.num ? `<span class="legend-num">${lg.num}</span>` : sampleBox}
                <span class="legend-name" style="font-weight: 600;">${lg.name}</span>
                ${lg.func ? `<span class="text-sm text-muted">(${lg.func})</span>` : ''}
              </div>
            `;
          }).join('');

          legendsHtml = `
            <div class="legends-container">
              <div class="legend-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="legend-title">${this.ui.legendHeading}</span>
                ${currentState.legendMode === 'required' ? `
                  <div class="gate-legend-action-box" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                    ${isLocked ? `
                      <svg class="gate-arrow" viewBox="0 0 110 56" aria-hidden="true">
                        <path d="M4 28h78" stroke="#f59e0b" stroke-width="10" stroke-linecap="round"/>
                        <path d="M70 8l32 20-32 20z" fill="#f59e0b"/>
                      </svg>
                    ` : ''}
                    <button class="btn ${isLocked ? 'gate-target-ring' : ''}" type="button" id="btn-open-legend" style="min-height: 44px; padding: 6px 14px; font-size: calc(18px * var(--font-scale, 1));">
                      ${requiredLegendSeen ? this.ui.legendReadDone : this.ui.legendRead}
                    </button>
                  </div>
                ` : ''}
              </div>
              ${isLocked ? `
                <div class="gate-notice">${legendGate.hint}</div>
              ` : ''}
              ${isCollapsible && !isLocked ? `
                <button class="btn btn-block" type="button" id="btn-toggle-legend-expand" style="min-height: 44px; padding: 8px 14px; margin-top: 6px; font-size: calc(18px * var(--font-scale, 1)); border: 1px solid var(--border); background: #ffffff;">
                  ${isExpanded ? '收起圖例 ▲' : '看圖例 ▼'}
                </button>
              ` : ''}
              <div class="legend-list" style="${isExpanded && !isLocked ? '' : 'display: none;'}">${rows}</div>
            </div>
          `;
        } else if (currentState.legendReason) {
          legendsHtml = `
            <div class="legends-container">
              <div class="text-sm text-muted">${currentState.legendReason}</div>
            </div>
          `;
        }

        // State buttons: ALWAYS show even if length is 1 so user can identify & click state
        const stateButtons = states.map((s, idx) => {
          const isCurrent = idx === this.state.stateIdx;
          const isSeen = this.state.seenStates.has(idx);
          const isReading = this.state.activeReadingKey === `teach_${this.state.levelIdx}_${idx}`;
          const isLockedState = isLocked && !isCurrent;
          const isGuideTarget = this.state.guideTargetStateIdx === idx;

          let btnClasses = ['btn-state'];
          if (isCurrent) btnClasses.push('active');
          if (isSeen) btnClasses.push('seen');
          if (isLockedState) btnClasses.push('gate-locked');
          if (isGuideTarget) btnClasses.push('gate-target-ring');

          let innerHtml = '';
          if (isLockedState) {
            innerHtml = `
              <span>🔒 ${s.btnText}</span>
              <span class="badge-lock">看完圖例後開啟</span>
            `;
          } else {
            let badgeText = this.ui.stateUnseen;
            if (isSeen) badgeText = this.ui.stateSeen;
            else if (isReading) badgeText = '閱讀中…';
            innerHtml = `
              <span>${s.btnText}</span>
              <span class="badge-seen">${badgeText}</span>
              ${isReading ? `
                <div class="reading-progress-track">
                  <div class="reading-progress-fill" style="animation: readingFill ${this.state.readingDuration}s linear forwards;"></div>
                </div>
              ` : ''}
            `;
          }

          let arrowHtml = '';
          if (isGuideTarget) {
            arrowHtml = `
              <div class="gate-state-arrow-wrap" style="display: flex; justify-content: center; width: 100%; margin-bottom: 4px;">
                <svg class="gate-arrow-down" viewBox="0 0 56 110" aria-hidden="true">
                  <path d="M28 4v78" stroke="#f59e0b" stroke-width="10" stroke-linecap="round"/>
                  <path d="M8 70l20 32 20-32z" fill="#f59e0b"/>
                </svg>
              </div>
            `;
          }

          return `
            <div class="btn-state-wrapper" style="flex: 1 1 calc(50% - 6px); min-width: 110px; display: flex; flex-direction: column; align-items: center;">
              ${arrowHtml}
              <button class="${btnClasses.join(' ')}" type="button" data-state-idx="${idx}" ${isLockedState ? 'aria-disabled="true"' : ''} style="width: 100%;">
                ${innerHtml}
              </button>
            </div>
          `;
        }).join('');

        const overlaysSvg = this.renderOverlaysSvg(currentState.overlays);
        const markersHtml = (currentState.markers || []).map(m => `
          <span class="png-marker-pin" style="left: ${m.x}%; top: ${m.y}%;">${m.num}</span>
        `).join('');
        const aspectVal = currentState.ratio || '16 / 9';

        let noFigureHtml = '';
        if (level.noFigure) {
          const parts = [];
          if (level.intro) {
            const introStr = Array.isArray(level.intro) ? level.intro.join('\n') : String(level.intro);
            if (introStr.trim()) parts.push(introStr.trim());
          }
          if (level.body) {
            const bodyStr = Array.isArray(level.body) ? level.body.join('\n') : String(level.body);
            if (bodyStr.trim() && !parts.includes(bodyStr.trim())) {
              parts.push(bodyStr.trim());
            }
          }
          if (level.items) {
            const itemsStr = Array.isArray(level.items) ? level.items.join('\n') : String(level.items);
            if (itemsStr.trim() && !parts.includes(itemsStr.trim())) {
              parts.push(itemsStr.trim());
            }
          }
          if (parts.length > 0) {
            noFigureHtml = `
              <div class="caption-box" style="margin-top: 16px;">
                ${parts.map((p, idx) => `
                  <p class="text-body" style="font-size: calc(18px * var(--font-scale, 1)); line-height: 1.6; white-space: pre-line; margin: 0; ${idx > 0 ? 'margin-top: 12px;' : ''}">${p}</p>
                `).join('')}
              </div>
            `;
          }
        }

        const targetStateForNotice = (this.state.guideTargetStateIdx !== null && states[this.state.guideTargetStateIdx]) ? states[this.state.guideTargetStateIdx] : null;
        const targetStateNoticeHtml = targetStateForNotice ? `
          <div class="gate-notice" id="gate-target-notice">👉 先按黃框的「${targetStateForNotice.btnText}」，才能開始作答。</div>
        ` : '';

        view.innerHTML = `
          <div>
            <h2 class="title-lg">${level.title}</h2>
            <p class="text-sm text-muted" style="margin-top: 4px;">
              ${level.noFigure ? this.ui.textGuide : (level.teachGuide || this.ui.teachGuide)}
            </p>
          </div>

          ${noFigureHtml}

          ${!level.noFigure && currentState.img ? `
            <div class="diagram-region node-figure">
              <div class="diagram-viewport ${this.state.isZoomed ? 'zoomed' : ''}" id="diagram-vp" style="--aspect-ratio: ${aspectVal}; --origin-x: ${originX}%; --origin-y: ${originY}%; --scale: ${scaleVal};">
                <img src="${currentState.img}" alt="${currentState.btnText || ''}">
                ${overlaysSvg}
                ${markersHtml}
              </div>
              ${hasFocus ? `
                <button class="btn-zoom-toggle" type="button" id="btn-toggle-zoom">
                  ${this.state.isZoomed ? this.ui.focusWhole : this.ui.focusZoom}
                </button>
              ` : ''}
            </div>
          ` : ''}

          ${legendsHtml}

          ${targetStateNoticeHtml}

          ${states.length > 0 ? `<div class="state-tray">${stateButtons}</div>` : ''}

          ${currentState.caption ? `
            <div class="caption-box">
              <p class="text-body">${currentState.caption}</p>
            </div>
          ` : ''}

          ${states.length > 0 ? `
            <div class="text-sm text-muted" style="text-align: center;">
              ${allStatesSeen ? this.ui.statesDone : this.ui.stateProgress.replace('{seen}', this.state.seenStates.size).replace('{total}', states.length)}
            </div>
          ` : ''}

          <div class="actions-bar">
            <button class="btn btn-primary btn-block ${canStartQuiz ? '' : 'gate-locked'}" type="button" id="btn-start-quiz" ${canStartQuiz ? '' : 'aria-disabled="true"'}>
              ${this.ui.startQuiz}
            </button>
          </div>
        `;

        // Bind events
        view.querySelectorAll('[data-state-idx]').forEach(btn => {
          btn.onclick = () => {
            const idx = parseInt(btn.dataset.stateIdx, 10);
            if (isLocked && idx !== this.state.stateIdx) {
              legendGate.check();
              return;
            }
            if (this.state.guideTargetStateIdx === idx) {
              this.state.guideTargetStateIdx = null;
            }
            if (this.state.stateIdx !== idx) {
              this.state.stateIdx = idx;
              this.state.isZoomed = false;
              this.clearActiveReading();
              if (this.isTeachSeen(this.state.levelIdx, idx)) {
                this.state.seenStates.add(idx);
              }
              if (!this.state.seenStates.has(idx)) {
                this.startTeachReading(idx, states[idx].caption || '');
              }
              this.render();
            }
          };
        });

        const zoomBtn = document.getElementById('btn-toggle-zoom');
        if (zoomBtn) {
          zoomBtn.onclick = () => {
            this.state.isZoomed = !this.state.isZoomed;
            this.render();
          };
        }

        const toggleLegendBtn = document.getElementById('btn-toggle-legend-expand');
        if (toggleLegendBtn) {
          toggleLegendBtn.onclick = () => {
            this.state.isLegendExpanded = !this.state.isLegendExpanded;
            this.render();
          };
        }

        const openLegendBtn = document.getElementById('btn-open-legend');
        if (openLegendBtn) {
          openLegendBtn.onclick = () => {
            this.openLegendDialog(currentState.legends);
          };
        }

        document.getElementById('btn-start-quiz').onclick = () => {
          if (isLocked) {
            legendGate.check();
            return;
          }
          if (!allStatesSeen) {
            quizGate.check();
            return;
          }
          const trackingNodes = this.data.tracking?.nodeIds || [];
          if (level.noFigure && level.nodeId && trackingNodes.includes(level.nodeId)) {
            window.CourseLearning.explore(level.nodeId);
            this.trackTime(null);
          }
          this.state.questionIdx = 0;
          this.state.quizSubStateIdx = 0;
          this.state.quizAnswerLocked = false;
          this.state.matchAnswers = {};
          this.state.matchLockedRows = new Set();
          this.state.multiSelections = new Set();
          this.state.orderPicks = [];
          this.state.feedback = null;
          this.state.selectedOptId = null;
          this.setPhase('QUIZ');
        };
      },

      openLegendDialog(legends) {
        const dlg = document.getElementById('legend-dialog');
        const list = document.getElementById('legend-dlg-list');
        const confirmBtn = document.getElementById('btn-legend-confirm');

        // Only display particle sample legends in this dialog; anatomical structures with num belong to diagram pins
        const samplesOnly = (legends || []).filter(lg => lg.sample);
        const targetList = samplesOnly.length > 0 ? samplesOnly : (legends || []);

        list.innerHTML = targetList.map(lg => {
          let thumb = '';
          if (lg.sample && lg.sample.img) {
            thumb = `<img src="${lg.sample.img}" alt="${lg.name}">`;
          } else if (lg.sample && lg.sample.pending) {
            thumb = `<span class="text-xs text-muted" style="text-align: center; padding: 4px;">${this.ui.legendUnavailable}</span>`;
          } else if (lg.num) {
            thumb = `<span class="legend-num" style="font-size: calc(20px * var(--font-scale, 1));">${lg.num}</span>`;
          } else {
            thumb = `<span class="text-xs text-muted">${this.ui.legendUnavailable}</span>`;
          }

          return `
            <div class="sample-item">
              <div class="sample-img-box">
                ${thumb}
              </div>
              <div style="flex: 1;">
                <div class="title-stem">${lg.name}</div>
                ${lg.func ? `<div class="text-sm text-muted">${lg.func}</div>` : ''}
              </div>
            </div>
          `;
        }).join('');

        if (this.state.legendTimer) {
          clearInterval(this.state.legendTimer);
          this.state.legendTimer = null;
        }

        const isAlreadySeen = this.isLegendSeen(this.state.levelIdx, this.state.stateIdx);

        if (isAlreadySeen) {
          confirmBtn.removeAttribute('aria-disabled');
          confirmBtn.classList.remove('gate-locked');
          confirmBtn.textContent = this.ui.legendReadDone;
          this.state.legendDwellSec = 0;
        } else {
          const totalLegendText = targetList.map(lg => (lg.name || '') + (lg.func || '')).join('');
          let sec = this.calcDwellTime(totalLegendText, 3, READ_MAX_SEC);
          this.state.legendDwellSec = sec;

          confirmBtn.setAttribute('aria-disabled', 'true');
          confirmBtn.classList.add('gate-locked');
          confirmBtn.textContent = `${this.ui.legendReadDone} (${sec})`;

          this.state.legendTimer = setInterval(() => {
            sec--;
            this.state.legendDwellSec = sec;
            if (sec > 0) {
              confirmBtn.setAttribute('aria-disabled', 'true');
              confirmBtn.classList.add('gate-locked');
              confirmBtn.textContent = `${this.ui.legendReadDone} (${sec})`;
            } else {
              clearInterval(this.state.legendTimer);
              this.state.legendTimer = null;
              this.state.legendDwellSec = 0;
              confirmBtn.removeAttribute('aria-disabled');
              confirmBtn.classList.remove('gate-locked');
              confirmBtn.textContent = this.ui.legendReadDone;
            }
          }, 1000);
        }

        confirmBtn.onclick = () => {
          const dwellGate = gate({
            locked: this.state.legendDwellSec > 0 || confirmBtn.getAttribute('aria-disabled') === 'true',
            hint: () => `再 ${this.state.legendDwellSec || 1} 秒就能按`,
            onLockedTap: () => {
              this.showToast(`再 ${this.state.legendDwellSec || 1} 秒就能按`);
            }
          });
          dwellGate.check(() => {
            if (this.state.legendTimer) {
              clearInterval(this.state.legendTimer);
              this.state.legendTimer = null;
            }
            dlg.close();
            this.markLegendSeen(this.state.levelIdx, this.state.stateIdx);
            this.render();
          });
        };

        dlg.showModal();
      },

      renderQuiz(view, level) {
        const q = level.questions[this.state.questionIdx];
        this.trackTime(null);

        // Handle Explain Template
        if (q.template === 'explain') {
          const subStates = q.states || [];
          const qId = q.id || `explain_${this.state.levelIdx}_${this.state.questionIdx}`;
          const seenSet = this.getExplainSeen(qId);
          const curSub = subStates[this.state.quizSubStateIdx] || {};

          // Start reading timer for current subState if not seen
          if (subStates.length > 0 && !seenSet.has(this.state.quizSubStateIdx)) {
            const readingKey = `explain_${qId}_${this.state.quizSubStateIdx}`;
            if (this.state.activeReadingKey !== readingKey) {
              const textToRead = curSub.caption || (subStates.length === 1 ? (q.body || '') : '');
              this.startExplainReading(qId, this.state.quizSubStateIdx, textToRead);
            }
          }

          if (curSub.nodeId && seenSet.has(this.state.quizSubStateIdx)) {
            window.CourseLearning.explore(curSub.nodeId);
            this.trackTime(curSub.nodeId);
          }

          const seenCount = subStates.filter((_, idx) => seenSet.has(idx)).length;
          const allSubStatesSeen = subStates.length > 0 && seenCount === subStates.length;

          const remainingSub = subStates.length - seenCount;
          const firstUnseenSub = subStates.findIndex((_, idx) => !seenSet.has(idx));
          const explainGate = gate({
            locked: !allSubStatesSeen,
            hint: `還有 ${remainingSub} 張圖沒看`,
            onLockedTap: () => {
              this.showToast(`還有 ${remainingSub} 張圖沒看`);
              if (firstUnseenSub >= 0) {
                this.state.guideTargetSubIdx = firstUnseenSub;
                this.render();
                const targetEl = document.querySelector(`[data-sub-idx="${firstUnseenSub}"]`);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  this.triggerGateWiggle(targetEl);
                }
              }
            }
          });

          const subBtns = subStates.map((s, idx) => {
            const isCurrent = idx === this.state.quizSubStateIdx;
            const isSeen = seenSet.has(idx);
            const isReading = this.state.activeReadingKey === `explain_${qId}_${idx}`;
            const isGuideTarget = this.state.guideTargetSubIdx === idx;
            let badgeText = this.ui.stateUnseen;
            if (isSeen) badgeText = this.ui.stateSeen;
            else if (isReading) badgeText = '閱讀中…';

            let btnClasses = ['btn-state'];
            if (isCurrent) btnClasses.push('active');
            if (isSeen) btnClasses.push('seen');
            if (isGuideTarget) btnClasses.push('gate-target-ring');

            let arrowHtml = '';
            if (isGuideTarget) {
              arrowHtml = `
                <div class="gate-state-arrow-wrap" style="display: flex; justify-content: center; width: 100%; margin-bottom: 4px;">
                  <svg class="gate-arrow-down" viewBox="0 0 56 110" aria-hidden="true">
                    <path d="M28 4v78" stroke="#f59e0b" stroke-width="10" stroke-linecap="round"/>
                    <path d="M8 70l20 32 20-32z" fill="#f59e0b"/>
                  </svg>
                </div>
              `;
            }

            return `
              <div class="btn-state-wrapper" style="flex: 1 1 calc(50% - 6px); min-width: 110px; display: flex; flex-direction: column; align-items: center;">
                ${arrowHtml}
                <button class="${btnClasses.join(' ')}" type="button" data-sub-idx="${idx}" style="width: 100%;">
                  <span>${s.btnText}</span>
                  <span class="badge-seen">${badgeText}</span>
                  ${isReading ? `
                    <div class="reading-progress-track">
                      <div class="reading-progress-fill" style="animation: readingFill ${this.state.readingDuration}s linear forwards;"></div>
                    </div>
                  ` : ''}
                </button>
              </div>
            `;
          }).join('');

          const targetSubForNotice = (this.state.guideTargetSubIdx !== null && subStates[this.state.guideTargetSubIdx]) ? subStates[this.state.guideTargetSubIdx] : null;
          const targetSubNoticeHtml = targetSubForNotice ? `
            <div class="gate-notice" id="gate-target-sub-notice">👉 先按黃框的「${targetSubForNotice.btnText}」，才能前進下一題。</div>
          ` : '';

          view.innerHTML = `
            <div>
              <p class="title-stem">${q.body || ''}</p>
            </div>
            ${curSub.img ? `
              <div class="diagram-region node-figure">
                <div class="diagram-viewport" style="--aspect-ratio: ${curSub.ratio || '16 / 9'};">
                  <img src="${curSub.img}" alt="${curSub.btnText || ''}">
                </div>
              </div>
            ` : ''}
            ${targetSubNoticeHtml}
            <div class="state-tray">${subBtns}</div>
            ${curSub.caption ? `
              <div class="caption-box">
                <p class="text-body" style="white-space: pre-line;">${curSub.caption}</p>
              </div>
            ` : ''}
            ${subStates.length > 1 && !allSubStatesSeen ? `
              <div class="text-sm text-muted" style="text-align: center; margin-top: 10px;">
                ${this.ui.stateProgress.replace('{seen}', seenCount).replace('{total}', subStates.length)}
              </div>
            ` : ''}
            <div class="actions-bar">
              <button class="btn btn-primary btn-block ${allSubStatesSeen ? '' : 'gate-locked'}" type="button" id="btn-next-q" ${allSubStatesSeen ? '' : 'aria-disabled="true"'}>${this.ui.next}</button>
            </div>
          `;

          view.querySelectorAll('[data-sub-idx]').forEach(b => {
            b.onclick = () => {
              const subIdx = parseInt(b.dataset.subIdx, 10);
              if (this.state.guideTargetSubIdx === subIdx) {
                this.state.guideTargetSubIdx = null;
              }
              if (this.state.quizSubStateIdx !== subIdx) {
                this.state.quizSubStateIdx = subIdx;
                this.clearActiveReading();
                if (!seenSet.has(subIdx)) {
                  this.startExplainReading(qId, subIdx, subStates[subIdx].caption || '');
                }
                this.render();
              }
            };
          });

          const nextBtn = document.getElementById('btn-next-q');
          if (nextBtn) {
            nextBtn.onclick = () => {
              explainGate.check(() => {
                this.state.guideTargetSubIdx = null;
                this.state.quizSubStateIdx = 0;
                this.clearActiveReading();
                this.advanceQuiz(level);
              });
            };
          }
          return;
        }

        // Normal Quiz
        const hasFigure = !q.quizNoFigure && ((q.quizFigure && q.quizFigure.img) || q.quizImgState);
        const figImg = q.quizFigure ? q.quizFigure.img : (q.quizImgState ? level.states.find(s => s.id === q.quizImgState)?.img : null);
        const figRatio = q.quizFigure ? q.quizFigure.ratio : (q.quizImgState ? level.states.find(s => s.id === q.quizImgState)?.ratio : '16 / 9');

        let contentHtml = '';
        if (q.mode === 'order') {
          // Order sequence selection
          const items = q.items || [];
          const pickedIds = this.state.orderPicks;
          const availableItems = items.filter(it => !pickedIds.includes(it.id));

          const pickedHtml = pickedIds.map((id, idx) => {
            const it = items.find(x => x.id === id);
            return `
              <div class="order-item-badge">
                <span style="color: var(--primary); font-weight: 700;">${this.ui.orderBadge.replace('{n}', idx + 1)}</span>
                <span>${it ? (it.label || it.text) : ''}</span>
              </div>
            `;
          }).join('');

          const buttonsHtml = availableItems.map(it => `
            <button class="btn btn-block" type="button" data-order-id="${it.id}" ${this.state.quizAnswerLocked ? 'disabled' : ''}>
              ${it.label || it.text}
            </button>
          `).join('');

          contentHtml = `
            <div class="order-group">
              <div class="order-picked-list">
                ${pickedHtml || `<span class="text-sm text-muted" style="text-align: center; padding: 10px;">${this.ui.unselected}</span>`}
              </div>
              <div class="options-list">${buttonsHtml}</div>
              ${!this.state.quizAnswerLocked && pickedIds.length > 0 ? `
                <div class="actions-row" style="margin-top: 14px;">
                  <button class="btn" type="button" id="btn-reset-order">${this.ui.resetOrder}</button>
                  ${pickedIds.length === items.length ? `
                    <button class="btn btn-primary" type="button" id="btn-submit-order">${this.ui.submit}</button>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        } else if (q.template === 'match' || q.mode === 'rows') {
          // Rows matching question
          const rowsHtml = (q.items || []).map(it => {
            const isLocked = this.state.matchLockedRows.has(it.id);
            const selectedTarget = this.state.matchAnswers[it.id];
            const targetBtns = (q.targets || []).map(tg => `
              <button class="btn-target ${selectedTarget === tg.id ? 'active' : ''}" type="button" data-item-id="${it.id}" data-target-id="${tg.id}" ${isLocked ? 'disabled' : ''}>
                ${tg.label}
              </button>
            `).join('');

            return `
              <div class="match-card ${isLocked ? 'locked' : ''}">
                <div class="match-stem">${isLocked ? '✔ ' : ''}${it.text}</div>
                <div class="match-targets">${targetBtns}</div>
              </div>
            `;
          }).join('');

          contentHtml = `
            <div class="match-group">${rowsHtml}</div>
            ${!this.state.quizAnswerLocked ? `
              <button class="btn btn-primary btn-block" type="button" id="btn-submit-match" style="margin-top: 14px;">${this.ui.submit}</button>
            ` : ''}
          `;
        } else if (q.mode === 'multi') {
          // Multi choice
          const needed = q.selectCount || 2;
          const optionsHtml = (q.options || []).map(opt => {
            const isSel = this.state.multiSelections.has(opt.id);
            let stateCls = isSel ? 'selected' : '';
            if (this.state.quizAnswerLocked) {
              if (Array.isArray(q.answer) && q.answer.includes(opt.id)) stateCls = 'correct';
              else if (isSel) stateCls = 'wrong';
            }
            return `
              <button class="btn btn-option ${stateCls}" type="button" data-opt-id="${opt.id}" ${this.state.quizAnswerLocked ? 'disabled' : ''}>
                ${opt.text}
              </button>
            `;
          }).join('');

          contentHtml = `
            <div class="options-list">${optionsHtml}</div>
            ${!this.state.quizAnswerLocked ? `
              <button class="btn btn-primary btn-block" type="button" id="btn-submit-multi" style="margin-top: 14px;" ${this.state.multiSelections.size === needed ? '' : 'disabled'}>
                ${this.ui.submit}
              </button>
            ` : ''}
          `;
        } else {
          // Single choice
          if (!this.state.currentOptions || this.state.currentOptions.qid !== q.id) {
            const shuffled = [...(q.options || [])].sort(() => Math.random() - 0.5);
            this.state.currentOptions = shuffled;
            this.state.currentOptions.qid = q.id;
          }

          const optionsHtml = this.state.currentOptions.map(opt => {
            let stateCls = '';
            if (this.state.quizAnswerLocked) {
              if (opt.id === q.answer) stateCls = 'correct';
              else if (opt.id === this.state.selectedOptId) stateCls = 'wrong';
            } else if (this.state.selectedOptId === opt.id) {
              stateCls = 'selected';
            }
            return `
              <button class="btn btn-option ${stateCls}" type="button" data-opt-id="${opt.id}" ${this.state.quizAnswerLocked ? 'disabled' : ''}>
                ${opt.text}
              </button>
            `;
          }).join('');

          contentHtml = `
            <div class="options-list">${optionsHtml}</div>
            ${!this.state.quizAnswerLocked ? `
              <button class="btn btn-primary btn-block" type="button" id="btn-submit-choice" style="margin-top: 14px;" ${this.state.selectedOptId ? '' : 'disabled'}>
                ${this.ui.submit}
              </button>
            ` : ''}
          `;
        }

        // Feedback box
        let feedbackHtml = '';
        if (this.state.feedback) {
          feedbackHtml = `
            <div class="feedback-box ${this.state.feedback.type}">
              ${this.state.feedback.text}
            </div>
          `;
        }

        const quizMarkers = (q.quizFigure && q.quizFigure.markers) || q.markers || [];
        const quizMarkersHtml = quizMarkers.map(m => `
          <span class="png-marker-pin" style="left: ${m.x}%; top: ${m.y}%;">${m.num}</span>
        `).join('');

        view.innerHTML = `
          <div>
            <h3 class="title-stem">${q.prompt || q.stem || ''}</h3>
          </div>

          ${hasFigure && figImg ? `
            <div class="diagram-region node-figure">
              <div class="diagram-viewport" style="--aspect-ratio: ${figRatio || '16 / 9'};">
                <img src="${figImg}" alt="">
                ${quizMarkersHtml}
              </div>
            </div>
          ` : ''}

          ${contentHtml}
          ${feedbackHtml}

          <div class="actions-bar">
            ${this.state.quizAnswerLocked ? `
              ${this.state.feedback && this.state.feedback.type === 'correct' ? `
                <button class="btn btn-primary btn-block" type="button" id="btn-next-q">${this.ui.next}</button>
              ` : `
                <div class="actions-row">
                  ${q.hint ? `<button class="btn" type="button" id="btn-hint">${this.ui.hint}</button>` : ''}
                  <button class="btn btn-primary" type="button" id="btn-retry">${this.ui.retry}</button>
                </div>
              `}
            ` : ''}
          </div>
        `;

        // Bind match interactions
        view.querySelectorAll('.btn-target').forEach(tb => {
          tb.onclick = () => {
            const itemId = tb.dataset.itemId;
            const targetId = tb.dataset.targetId;
            this.state.matchAnswers[itemId] = targetId;
            this.render();
          };
        });

        const submitMatchBtn = document.getElementById('btn-submit-match');
        if (submitMatchBtn) {
          submitMatchBtn.onclick = () => {
            this.submitMatchAnswer(q, level);
          };
        }

        // Bind multi interactions
        view.querySelectorAll('[data-opt-id]').forEach(ob => {
          ob.onclick = () => {
            if (this.state.quizAnswerLocked) return;
            if (q.mode === 'multi') {
              const optId = ob.dataset.optId;
              if (this.state.multiSelections.has(optId)) {
                this.state.multiSelections.delete(optId);
              } else if (this.state.multiSelections.size < (q.selectCount || 2)) {
                this.state.multiSelections.add(optId);
              }
              this.render();
            } else {
              this.state.selectedOptId = ob.dataset.optId;
              this.render();
            }
          };
        });

        const submitChoiceBtn = document.getElementById('btn-submit-choice');
        if (submitChoiceBtn) {
          submitChoiceBtn.onclick = () => {
            if (!this.state.selectedOptId || this.state.quizAnswerLocked) return;
            this.submitChoiceAnswer(q, this.state.selectedOptId, level);
          };
        }

        const submitMultiBtn = document.getElementById('btn-submit-multi');
        if (submitMultiBtn) {
          submitMultiBtn.onclick = () => {
            this.submitMultiAnswer(q, level);
          };
        }

        // Bind order interactions
        view.querySelectorAll('[data-order-id]').forEach(btn => {
          btn.onclick = () => {
            this.state.orderPicks.push(btn.dataset.orderId);
            this.render();
          };
        });

        const resetOrderBtn = document.getElementById('btn-reset-order');
        if (resetOrderBtn) {
          resetOrderBtn.onclick = () => {
            this.state.orderPicks = [];
            this.render();
          };
        }

        const submitOrderBtn = document.getElementById('btn-submit-order');
        if (submitOrderBtn) {
          submitOrderBtn.onclick = () => {
            this.submitOrderAnswer(q, level);
          };
        }

        if (this.state.quizAnswerLocked && this.state.feedback && this.state.feedback.type === 'wrong') {
          this.startRetryCountdown('btn-retry', this.state.feedback.text);
        }

        const retryBtn = document.getElementById('btn-retry');
        if (retryBtn) {
          retryBtn.onclick = () => {
            const retryGate = gate({
              locked: retryBtn.getAttribute('aria-disabled') === 'true',
              hint: () => `再 ${this.state.retryDwellSec || 1} 秒就能按`,
              onLockedTap: () => {
                this.showToast(`再 ${this.state.retryDwellSec || 1} 秒就能按`);
              }
            });
            retryGate.check(() => {
              if (this.state.retryTimer) clearInterval(this.state.retryTimer);
              this.state.retryDwellSec = 0;
              this.state.quizAnswerLocked = false;
              this.state.selectedOptId = null;
              this.state.feedback = null;
              this.state.multiSelections = new Set();
              this.state.orderPicks = [];
              this.render();
            });
          };
        }

        const hintBtn = document.getElementById('btn-hint');
        if (hintBtn) {
          hintBtn.onclick = () => {
            window.CourseLearning.hint(q.id);
            this.state.feedback = { type: 'hint', text: `${this.ui.hintLabel} ${q.hint}` };
            this.render();
          };
        }

        const nextQBtn = document.getElementById('btn-next-q');
        if (nextQBtn) {
          nextQBtn.onclick = () => {
            this.advanceQuiz(level);
          };
        }
      },

      submitChoiceAnswer(q, selectedOptId, level) {
        this.state.selectedOptId = selectedOptId;
        this.state.quizAnswerLocked = true;
        const isCorrect = selectedOptId === q.answer;
        window.CourseLearning.answer(q.id, isCorrect);

        if (isCorrect) {
          let correctText = q.feedbackCorrect || this.ui.correct;
          if (correctText === this.ui.correct && Array.isArray(this.data.encouragement.correct)) {
            correctText = this.data.encouragement.correct[Math.floor(Math.random() * this.data.encouragement.correct.length)];
          }
          this.state.feedback = { type: 'correct', text: correctText };
        } else {
          const wrongText = (q.byOption && q.byOption[selectedOptId]) || q.feedbackWrong || this.ui.retry;
          this.state.feedback = { type: 'wrong', text: wrongText };
        }
        this.render();
      },

      submitMultiAnswer(q, level) {
        const userAnswers = Array.from(this.state.multiSelections).sort();
        const expectedAnswers = Array.isArray(q.answer) ? [...q.answer].sort() : [];
        const isCorrect = userAnswers.length === expectedAnswers.length && userAnswers.every((val, idx) => val === expectedAnswers[idx]);

        this.state.quizAnswerLocked = true;
        window.CourseLearning.answer(q.id, isCorrect);

        if (isCorrect) {
          this.state.feedback = { type: 'correct', text: q.feedbackCorrect || this.ui.correct };
        } else {
          this.state.feedback = { type: 'wrong', text: q.feedbackWrong || this.ui.retry };
        }
        this.render();
      },

      submitOrderAnswer(q, level) {
        const expected = q.answer || [];
        const actual = this.state.orderPicks;
        const isCorrect = expected.length === actual.length && expected.every((val, idx) => val === actual[idx]);

        this.state.quizAnswerLocked = true;
        window.CourseLearning.answer(q.id, isCorrect);

        if (isCorrect) {
          this.state.feedback = { type: 'correct', text: q.feedbackCorrect || this.ui.correct };
        } else {
          this.state.feedback = { type: 'wrong', text: q.feedbackWrong || this.ui.retry };
        }
        this.render();
      },

      submitMatchAnswer(q, level) {
        let allCorrect = true;
        let wrongFeedback = q.feedbackWrong;

        (q.items || []).forEach(it => {
          const expected = q.answer[it.id];
          const actual = this.state.matchAnswers[it.id];
          if (expected === actual) {
            this.state.matchLockedRows.add(it.id);
          } else {
            allCorrect = false;
            if (q.byItem && q.byItem[it.id]) wrongFeedback = q.byItem[it.id];
          }
        });

        this.state.quizAnswerLocked = true;
        window.CourseLearning.answer(q.id, allCorrect);

        if (allCorrect) {
          this.state.feedback = { type: 'correct', text: q.feedbackCorrect || this.ui.correct };
        } else {
          this.state.feedback = { type: 'wrong', text: wrongFeedback };
        }
        this.render();
      },

      advanceQuiz(level) {
        this.state.questionIdx++;
        this.state.quizAnswerLocked = false;
        this.state.feedback = null;
        this.state.quizSubStateIdx = 0;
        this.state.matchAnswers = {};
        this.state.matchLockedRows = new Set();
        this.state.multiSelections = new Set();
        this.state.orderPicks = [];
        this.state.currentOptions = [];

        if (this.state.questionIdx >= level.questions.length) {
          this.setPhase('LEVEL_PASS');
        } else {
          this.render();
        }
      },

      renderLevelPass(view) {
        this.trackTime(null);
        const level = this.data.levels[this.state.levelIdx];
        const cheers = this.data.encouragement.levelPass || [];
        const cheerText = cheers[Math.floor(Math.random() * cheers.length)] || '';

        view.innerHTML = `
          <div style="margin-top: 20px;">
            <h2 class="title-lg" style="color: var(--success);">${this.ui.passTitle.replace('{n}', this.state.levelIdx + 1)}</h2>
          </div>
          <div class="caption-box" style="margin-top: 16px;">
            <span style="font-weight: 700;">${this.ui.summaryLabel}</span>
            <p class="text-body" style="margin-top: 4px;">${level.summary}</p>
          </div>
          <div class="feedback-box correct" style="margin-top: 14px;">
            <p class="text-body">${cheerText}</p>
          </div>
          <div class="actions-bar">
            <button class="btn btn-primary btn-block" type="button" id="btn-next-level">${this.ui.nextLevel}</button>
          </div>
        `;

        document.getElementById('btn-next-level').onclick = () => {
          if (this.state.levelIdx + 1 < this.data.levels.length) {
            this.startLevel(this.state.levelIdx + 1);
          } else {
            // All levels finished, proceed to ending or truefalse
            if (this.data.ending && this.data.ending.steps && this.data.ending.steps.length > 0) {
              this.state.endingStepIdx = 0;
              this.state.quizAnswerLocked = false;
              this.state.feedback = null;
              this.setPhase('ENDING');
            } else if (this.data.truefalse && this.data.truefalse.length > 0) {
              this.state.tfIdx = 0;
              this.state.quizAnswerLocked = false;
              this.state.feedback = null;
              this.setPhase('TRUEFALSE');
            } else {
              this.startAssessment('foundation');
            }
          }
        };
      },

      renderEnding(view) {
        const steps = this.data.ending.steps || [];
        const step = steps[this.state.endingStepIdx];

        if (!step) {
          // Complete ending
          view.innerHTML = `
            <div style="margin-top: 24px;">
              <h2 class="title-lg">${this.ui.endingDone}</h2>
            </div>
            <div class="caption-box" style="margin-top: 16px;">
              <p class="text-body">${this.data.ending.completeMessage || ''}</p>
            </div>
            <div class="actions-bar">
              <button class="btn btn-primary btn-block" type="button" id="btn-to-tf">${this.ui.truefalse}</button>
            </div>
          `;
          document.getElementById('btn-to-tf').onclick = () => {
            this.state.tfIdx = 0;
            this.state.quizAnswerLocked = false;
            this.state.feedback = null;
            this.setPhase('TRUEFALSE');
          };
          return;
        }

        const optionsHtml = (step.options || []).map(opt => {
          let cls = '';
          if (this.state.quizAnswerLocked) {
            if (opt.id === step.answer) cls = 'correct';
            else if (opt.id === this.state.selectedEndOptId) cls = 'wrong';
          } else if (this.state.selectedEndOptId === opt.id) {
            cls = 'selected';
          }
          return `
            <button class="btn btn-option ${cls}" type="button" data-end-opt="${opt.id}" ${this.state.quizAnswerLocked ? 'disabled' : ''}>
              ${opt.text}
            </button>
          `;
        }).join('');

        let feedbackHtml = '';
        if (this.state.feedback) {
          feedbackHtml = `
            <div class="feedback-box ${this.state.feedback.type}" style="margin-top: 14px;">
              ${this.state.feedback.text}
            </div>
          `;
        }

        view.innerHTML = `
          <div>
            <h3 class="title-stem">${step.prompt}</h3>
          </div>
          <div class="options-list" style="margin-top: 14px;">${optionsHtml}</div>
          ${!this.state.quizAnswerLocked ? `
            <button class="btn btn-primary btn-block" type="button" id="btn-submit-ending" style="margin-top: 14px;" ${this.state.selectedEndOptId ? '' : 'disabled'}>
              ${this.ui.submit}
            </button>
          ` : ''}
          ${feedbackHtml}
          <div class="actions-bar">
            ${this.state.quizAnswerLocked ? `
              ${this.state.feedback && this.state.feedback.type === 'correct' ? `
                <button class="btn btn-primary btn-block" type="button" id="btn-next-ending">${this.ui.next}</button>
              ` : `
                <button class="btn btn-primary btn-block" type="button" id="btn-retry-ending">${this.ui.retry}</button>
              `}
            ` : ''}
          </div>
        `;

        view.querySelectorAll('[data-end-opt]').forEach(b => {
          b.onclick = () => {
            if (this.state.quizAnswerLocked) return;
            this.state.selectedEndOptId = b.dataset.endOpt;
            this.render();
          };
        });

        const submitEndingBtn = document.getElementById('btn-submit-ending');
        if (submitEndingBtn) {
          submitEndingBtn.onclick = () => {
            if (!this.state.selectedEndOptId || this.state.quizAnswerLocked) return;
            const optId = this.state.selectedEndOptId;
            this.state.quizAnswerLocked = true;
            const ok = optId === step.answer;
            window.CourseLearning.answer(step.id, ok);
            this.state.feedback = {
              type: ok ? 'correct' : 'wrong',
              text: ok ? (step.feedbackCorrect || this.ui.correct) : (step.feedbackWrong || this.ui.retry)
            };
            this.render();
          };
        }

        if (this.state.quizAnswerLocked && this.state.feedback && this.state.feedback.type === 'wrong') {
          this.startRetryCountdown('btn-retry-ending', this.state.feedback.text);
        }

        const retryBtn = document.getElementById('btn-retry-ending');
        if (retryBtn) {
          retryBtn.onclick = () => {
            const retryGate = gate({
              locked: retryBtn.getAttribute('aria-disabled') === 'true',
              hint: () => `再 ${this.state.retryDwellSec || 1} 秒就能按`,
              onLockedTap: () => {
                this.showToast(`再 ${this.state.retryDwellSec || 1} 秒就能按`);
              }
            });
            retryGate.check(() => {
              if (this.state.retryTimer) clearInterval(this.state.retryTimer);
              this.state.retryDwellSec = 0;
              this.state.quizAnswerLocked = false;
              this.state.selectedEndOptId = null;
              this.state.feedback = null;
              this.render();
            });
          };
        }

        const nextBtn = document.getElementById('btn-next-ending');
        if (nextBtn) {
          nextBtn.onclick = () => {
            this.state.endingStepIdx++;
            this.state.quizAnswerLocked = false;
            this.state.selectedEndOptId = null;
            this.state.feedback = null;
            this.render();
          };
        }
      },

      renderTrueFalse(view) {
        const tfList = this.data.truefalse || [];
        const tf = tfList[this.state.tfIdx];

        if (!tf) {
          // Completed TrueFalse
          view.innerHTML = `
            <div style="margin-top: 24px;">
              <h2 class="title-lg">${this.ui.transition}</h2>
            </div>
            <div class="caption-box" style="margin-top: 16px;">
              <p class="text-body">${this.data.assessment.intro || ''}</p>
            </div>
            <div class="actions-bar">
              <button class="btn btn-primary btn-block" type="button" id="btn-start-ass">${this.ui.beginAssessment}</button>
            </div>
          `;
          document.getElementById('btn-start-ass').onclick = () => {
            this.startAssessment('foundation');
          };
          return;
        }

        const isTrueSelected = this.state.selectedTfVal === true;
        const isFalseSelected = this.state.selectedTfVal === false;

        let trueCls = isTrueSelected ? 'selected' : '';
        let falseCls = isFalseSelected ? 'selected' : '';

        if (this.state.quizAnswerLocked) {
          if (tf.answer === true) trueCls = 'correct';
          else if (isTrueSelected) trueCls = 'wrong';

          if (tf.answer === false) falseCls = 'correct';
          else if (isFalseSelected) falseCls = 'wrong';
        }

        let feedbackHtml = '';
        if (this.state.feedback) {
          feedbackHtml = `
            <div class="feedback-box ${this.state.feedback.type}" style="margin-top: 14px;">
              ${this.state.feedback.text}
            </div>
          `;
        }

        view.innerHTML = `
          <div>
            <h3 class="title-stem">${tf.prompt}</h3>
          </div>
          <div class="actions-row" style="margin-top: 20px;">
            <button class="btn btn-block ${trueCls}" type="button" data-tf-val="true" ${this.state.quizAnswerLocked ? 'disabled' : ''} style="min-height: 52px; font-size: calc(20px * var(--font-scale, 1));">
              ${this.ui.yes}
            </button>
            <button class="btn btn-block ${falseCls}" type="button" data-tf-val="false" ${this.state.quizAnswerLocked ? 'disabled' : ''} style="min-height: 52px; font-size: calc(20px * var(--font-scale, 1));">
              ${this.ui.no}
            </button>
          </div>
          ${!this.state.quizAnswerLocked ? `
            <button class="btn btn-primary btn-block" type="button" id="btn-submit-tf" style="margin-top: 16px;" ${this.state.selectedTfVal !== null && this.state.selectedTfVal !== undefined ? '' : 'disabled'}>
              ${this.ui.submit}
            </button>
          ` : ''}
          ${feedbackHtml}
          <div class="actions-bar">
            ${this.state.quizAnswerLocked ? `
              ${this.state.feedback && this.state.feedback.type === 'correct' ? `
                <button class="btn btn-primary btn-block" type="button" id="btn-next-tf">${this.ui.next}</button>
              ` : `
                <button class="btn btn-primary btn-block" type="button" id="btn-retry-tf">${this.ui.retry}</button>
              `}
            ` : ''}
          </div>
        `;

        view.querySelectorAll('[data-tf-val]').forEach(b => {
          b.onclick = () => {
            if (this.state.quizAnswerLocked) return;
            this.state.selectedTfVal = (b.dataset.tfVal === 'true');
            this.render();
          };
        });

        const submitTfBtn = document.getElementById('btn-submit-tf');
        if (submitTfBtn) {
          submitTfBtn.onclick = () => {
            if (this.state.selectedTfVal === null || this.state.selectedTfVal === undefined || this.state.quizAnswerLocked) return;
            const val = this.state.selectedTfVal;
            this.state.quizAnswerLocked = true;
            const ok = val === tf.answer;
            window.CourseLearning.answer(tf.id, ok);
            this.state.feedback = {
              type: ok ? 'correct' : 'wrong',
              text: ok ? (tf.feedbackCorrect || this.ui.correct) : (tf.feedbackWrong || this.ui.retry)
            };
            this.render();
          };
        }

        if (this.state.quizAnswerLocked && this.state.feedback && this.state.feedback.type === 'wrong') {
          this.startRetryCountdown('btn-retry-tf', this.state.feedback.text);
        }

        const retryBtn = document.getElementById('btn-retry-tf');
        if (retryBtn) {
          retryBtn.onclick = () => {
            const retryGate = gate({
              locked: retryBtn.getAttribute('aria-disabled') === 'true',
              hint: () => `再 ${this.state.retryDwellSec || 1} 秒就能按`,
              onLockedTap: () => {
                this.showToast(`再 ${this.state.retryDwellSec || 1} 秒就能按`);
              }
            });
            retryGate.check(() => {
              if (this.state.retryTimer) clearInterval(this.state.retryTimer);
              this.state.retryDwellSec = 0;
              this.state.quizAnswerLocked = false;
              this.state.selectedTfVal = null;
              this.state.feedback = null;
              this.render();
            });
          };
        }

        const nextBtn = document.getElementById('btn-next-tf');
        if (nextBtn) {
          nextBtn.onclick = () => {
            this.state.tfIdx++;
            this.state.quizAnswerLocked = false;
            this.state.selectedTfVal = null;
            this.state.feedback = null;
            this.render();
          };
        }
      },

      startAssessment(stage) {
        this.state.assStage = stage;
        this.state.assIdx = 0;
        this.state.selectedAssOptId = null;
        this.state.quizAnswerLocked = false;
        this.setPhase('ASSESSMENT');
        this.startAssTimer();
      },

      startAssTimer() {
        if (this.state.assTimer) clearInterval(this.state.assTimer);
        const list = this.state.assStage === 'case' ? this.data.assessment.case : this.data.assessment.foundation;
        const q = list[this.state.assIdx];
        if (!q) return;

        this.state.assTimeTotal = q.timeLimit || 60;
        this.state.assTimeLeft = this.state.assTimeTotal;
        this.updateTimerUI();

        this.state.assTimer = setInterval(() => {
          this.state.assTimeLeft--;
          this.updateTimerUI();
          if (this.state.assTimeLeft <= 0) {
            clearInterval(this.state.assTimer);
            if (this.state.selectedAssOptId) {
              this.submitAssessmentChoice(q, this.state.selectedAssOptId);
            } else {
              this.handleAssTimeout(q);
            }
          }
        }, 1000);
      },

      updateTimerUI() {
        const fill = document.getElementById('timer-fill');
        const txt = document.getElementById('timer-text');
        if (!fill || !txt) return;

        const pct = Math.max(0, (this.state.assTimeLeft / this.state.assTimeTotal) * 100);
        fill.style.width = `${pct}%`;
        txt.textContent = this.ui.timeRemaining.replace('{n}', Math.max(0, this.state.assTimeLeft));

        fill.classList.remove('warn', 'danger');
        if (pct < 25) fill.classList.add('danger');
        else if (pct < 50) fill.classList.add('warn');
      },

      handleAssTimeout(q) {
        window.CourseLearning.answer(q.id, false);
        this.showMsgDialog(this.ui.assessmentTimeout, () => {
          this.restartAssStage();
        });
      },

      handleAssWrong(q) {
        window.CourseLearning.answer(q.id, false);
        const failMsg = this.data.assessment.failMessage || this.ui.retry;
        this.showMsgDialog(failMsg, () => {
          this.restartAssStage();
        });
      },

      restartAssStage() {
        this.state.assIdx = 0;
        this.state.selectedAssOptId = null;
        this.state.currentOptions = [];
        this.render();
        this.startAssTimer();
      },

      renderAssessment(view, q) {
        if (!this.state.currentOptions || this.state.currentOptions.qid !== q.id) {
          const shuffled = [...(q.options || [])].sort(() => Math.random() - 0.5);
          this.state.currentOptions = shuffled;
          this.state.currentOptions.qid = q.id;
        }

        const optionsHtml = this.state.currentOptions.map(opt => {
          const isSelected = this.state.selectedAssOptId === opt.id;
          return `
            <button class="btn btn-option ${isSelected ? 'selected' : ''}" type="button" data-ass-opt="${opt.id}">
              ${opt.text}
            </button>
          `;
        }).join('');

        view.innerHTML = `
          <div>
            <h3 class="title-stem">${q.prompt}</h3>
          </div>
          <div class="options-list" style="margin-top: 16px;">${optionsHtml}</div>
          <div class="actions-bar" style="margin-top: 16px;">
            <button class="btn btn-primary btn-block" type="button" id="btn-submit-ass" ${this.state.selectedAssOptId ? '' : 'disabled'}>
              ${this.ui.submit}
            </button>
          </div>
        `;

        view.querySelectorAll('[data-ass-opt]').forEach(b => {
          b.onclick = () => {
            this.state.selectedAssOptId = b.dataset.assOpt;
            this.render();
          };
        });

        const submitAssBtn = document.getElementById('btn-submit-ass');
        if (submitAssBtn) {
          submitAssBtn.onclick = () => {
            if (!this.state.selectedAssOptId) return;
            this.submitAssessmentChoice(q, this.state.selectedAssOptId);
          };
        }
      },

      submitAssessmentChoice(q, optId) {
        clearInterval(this.state.assTimer);
        const ok = optId === q.answer;
        if (ok) {
          window.CourseLearning.answer(q.id, true);
          this.advanceAssessment();
        } else {
          this.handleAssWrong(q);
        }
      },

      advanceAssessment() {
        const isCase = this.state.assStage === 'case';
        const list = isCase ? this.data.assessment.case : this.data.assessment.foundation;
        this.state.assIdx++;
        this.state.selectedAssOptId = null;

        if (this.state.assIdx >= list.length) {
          if (!isCase) {
            // Foundation passed!
            this.showMsgDialog(this.data.assessment.passMessage, () => {
              this.startAssessment('case');
            });
          } else {
            // Case passed! Complete!
            this.showMsgDialog(this.data.assessment.passMessage, () => {
              this.setPhase('COMPLETE');
            });
          }
        } else {
          this.render();
          this.startAssTimer();
        }
      },

      renderComplete(view) {
        this.trackTime(null);
        window.CourseLearning.complete();

        view.innerHTML = `
          <div style="margin-top: 32px; text-align: center;">
            <div style="font-size: calc(48px * var(--font-scale, 1));">🎉</div>
            <h2 class="title-lg" style="color: var(--primary); margin-top: 12px;">${this.ui.complete}</h2>
          </div>
          <div class="caption-box" style="margin-top: 20px;">
            <p class="text-body" style="font-size: calc(19px * var(--font-scale, 1)); text-align: center;">
              ${this.data.encouragement.finish}
            </p>
          </div>
        `;
      },

      showMsgDialog(msg, onConfirm) {
        const dlg = document.getElementById('msg-dialog');
        const content = document.getElementById('msg-dlg-content');
        const confirmBtn = document.getElementById('btn-msg-confirm');
        content.textContent = msg;
        confirmBtn.onclick = () => {
          dlg.close();
          if (onConfirm) onConfirm();
        };
        dlg.showModal();
      }
    };


    installFigureLevels(App);
    window.App = App;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { App.clearActiveReading(); App.render(); }
    });
    App.init();
    return App;
  }
  window.MaterialShell = Object.freeze({ mount });
  const boot = () => { if (window.MaterialShellContent) mount(window.MaterialShellContent); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
