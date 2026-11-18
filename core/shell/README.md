# 期中考後共用外殼與 FigureLevel 介面

本件只提供外殼與合成測試，不含可發布教材。第一階段不接真正互動圖核心，不遷移既有教材。

## 基準與載入

採用已審 D7 的 index.html，SHA-256：
`dbebecf08ec40f7579a150103f7c6478e5663de35fc72ef88b37653f47bea9dd`。
同批 D8 扣除 title 與 DATA 後引擎相同；D7、D8 的草稿副本與教案包副本各自逐位元一致。
原 CSS 與流程抽為 shell.css／shell.js；資料由呼叫端提供，外殼不含教學內容或正解。

每份教材保留薄 index.html，按以下順序載入（資料與圖片須另經教師核准）：

```html
<link rel="stylesheet" href="../core/shell/shell.css">
<script src="../course-learning.js"></script>
<script defer src="lesson-data.js"></script>
<!-- figure 關卡另載入實際核心；第一階段僅在測試使用替身 -->
<script defer src="../core/shell/shell.js"></script>
```

lesson-data.js 設定 `window.MaterialShellContent`，DOM ready 後自動 mount。
也可不設該變數，在 DOM ready 後呼叫 `window.MaterialShell.mount(content)`；每個 document 僅 mount 一次。
外殼自行建立 header、主內容與對話框，保留原 window.App 供既有本機走查使用。
不需要每份教材複製外殼 HTML；範本函式見 test/browser-utils.mjs 的 thinIndex。

## figure 關卡

合成資料形狀（不含實際教材）：

```js
{
  id: 'L1', kind: 'figure', title: '範例關卡', summary: '範例重點',
  figure: { lesson: 'figures/example-lesson.json', stage: 'stage-one' }
}
```

`lesson` 相對於教材 index.html，`stage` 是互動圖核心的 stage ID，外殼原樣傳入，不自行 fetch。
真正核心須提供同步生命週期方法 `window.FigureLevel`：

```js
FigureLevel.mount(container, {
  lesson, stage, fontScale, events, trackingPrefix, onPass
});
FigureLevel.setFontScale(fontScale);
FigureLevel.unmount();
```

- mount 以 HTMLElement 接收主內容區，figure 關卡不建立原狀態按鈕或文字題；mount 不同關才呼叫一次，單純 render 不重掛。
- mount 同步完成基本註冊，資料可在內部非同步載入；unmount 必須取消監聽、計時器及非同步載入，清空該容器。
- onPass 為無參數 callback。只接受當次掛載第一次有效通過；套原過關卡、鼓勵句及下一關流程。下一關鈕只會在過關卡建立。
- onPass 不代送 answer。核心必須自行送出實際題目的 answer；整份教材的 complete 僅由外殼最後考核流程送出。
- 離開 TEACH 或換關即 unmount，先使舊 callbacks／events 失效，再呼叫核心清理；舊關非同步完成不能越級解鎖。
- 缺少核心或 lesson／stage 時拋錯並保持鎖定，不自動過關。
- 作答只用圖下按鈕（至少 44px），不拖曳、不在圖上點選或轉箭頭作答。

## 追蹤契約

trackingPrefix 為 content.slug，與原教材事件 ID 的開頭一致。
傳入 events 的 id 為當關局部 suffix（只接受英數、底線、連字號），不可再加完整 prefix。

| 呼叫 | SDK 收到的 ID |
|---|---|
| events.explore('p1') | `<slug>-node-<level.id>-p1` |
| events.nodeTime('p1', seconds) | `<slug>-node-<level.id>-p1` |
| events.answer('1', correct) | `<slug>-level-<1-based level index>-1` |
| events.hint('1') | `<slug>-level-<1-based level index>-1` |

events.explore 同時開啟原 trackTime；換探索節點或 unmount 時沿用原 nodeTime 計時（整秒、上限 60 秒）。
events.nodeTime 適用核心自行管理的獨立片段；同一片段不可與 explore 自動計時重複報送。
events 不暴露 complete。教材資料的 tracking.nodeIds、questionIds、分母須納入所用完整 ID，整合時另行核對，外殼不猜測分母。

## 字級與可讀性差異

fontScale 至少 1，讀取同網域 localStorage `course-font-scale`：small／default→1、large→1.15、xlarge→1.3，也接受數值。
初次載入及 storage 事件更新 CSS 變數；CSS 變數改變時呼叫 FigureLevel.setFontScale，不重掛或改進度。
相同 document 寫 localStorage 不會自發 storage 事件，呼叫端須同步修改 CSS 變數或派發 storage 事件。
跨網域 iframe 無法讀平台 localStorage，本件未增加跨網域字級協定，須在後續平台接入時驗證。

新外殼保留流程、文字、題序、事件，但有以下必要閱讀修正，不能宣稱外觀逐像素等價：
主色加深為 #0369a1；說明／回饋／caption 行高至少 1.6；title-stem 由 20 增為 21px；badge-lock 由 16 增為 18px；鎖定按鈕維持實色以符合對比。
只提高字級、不縮小；所有修正僅作用於期中後新外殼，不回寫基準教材。

## 測試

Node 22 以上；`npm ci` 後執行 `npx playwright install chromium`，Ubuntu 缺系統函式庫時由環境管理者提供，測試本身不需 root。

```sh
node scripts/check.mjs
node --test scripts/test/*.test.mjs
node --test core/shell/test/figure.test.mjs
node core/shell/test/compare-d7.mjs --source '<唯讀 D7 單元目錄>' --out '<repo 外證據目錄>'
```

compare-d7 使用 os.tmpdir() 建立原版／新組裝版，localhost ephemeral port，mock SDK，無正式平台通訊。
測試從外部輸入讀取資料與正解，不在新站保留；自動逐步比對可見文字、題序與五種 SDK 事件（含 ID、布林值與秒數）。
兩種字級皆包含逐關、錯答、提示、重試、統整、是非、兩階段考核錯答重來與逾時重來、完成一次。
固定時鐘與 PRNG 排除測試速度及隨機鼓勵句差異，不改寫 App 狀態或直接跳關；Playwright 點按及 clock.runFor 推進真實處理器。
每步自動量測字級、內文行高、按鈕高度、文字裁切、水平溢出、純色背景與有效透明度對比。
圖中文字與複雜背景不以 DOM 量測代替教師校正；沒有宣稱未實作的完整製作產線檢查已通過。
截圖只存新組裝 D7 的預設／特大各一張，不作逐張驗收；保留七天。原始 trace／events 存於指定 repo 外證據目錄。

test/figure-stub.js 僅供合成測試；正式教材不要載入。figure.test.mjs 不使用真教材資料。
check.mjs 只精確增加本 README 為允許文件，其他 core Markdown 仍拒絕。
