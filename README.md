# AP2 互動教材

本庫只放可發布教材與共用程式。學生請由課程平台進入；首頁不列教材。
每份教材使用 `<slug>/index.html` 與壓縮後資源，以相對路徑載入 `../course-learning.js`；共用核心放 `core/`。
不得放個資、教案、content.json、正解檔、來源對照、設計說明、底稿與原始大圖。

`materials.json` 是清單，每筆含 `slug`、`title`、`nodeTotal`、`questionTotal`、`materialVersion`、`figures`（圖片授權摘要）；空站使用 `[]`。

SDK 原樣複製自平台 `public/materials/course-learning.js`。原檔沒有語意版本欄位，故 `sdk-version.json` 的 `version` 為 `sha256:<檔案雜湊>`，`sha256` 固定完整指紋；檢查兩者與 SDK 實際位元一致。

本機檢查：`node scripts/check.mjs`；否定案例：`node --test scripts/test/*.test.mjs`。需 Node 22 以上，無外部相依，Ubuntu 非 root 可跑。
容量上限採十進位 MB（單檔 5 × 1000 × 1000 bytes、整站 800 × 1000 × 1000 bytes）。外殼瀏覽器測試另需安裝 package-lock.json 鎖定的 Playwright，見 core/shell/README.md。

發布由教師推送 main，Actions 檢查通過才發布 GitHub Pages；PR 僅檢查。Pages 來源須選 GitHub Actions。請先完成 Claude 驗收，agent 不自行推送。
OpenStax 改作圖須依 ATTRIBUTION.md 附上原出處、圖號、授權及修改聲明；授權不明不得發布。
