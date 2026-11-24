import assert from 'node:assert/strict';
import { test } from 'node:test';
import { harness, setupPage, thinIndex } from './browser-utils.mjs';

test('a correct choice does not preselect the same option ID on the next question', () =>
  harness(async ({ base, browser, put }) => {
    const questions = ['q1', 'q2'].map(id => ({
      id,
      mode: 'single',
      prompt: '請選擇一項',
      options: [{ id: 'o0', text: '選項一' }, { id: 'o1', text: '選項二' }],
      answer: 'o0',
      feedbackCorrect: '答對了',
    }));
    const content = {
      slug: 'quiz-reset',
      activityId: 'quiz-reset',
      title: '選項狀態測試',
      ui: {
        levelTab: '第 {n} 關',
        questionHeader: '第 {n}／{total} 題',
        start: '開始',
        startQuiz: '開始作答',
        submit: '確定',
        next: '下一題',
      },
      opening: { prompt: '合成測試' },
      encouragement: {},
      levels: [{ id: 'L1', title: '第一關', noFigure: true, states: [], questions }],
    };
    await put('demo/index.html', thinIndex());
    await put('demo/lesson-data.js', `window.MaterialShellContent = ${JSON.stringify(content)};`);
    const { context, page, errors } = await setupPage(browser);
    try {
      page.setDefaultTimeout(4500);
      await page.goto(`${base}/demo/index.html`);
      await page.locator('#btn-start').click();
      await page.locator('#btn-start-quiz').click();
      await page.locator('[data-opt-id="o0"]').click();
      await page.locator('#btn-submit-choice').click();
      assert.equal(await page.locator('[data-opt-id="o0"].correct').count(), 1);

      await page.locator('#btn-next-q').click();
      assert.equal(await page.evaluate(() => App.state.questionIdx), 1);
      assert.equal(await page.locator('[data-opt-id].selected').count(), 0);
      assert.equal(await page.locator('#btn-submit-choice').isDisabled(), true);
      assert.deepEqual(await page.evaluate(() => __events.filter(event => event.type === 'answer')),
        [{ type: 'answer', args: ['q1', true] }]);

      await page.locator('[data-opt-id="o0"]').click();
      assert.equal(await page.locator('#btn-submit-choice').isEnabled(), true);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  }));
