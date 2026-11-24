/* Reusable exploration / image task controller; subject data is injected. */
(function () {
  "use strict";
  function element(tag, text = "", cls = "") {
    const e = document.createElement(tag);
    if (text) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }
  function btn(text, fn, { id = "", primary = false, disabled = false } = {}) {
    const b = element("button", text, primary ? "primary" : "");
    b.type = "button";
    if (id) b.id = id;
    b.disabled = disabled;
    b.addEventListener("click", fn);
    return b;
  }
  function randInt(max) {
    const r = new Uint32Array(1);
    crypto.getRandomValues(r);
    return r[0] % max;
  }
  class App {
    constructor(
      host,
      data,
      { events, teacherMode = false, timingOptions, embedding } = {},
    ) {
      this.host = host;
      this.d = data;
      this.events = events || CoreEvents.createMock();
      this.embedding = embedding;
      this.teacherMode = !embedding && teacherMode;
      this.lifecycle = new AbortController();
      this.timer = embedding ? null : CoreEvents.createNodeTimer(this.events, timingOptions);
      this.host.classList.add("ap2-figure");
      this.s = {
        stage: embedding?.stageIndex ?? 0,
        phase: "explore",
        seen: new Set(),
        guiding: true,
        guideIndex: 0,
        focusWhole: true,
        findWhole: false,
        selected: [],
        active: null,
        q: 0,
        result: null,
        revealed: false,
        removed: false,
        mapping: {},
        statementChoices: [],
        completed: false,
        attempts: 0,
      };
      this.build();
      this.shuffle();
      this.figure.onReady = () => {
        if (this.embedding && !this.figure.ready) {
          this.embedding.onError();
        } else {
          this.render();
        }
      };
      this.render();
    }
    stage() {
      return this.s.stage < this.d.stages.length
        ? this.d.stages[this.s.stage]
        : this.d.unitEnd;
    }
    nodes() {
      return this.d.hotspots.filter((n) =>
        this.stage().hotspotIds.includes(n.id),
      );
    }
    choiceNodes(q = this.question()) {
      if (this.s.phase === "find" && q?.choices?.length)
        return this.d.hotspots.filter((n) => q.choices.includes(n.id));
      return this.nodes();
    }
    node(id) {
      return this.d.hotspots.find((n) => n.id === id);
    }
    question() {
      return this.stage().questions[this.s.q];
    }
    available() {
      return this.figure.ready && !this.s.removed;
    }
    button(text, action, opts = {}) {
      const b = btn(text, action, opts);
      if (opts.action) b.dataset.action = opts.action;
      return b;
    }
    build() {
      const h = element("header"),
        titleGroup = element("div", "", "title-group"),
        title = element("h1", this.d.title.text),
        font = element("div", "", "font-tools");
      title.dataset.src = this.d.title.src;
      titleGroup.append(title);
      if (this.d.sampleVersion) {
        const ver = element("span", "v" + this.d.sampleVersion, "version-tag");
        ver.setAttribute("aria-label", "版本 " + this.d.sampleVersion);
        titleGroup.append(ver);
      }
      this.normal = this.button("預設", () => this.scale(1));
      this.large = this.button("特大", () => this.scale(1.3));
      font.setAttribute("aria-label", "字級");
      font.append(this.normal, this.large);
      h.append(titleGroup, font);
      this.main = element(this.embedding ? "div" : "main", "", "figure-main");
      this.nav = element("nav", "", "stage-nav");
      this.nav.setAttribute("aria-label", "單元進度");
      const layout = element("div", "", "layout"),
        visual = element("section", "", "visual");
      visual.setAttribute("aria-label", "共用互動圖");
      const top = element("div", "", "figure-tools"),
        acts = element("div", "", "figure-actions");
      this.count = element("p");
      this.zoom = this.button("放大到部位", () => {
        this.figure.resetManualView();
        if (this.s.phase === "explore") {
          this.s.focusWhole = !this.s.focusWhole;
        } else if (this.s.phase === "find") {
          this.s.findWhole = !this.s.findWhole;
        }
        this.render();
      });
      this.inspectBtn = this.button(
        "局部放大",
        () => {
          if (this.figure.inspectMode || this.figure.manualView) {
            this.figure.resetManualView();
          } else {
            this.figure.setInspectMode(true);
          }
          this.syncZoomUi();
        },
        { action: "inspect-toggle" },
      );
      acts.append(this.inspectBtn, this.zoom);
      top.append(this.count, acts);
      this.frame = element("div", "", "figure-frame");
      this.figure = new FigureView(
        this.frame,
        this.d.figure,
        (id) => this.pick(id),
        (ids) => this.ambiguous(ids),
        { onViewChange: () => this.syncZoomUi(), readOnly: !!this.embedding },
      );
      this.note = element("p", "", "figure-note");
      this.pad = element("div", "", "number-pad");
      this.pad.setAttribute("aria-label", "選圖上編號");
      visual.append(top, this.frame, this.note, this.pad);
      this.work = element("section", "", "work");
      this.work.setAttribute("aria-live", "polite");
      layout.append(visual, this.work);
      if (!this.embedding) this.main.append(this.nav);
      this.main.append(layout);
      const footer = element("footer"),
        credit = element("details");
      credit.append(element("summary", "圖的出處與授權"));
      const a = this.d.figure.attribution;
      for (const t of [
        a.author + "，" + a.book + "，Figure " + a.figure + "。",
        a.license + "。" + a.modification,
        a.credit,
        a.url,
        a.licenseUrl,
      ])
        credit.append(element("p", t, "url"));
      footer.append(credit);
      if (this.teacherMode) {
        const tools = element("details");
        tools.id = "teacher-tools";
        tools.append(
          element("summary", "教師檢查工具"),
          element("p", "本機模擬事件，不傳送平台或正式成績。"),
        );
        this.remove = this.button(
          "拿掉圖檢查",
          () => {
            this.s.removed = !this.s.removed;
            this.s.selected = [];
            this.render();
          },
          { id: "remove-image" },
        );
        tools.append(
          this.remove,
          this.button("重來並重排編號", () => this.restart(), {
            id: "restart",
          }),
        );
        footer.append(tools);
      }
      if (!this.embedding) this.host.append(h);
      this.host.append(this.main, footer);
      this.observer = new ResizeObserver(() => this.figure.sizeText());
      this.observer.observe(this.frame);
      if (this.embedding) {
        this.scale(this.embedding.fontScale, false);
        return;
      }
      addEventListener("storage", (e) => {
        if (e.key === "course-font-scale")
          this.scale(Number(e.newValue) === 1.3 ? 1.3 : 1, false);
      }, { signal: this.lifecycle.signal });
      let scale = 1;
      try {
        scale =
          Number(localStorage.getItem("course-font-scale")) === 1.3 ? 1.3 : 1;
      } catch {}
      this.scale(scale, false);
    }
    scale(value, save = true) {
      this.fontScale = value;
      const target = this.embedding ? this.host : document.documentElement;
      target.style.setProperty("--font-scale", String(value));
      this.normal?.setAttribute("aria-pressed", String(value === 1));
      this.large?.setAttribute("aria-pressed", String(value === 1.3));
      if (save)
        try {
          localStorage.setItem("course-font-scale", String(value));
        } catch {}
      this.figure?.sizeText();
    }
    destroy() {
      this.lifecycle.abort();
      this.timer?.dispose();
      this.observer.disconnect();
      this.figure.destroy();
      this.host.replaceChildren();
    }
    shuffle() {
      const previous = JSON.stringify(this.s.mapping);
      const pool = this.choiceNodes();
      let mapping;
      do {
        const ids = pool.map((n) => n.id);
        for (let i = ids.length - 1; i > 0; i--) {
          const j = randInt(i + 1);
          [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        mapping = Object.fromEntries(ids.map((id, i) => [id, i + 1]));
      } while (pool.length > 1 && JSON.stringify(mapping) === previous);
      this.s.mapping = mapping;

      const q = this.question();
      if (q?.mode === "statement" && q.statementOptions?.length) {
        const alias = q.aliases?.length ? q.aliases[randInt(q.aliases.length)] : null;
        const opts = q.statementOptions.map((o) => {
          let text = alias ? o.template.replace(/\{alias\}/g, alias) : o.template;
          text = text.replace(/\{([a-z0-9-]+)\}/g, (_, hid) => String(mapping[hid] ?? "?"));
          return { ...o, text };
        });
        for (let i = opts.length - 1; i > 0; i--) {
          const j = randInt(i + 1);
          [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        this.s.statementChoices = opts;
      } else {
        this.s.statementChoices = [];
      }
    }
    sourced(item, parent, tag = "p", cls = "") {
      const e = element(tag, item.text, cls);
      e.dataset.src = item.src;
      parent.append(e);
      return e;
    }
    sourceBox(items, showQuotes) {
      const d = element("details", "", "source-box");
      d.id = "sources";
      d.append(element("summary", this.d.ui.sourceHeading));
      const seen = new Set();
      for (const item of items.filter(Boolean)) {
        const k = item.src + "|" + item.quote;
        if (seen.has(k)) continue;
        seen.add(k);
        const p = element("p", "src：" + item.src);
        p.dataset.sourceRef = item.src;
        d.append(p);
        if (showQuotes) d.append(element("blockquote", item.quote));
        if (item.decision)
          d.append(element("p", "譯名依教師決定：" + item.decision));
      }
      return d;
    }
    timingNode() {
      if (this.s.phase === "explore")
        return this.stage().nodePrefix + "-" + (this.s.active || "intro");
      if (this.s.phase === "find") return this.question()?.id || null;
      return null;
    }
    guideNodes() {
      return this.stage().guideOrder || this.stage().hotspotIds;
    }
    see(id) {
      this.s.active = id;
      const firstVisit = !this.s.seen.has(id);
      this.s.seen.add(id);
      if (firstVisit) this.events.explore(this.embedding ? id : this.stage().nodePrefix + "-" + id);
      else if (this.embedding) this.events.resumeExplore?.(id);
    }
    nextGuide() {
      if (!this.available() || !this.s.guiding) return;
      this.figure.resetManualView();
      if (++this.s.guideIndex >= this.guideNodes().length) this.s.guiding = false;
      else {
        this.s.focusWhole = false;
        this.see(this.guideNodes()[this.s.guideIndex]);
      }
      this.render();
    }
    render() {
      if (this.s.phase === "explore" && this.s.guiding && this.available() && !this.s.active)
        this.see(this.guideNodes()[this.s.guideIndex]);
      this.timer?.enter(this.timingNode());
      const s = this.s,
        stage = this.stage(),
        q = this.question();
      this.nav.replaceChildren();
      for (const [i, a] of (this.embedding ? [] : [...this.d.stages, this.d.unitEnd]).entries()) {
        const p = element("span", a.title);
        if (i === s.stage) p.setAttribute("aria-current", "step");
        this.nav.append(p);
      }
      const isNameOrder = s.phase === "find" && q?.mode === "order" && q?.answerStyle === "name";
      const isStatement = s.phase === "find" && q?.mode === "statement";
      const isNameSingle = s.phase === "find" && q?.answerStyle === "name" && q?.mode !== "order";
      const locked =
        s.phase === "done" ||
        s.phase === "stage-done" ||
        s.phase === "explore" ||
        isNameSingle ||
        isNameOrder ||
        isStatement ||
        (s.phase === "find" && s.result !== null);
      const showName =
        s.phase === "explore" && s.active
          ? this.node(s.active).label.short
          : isNameSingle && s.result === true
            ? this.node(q.expected[0]).label.short
            : null;
      const focus =
        s.phase === "find" && ((s.revealed && s.result === true) || isNameSingle)
          ? q.expected
          : s.phase === "find" && q?.predict && s.result === true && !s.revealed
            ? []
            : s.phase === "find"
              ? s.selected
              : s.active
                ? [s.active]
                : [];
      const showNumbers = s.phase === "find" && q.answerStyle !== "name";
      this.figure.set({
        nodes: this.choiceNodes(),
        mapping: s.mapping,
        focus,
        name: showName,
        questionBadge: isNameSingle && s.result !== true ? "？" : null,
        multiBadges: isNameOrder,
        locked,
        removed: s.removed,
        noImageText: this.d.ui.noImage,
        showNumbers,
        autoFocus: s.phase === "explore",
        focusWhole: s.focusWhole,
        autoBox: s.phase === "find",
        findWhole: s.findWhole,
      });
      if (s.phase === "explore") {
        this.zoom.hidden = false;
        this.zoom.textContent = s.focusWhole ? "放大到部位" : "看完整圖";
        this.zoom.dataset.action = "focus-toggle";
      } else if (s.phase === "find") {
        this.zoom.hidden = false;
        this.zoom.textContent = s.findWhole ? "看局部" : "看完整圖";
        this.zoom.dataset.action = "find-focus-toggle";
      } else {
        this.zoom.hidden = true;
      }
      this.pad.replaceChildren();
      for (const n of (showNumbers && !isStatement ? this.choiceNodes() : [])
        .sort((a, b) => s.mapping[a.id] - s.mapping[b.id])) {
        const b = this.button(String(s.mapping[n.id]), () => this.pick(n.id), {
          disabled: locked || !this.available(),
        });
        b.dataset.choice = n.id;
        b.setAttribute("aria-label", "選圖上編號 " + s.mapping[n.id]);
        b.setAttribute("aria-pressed", String(s.selected.includes(n.id)));
        this.pad.append(b);
      }
      this.baseNote = s.phase === "explore"
        ? "看綠點指的位置，再讀旁邊的解說。"
        : isNameSingle
          ? "看綠點指的位置，從名稱中選答案。"
          : isNameOrder
            ? "依圖上的名稱，依序點選下方按鈕。"
            : isStatement
              ? "對照圖上的編號，選出正確的敘述。"
              : this.embedding
                ? "請按圖下方的編號作答。"
                : "可以點圖上的編號，也可以按下方的編號。";
      this.syncZoomUi();
      if (this.remove) {
        this.remove.textContent = s.removed ? "放回圖" : "拿掉圖檢查";
        this.remove.setAttribute("aria-pressed", String(s.removed));
      }
      this.work.replaceChildren();
      const refs = [];
      this.work.append(element("h2", stage.title));
      if (s.phase === "explore") {
        this.count.textContent =
          "已看 " + s.seen.size + "／" + this.nodes().length;
        const n = s.active ? this.node(s.active) : null;
        if (n) {
          this.sourced({...n.label, text:(n.emoji ? n.emoji + " " : "") + n.label.text}, this.work, "h3");
          const copy = element("div", "", "explanation-copy");
          for (const sentence of n.explanation || [n.fact]) this.sourced(sentence, copy);
          this.work.append(copy);
          for (const sentence of [n.exam, n.confusion].filter(Boolean)) this.sourced(sentence, this.work);
          refs.push(n.label, ...(n.explanation || [n.fact]), n.exam, n.confusion);
        } else {
          this.sourced(this.d.intro, this.work);
          refs.push(this.d.intro);
        }
        if (s.guiding) {
          const controls = element("div", "", "actions");
          controls.append(element("p", "導覽 " + (s.guideIndex + 1) + "／" + this.guideNodes().length));
          controls.append(this.button("下一處", () => this.nextGuide(), {id:"guide-next", primary:true}));
          controls.append(this.button("跳過", () => {s.guiding = false; this.render();}, {id:"guide-skip"}));
          this.work.append(controls);
        } else {
          this.work.append(element("p", "點名稱，圖上就會亮起那一處。"));
          const names = element("div", "", "name-pad");
          for (const id of this.guideNodes()) {
            const node = this.node(id);
            const b = this.button(node.label.short, () => this.pick(id));
            b.dataset.nameChoice = id;
            b.dataset.src = node.label.src;
            b.setAttribute("aria-pressed", String(s.active === id));
            names.append(b);
          }
          this.work.append(names);
        }
        if (!s.guiding) this.work.append(this.button("重新導覽", () => {s.guiding = true; s.guideIndex = 0; s.focusWhole = true; this.see(this.guideNodes()[0]); this.render();}, {id:"guide-restart"}));
        const actions = element("div", "", "actions");
        actions.append(
          this.button("進入找找看", () => this.startFind(), {
            id: "start-find",
            primary: true,
            disabled: s.guiding || s.seen.size !== this.nodes().length || !this.available(),
          }),
        );
        if (!s.guiding) this.work.append(actions);
      } else if (s.phase === "find") {
        this.count.textContent =
          "第 " + (s.q + 1) + "／" + stage.questions.length + " 題";
        this.work.append(element("p", "找找看 · 第 " + q.level + " 級"));
        if (q.fact) {
          this.sourced(q.fact, this.work, "p", "fact");
          refs.push(q.fact);
        }
        this.sourced(q.prompt, this.work, "p", "prompt");
        refs.push(q.prompt);
        if (isNameSingle || isNameOrder) {
          const names = element("div", "", "answer-names");
          for (const n of this.choiceNodes().slice().sort((a,b) => s.mapping[a.id]-s.mapping[b.id])) {
            const b = this.button(n.label.short, () => this.pick(n.id), {disabled:s.result !== null || !this.available()});
            b.dataset.answerName = n.id;
            b.setAttribute("aria-pressed", String(s.selected.includes(n.id)));
            names.append(b);
          }
          this.work.append(names);
        } else if (isStatement) {
          const box = element("div", "", "statement-pad");
          for (const opt of s.statementChoices) {
            const b = this.button(opt.text, () => this.pickStatement(opt.id), {
              disabled: s.result !== null || !this.available(),
            });
            b.dataset.statementId = opt.id;
            b.setAttribute("aria-pressed", String(s.selected[0] === opt.id));
            box.append(b);
          }
          this.work.append(box);
        }
        const hint = isNameSingle
          ? "看綠點指的位置，從名稱中選答案。"
          : isNameOrder
            ? "依圖上的名稱，依序點選下方按鈕。"
            : isStatement
              ? "對照圖上的編號，選出正確的敘述。"
              : q.mode === "order"
                ? "依題目順序選取，全部選好再確定。"
                : q.mode === "multi"
                  ? "可選多處，全部選好再確定。"
                  : "選好一處，再按確定。";
        const operationHint = element("p", hint);
        operationHint.dataset.operationHint = "";
        this.work.append(operationHint);
        this.selection = element("div", "", "selection");
        this.selection.id = "selection";
        if (isStatement) {
          const picked = s.selected.length ? s.statementChoices.find((o) => o.id === s.selected[0]) : null;
          this.selection.textContent = picked ? "已選：" + picked.text : "尚未選取";
        } else {
          this.selection.textContent = s.selected.length
            ? (q.mode === "order" ? "已排：" : "已選：") +
              s.selected
                .map((id) =>
                  q.answerStyle === "name"
                    ? this.node(id).label.short
                    : s.mapping[id],
                )
                .join(q.mode === "order" ? " → " : "、")
            : "尚未選取";
        }
        this.work.append(this.selection);
        const actions = element("div", "", "actions");
        if (s.result === null) {
          actions.append(
            this.button(
              "清除選取",
              () => {
                s.selected = [];
                this.render();
              },
              { disabled: !s.selected.length || !this.available() },
            ),
          );
          actions.append(
            this.button(q.predict ? "確定預測" : "確定", () => this.submit(), {
              id: "confirm",
              primary: true,
              disabled:
                !this.available() ||
                !s.selected.length ||
                (q.mode === "order" && s.selected.length !== q.expected.length),
            }),
          );
        } else {
          let fbObj = s.result ? (q.feedbackCorrect || q.feedback) : (q.feedbackWrong || q.feedback);
          let feedbackText;
          if (isStatement) {
            const opt = s.statementChoices.find((o) => o.id === s.selected[0]);
            fbObj = opt?.feedback || fbObj;
            feedbackText = fbObj.text;
          } else {
            const body = fbObj.text.replace(/[。！？]+$/, "");
            if (s.result) {
              feedbackText = "答對了！" + body.replace(/^正解是/, "") + "。";
            } else {
              const names = s.selected.map((id) => this.node(id).label.short).join("、");
              feedbackText = "你選到的是" + names + "；" + body + "。";
            }
          }
          const feedback = element("p", feedbackText, "feedback " + (s.result ? "correct" : "error"));
          feedback.id = "feedback";
          feedback.dataset.src = isStatement
            ? fbObj.src
            : [...s.selected.map((id) => this.node(id).label.src), fbObj.src].join("；");
          this.work.append(feedback);
          refs.push(
            ...(isStatement ? [] : s.selected.map((id) => this.node(id).label)),
            fbObj,
            ...(q.support || []),
            q.reasoningSource,
          );
          if (q.predict && s.result && !s.revealed)
            actions.append(
              this.button(
                "揭曉圖上位置",
                () => {
                  s.revealed = true;
                  this.render();
                },
                { id: "reveal", primary: true },
              ),
            );
          else if (s.result)
            actions.append(
              this.button(
                s.q === stage.questions.length - 1 ? "完成這一關" : "下一題",
                () => this.advance(),
                { id: "next", primary: true },
              ),
            );
          else
            actions.append(
              this.button("再找一次", () => this.retry(), {
                id: "retry",
                primary: true,
              }),
            );
        }
        this.work.append(actions);
      } else if (s.phase === "stage-done") {
        this.count.textContent = "本關已完成";
        this.work.classList.add("completion");
        this.work.append(element("p", "這一關的探索與看圖任務都完成了。"));
        this.work.append(
          this.button(
            s.stage === this.d.stages.length - 1
              ? "進入單元末推理"
              : "進入下一關",
            () => this.nextStage(),
            { id: "next-stage", primary: true },
          ),
        );
      } else {
        this.count.textContent = "已完成";
        this.work.classList.add("completion");
        this.work.append(element("p", "本單元的看圖任務都完成了。"));
        this.work.append(
          this.button("再練一次", () => this.restart(), {
            id: "again",
            primary: true,
          }),
        );
      }
      if (s.phase !== "done" && s.phase !== "stage-done")
        this.work.classList.remove("completion");
      if (refs.length)
        this.work.append(
          this.sourceBox(refs, s.phase === "explore" || s.result !== null),
        );
      if (!this.available())
        for (const b of this.work.querySelectorAll("button")) b.disabled = true;
    }
    pickStatement(optId) {
      const s = this.s;
      if (!this.available() || s.phase !== "find" || s.result !== null) return;
      if (this.embedding && !s.statementChoices.find((o) => o.id === optId)?.correct)
        this.events.findError?.(this.question().id, optId, { mode: "statement", position: 1 });
      s.selected = [optId];
      this.render();
    }
    pick(id) {
      const s = this.s;
      if (
        !this.available() ||
        ["done", "stage-done"].includes(s.phase) ||
        (s.phase === "find" && s.result !== null) ||
        !this.choiceNodes().some((n) => n.id === id)
      )
        return;
      if (s.phase === "explore") {
        s.focusWhole = false;
        this.see(id);
      } else {
        const q = this.question();
        const removing = q.mode !== "single" && s.selected.includes(id);
        const position = s.selected.length + 1;
        const correctPick =
          q.mode === "order"
            ? q.expected[position - 1] === id
            : q.expected.includes(id);
        if (!removing && !correctPick)
          this.events.findError?.(q.id, id, { mode: q.mode, position });
        if (q.mode === "single") s.selected = [id];
        else if (s.selected.includes(id))
          s.selected = s.selected.filter((x) => x !== id);
        else s.selected.push(id);
      }
      this.render();
    }
    ambiguous(ids) {
      if (
        this.s.phase !== "find" || !this.available() ||
        ["done", "stage-done"].includes(this.s.phase) ||
        (this.s.phase === "find" && this.s.result !== null)
      )
        return;
      this.work.querySelector(".chooser")?.remove();
      const box = element("div", "", "chooser");
      box.id = "chooser";
      box.append(
        element(
          "p",
          ids.length
            ? "這裡有重疊範圍，請再選區域編號。"
            : "這裡沒有可選區域，請再看圖上的位置。",
        ),
      );
      for (const id of ids)
        box.append(
          this.button("區域 " + this.s.mapping[id], () => this.pick(id)),
        );
      this.work.append(box);
    }
    syncZoomUi() {
      const activePhase = this.s.phase === "explore" || this.s.phase === "find";
      const inspecting = this.figure.inspectMode;
      const zoomed = !!this.figure.manualView;
      if (this.inspectBtn) {
        this.inspectBtn.hidden = !activePhase;
        this.inspectBtn.textContent = inspecting || zoomed ? "結束放大" : "局部放大";
        this.inspectBtn.setAttribute("aria-pressed", String(inspecting || zoomed));
      }
      if (!activePhase) {
        this.note.classList.remove("zoom-active");
        this.note.textContent = this.baseNote || "";
        return;
      }
      this.note.classList.toggle("zoom-active", inspecting || zoomed);
      if (inspecting) {
        this.note.textContent = zoomed
          ? "局部放大中：拖曳可移動位置，滾輪或雙指可調倍率；點「結束放大」回到作答。"
          : "局部放大中：點圖上想看的地方即可放大，拖曳移動；點「結束放大」回到作答。";
      } else if (zoomed) {
        this.note.textContent = (this.baseNote || "") + "（已放大：可拖曳移動，點「結束放大」復原）";
      } else {
        this.note.textContent = (this.baseNote || "") + " 要細看可按右上「局部放大」，或雙指／滾輪縮放。";
      }
    }
    resetZoom() {
      this.s.findWhole = false;
      this.figure.resetManualView();
    }
    startFind() {
      if (this.s.guiding || this.s.seen.size !== this.nodes().length || !this.available()) return;
      this.events.endExplore?.();
      this.s.phase = "find";
      this.s.active = null;
      this.s.selected = [];
      this.s.q = 0;
      this.s.result = null;
      this.s.revealed = false;
      this.resetZoom();
      this.shuffle();
      this.render();
    }
    submit() {
      const s = this.s,
        q = this.question();
      if (
        s.phase !== "find" ||
        s.result !== null ||
        !this.available() ||
        !s.selected.length
      )
        return;
      if (q.mode === "order" && s.selected.length !== q.expected.length) return;
      s.attempts++;
      if (q.mode === "statement") {
        const opt = s.statementChoices.find((o) => o.id === s.selected[0]);
        s.result = !!opt?.correct;
      } else {
        s.result =
          q.mode === "order"
            ? JSON.stringify(s.selected) === JSON.stringify(q.expected)
            : s.selected.length === q.expected.length &&
              s.selected.every((id) => q.expected.includes(id));
      }
      this.events.answer(q.id, s.result);
      this.render();
    }
    retry() {
      if (this.s.result !== false) return;
      this.s.selected = [];
      this.s.result = null;
      this.s.revealed = false;
      this.resetZoom();
      this.shuffle();
      this.render();
    }
    advance() {
      const s = this.s,
        q = this.question();
      if (s.result !== true || (q.predict && !s.revealed)) return;
      s.q++;
      s.selected = [];
      s.result = null;
      s.revealed = false;
      this.resetZoom();
      if (s.q === this.stage().questions.length) {
        if (this.embedding) {
          this.embedding.onPass();
          return;
        }
        if (s.stage === this.d.stages.length) {
          s.phase = "done";
          if (!s.completed) {
            this.timer.enter(null);
            this.events.complete();
            s.completed = true;
          }
        } else s.phase = "stage-done";
      } else this.shuffle();
      this.render();
    }
    nextStage() {
      if (this.s.phase !== "stage-done") return;
      this.s.stage++;
      this.s.phase = this.s.stage === this.d.stages.length ? "find" : "explore";
      this.s.q = 0;
      this.s.active = null;
      this.s.seen.clear();
      this.s.guiding = true;
      this.s.guideIndex = 0;
      this.s.focusWhole = true;
      this.s.selected = [];
      this.s.result = null;
      this.s.revealed = false;
      this.resetZoom();
      this.shuffle();
      this.render();
    }
    restart() {
      this.timer.enter(null);
      Object.assign(this.s, {
        stage: 0,
        phase: "explore",
        seen: new Set(),
        guiding: true,
        guideIndex: 0,
        focusWhole: true,
        selected: [],
        active: null,
        q: 0,
        result: null,
        revealed: false,
        removed: false,
        completed: false,
        attempts: 0,
      });
      this.resetZoom();
      this.shuffle();
      this.render();
    }
    snapshot() {
      return {
        stage: this.stage().id,
        stageIndex: this.s.stage,
        phase: this.s.phase,
        seen: [...this.s.seen],
        selected: [...this.s.selected],
        q: this.s.q,
        result: this.s.result,
        revealed: this.s.revealed,
        mapping: { ...this.s.mapping },
        available: this.available(),
        completed: this.s.completed,
      };
    }
  }
  window.InteractiveCore = { App };
})();
