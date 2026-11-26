/* D4 L4 四步圖解與回想內容。 */
window.GastricAcidMarkup = `
  <section id="lesson" aria-label="胃酸四步圖解">
    <h1 class="standalone-title">胃酸怎麼來</h1>
    <div class="tips" aria-label="看圖前先記兩件事">
    <span class="chip"><span class="acid">H⁺</span>（氫離子）越多，越<span class="acid">酸</span></span>
    <span class="chip"><span class="base">HCO₃⁻</span>（碳酸氫根）會中和酸，偏<span class="base">鹼</span></span>
  </div>
    <figure class="diagram"><svg viewBox="0 0 360 340" role="img" aria-labelledby="figt">
      <title id="figt">壁細胞製造胃酸示意圖（依生理學課本圖 7-16 簡化）</title>
      <defs>
        <marker id="ak" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1f2a33"/></marker>
        <marker id="aa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#c8321f"/></marker>
        <marker id="ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#0f7a6c"/></marker>
        <marker id="ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2457a6"/></marker>
      </defs>
      <!-- 三區：血液／壁細胞／小管（通往胃腔） -->
      <rect x="2" y="36" width="64" height="300" rx="10" fill="#fde8e4" stroke="#e9a091"/>
      <text x="34" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#8a2f1f">血液</text>
      <rect x="76" y="36" width="208" height="300" rx="14" fill="#f4f7f9" stroke="#7d8d99" stroke-width="2"/>
      <text x="180" y="26" text-anchor="middle" font-size="14" font-weight="700">壁細胞</text>
      <rect x="294" y="36" width="64" height="300" rx="10" fill="#fff4d6" stroke="#e0b34a"/>
      <text x="326" y="18" text-anchor="middle" font-size="13" font-weight="700" fill="#7a5600">小管</text>
      <text x="326" y="32" text-anchor="middle" font-size="12" fill="#7a5600">通往胃腔</text>

      <!-- 步驟 1：碳酸酐酶 -->
      <g id="s1">
        <rect x="104" y="48" width="152" height="40" rx="8" fill="#fff" stroke="#c9d4dc"/>
        <text x="180" y="66" text-anchor="middle" font-size="14" font-weight="700">CO₂ ＋ H₂O</text>
        <text x="180" y="82" text-anchor="middle" font-size="12" fill="#5b6b78">二氧化碳 ＋ 水</text>
        <line x1="180" y1="90" x2="180" y2="112" stroke="#1f2a33" stroke-width="2" marker-end="url(#ak)"/>
        <circle cx="180" cy="132" r="20" fill="#e6eefb" stroke="#2457a6" stroke-width="2"/>
        <text x="180" y="137" text-anchor="middle" font-size="12" font-weight="700" fill="#2457a6">酵素</text>
        <text x="206" y="122" font-size="12" fill="#2457a6">碳酸酐酶</text>
        <text x="206" y="138" font-size="12" fill="#5b6b78">讓這步變快</text>
        <line x1="180" y1="154" x2="180" y2="174" stroke="#1f2a33" stroke-width="2" marker-end="url(#ak)"/>
        <text x="180" y="192" text-anchor="middle" font-size="14" font-weight="700">H₂CO₃ 碳酸</text>
        <text x="180" y="209" text-anchor="middle" font-size="12" fill="#5b6b78">馬上一拆為二</text>
        <line x1="168" y1="216" x2="136" y2="240" stroke="#0f7a6c" stroke-width="2" marker-end="url(#ab)"/>
        <line x1="192" y1="216" x2="224" y2="240" stroke="#c8321f" stroke-width="2" marker-end="url(#aa)"/>
        <circle cx="128" cy="262" r="21" fill="#dcf2ee" stroke="#0f7a6c" stroke-width="2"/>
        <text x="128" y="267" text-anchor="middle" font-size="13" font-weight="800" fill="#0f7a6c">HCO₃⁻</text>
        <text x="128" y="300" text-anchor="middle" font-size="12" font-weight="700" fill="#0f7a6c">鹼</text>
        <circle cx="232" cy="262" r="17" fill="#fbe1dc" stroke="#c8321f" stroke-width="2"/>
        <text x="232" y="267" text-anchor="middle" font-size="15" font-weight="800" fill="#c8321f">H⁺</text>
        <text x="232" y="300" text-anchor="middle" font-size="12" font-weight="700" fill="#c8321f">酸</text>
      </g>

      <!-- 步驟 2：血液側 HCO₃⁻ 出、Cl⁻ 進；Na⁺ 帶 Cl⁻ 進 -->
      <g id="s2" opacity="0">
        <rect x="100" y="52" width="160" height="62" rx="8" fill="#fff" stroke="#c9d4dc"/>
        <text x="180" y="74" text-anchor="middle" font-size="13" font-weight="800">血液這一側</text>
        <text x="180" y="92" text-anchor="middle" font-size="12">HCO₃⁻ 出去一個、Cl⁻ 換進來一個</text>
        <text x="180" y="108" text-anchor="middle" font-size="12" fill="#2457a6" font-weight="700">＝氯轉移（電荷保持平衡）</text>
        <rect x="70" y="236" width="14" height="52" rx="5" fill="#dcf2ee" stroke="#0f7a6c" stroke-width="2"/>
        <circle cx="128" cy="262" r="21" fill="#dcf2ee" stroke="#0f7a6c" stroke-width="2"/>
        <text x="128" y="267" text-anchor="middle" font-size="13" font-weight="800" fill="#0f7a6c">HCO₃⁻</text>
        <path d="M106 252 L 46 252" fill="none" stroke="#0f7a6c" stroke-width="2.2" marker-end="url(#ab)"/>
        <path d="M46 276 L 104 276" fill="none" stroke="#2457a6" stroke-width="2" marker-end="url(#ac)"/>
        <text x="122" y="296" font-size="13" font-weight="800" fill="#2457a6">Cl⁻</text>
        <rect x="70" y="140" width="14" height="46" rx="5" fill="#eef2ff" stroke="#2457a6" stroke-width="2"/>
        <path d="M30 156 L 104 156" fill="none" stroke="#1f2a33" stroke-width="2" marker-end="url(#ak)"/>
        <path d="M30 174 L 104 174" fill="none" stroke="#2457a6" stroke-width="2" marker-end="url(#ac)"/>
        <text x="110" y="160" font-size="13" font-weight="800">Na⁺</text>
        <text x="110" y="179" font-size="13" font-weight="800" fill="#2457a6">＋Cl⁻</text>
        <text x="150" y="168" font-size="12" fill="#5b6b78">Na⁺ 順勢流進來，順便帶 Cl⁻</text>
        <rect x="4" y="196" width="60" height="40" rx="8" fill="#fff" stroke="#0f7a6c" stroke-width="2"/>
        <text x="34" y="214" text-anchor="middle" font-size="12" font-weight="800" fill="#0f7a6c">血液偏鹼</text>
        <text x="34" y="230" text-anchor="middle" font-size="12" font-weight="800" fill="#0f7a6c">＝鹼潮</text>
      </g>

      <!-- 步驟 3：H⁺–K⁺ 幫浦、K⁺ 帶 Cl⁻ 出到小管、合成 HCl -->
      <g id="s3" opacity="0">
        <rect x="96" y="52" width="168" height="62" rx="8" fill="#fff8e6" stroke="#e0b34a"/>
        <text x="180" y="74" text-anchor="middle" font-size="13" font-weight="800" fill="#7a5600">H⁺–K⁺ 幫浦（氫鉀幫浦）</text>
        <text x="180" y="93" text-anchor="middle" font-size="12" font-weight="700" fill="#7a5600">H⁺ 推出去、K⁺ 換進來</text>
        <text x="180" y="108" text-anchor="middle" font-size="12" fill="#7a5600">要花能量（ATP，主動運輸）</text>
        <rect x="276" y="140" width="16" height="56" rx="6" fill="#ffe7a8" stroke="#b07d00" stroke-width="2"/>
        <circle cx="232" cy="168" r="17" fill="#fbe1dc" stroke="#c8321f" stroke-width="2"/>
        <text x="232" y="173" text-anchor="middle" font-size="15" font-weight="800" fill="#c8321f">H⁺</text>
        <path d="M250 158 L 316 158" fill="none" stroke="#c8321f" stroke-width="2.2" marker-end="url(#aa)"/>
        <path d="M330 184 L 254 184" fill="none" stroke="#1f2a33" stroke-width="2" marker-end="url(#ak)"/>
        <text x="338" y="188" text-anchor="end" font-size="13" font-weight="800">K⁺</text>
        <rect x="276" y="226" width="16" height="42" rx="6" fill="#eef2ff" stroke="#2457a6" stroke-width="2"/>
        <path d="M218 238 L 316 238" fill="none" stroke="#1f2a33" stroke-width="2" marker-end="url(#ak)"/>
        <path d="M218 256 L 316 256" fill="none" stroke="#2457a6" stroke-width="2" marker-end="url(#ac)"/>
        <text x="160" y="242" font-size="13" font-weight="800">K⁺</text>
        <text x="152" y="261" font-size="13" font-weight="800" fill="#2457a6">＋Cl⁻</text>
        <text x="180" y="284" text-anchor="middle" font-size="12" fill="#5b6b78">K⁺ 帶著 Cl⁻ 一起出去</text>
        <rect x="298" y="282" width="58" height="50" rx="8" fill="#fff" stroke="#c8321f" stroke-width="2"/>
        <text x="327" y="300" text-anchor="middle" font-size="12" font-weight="700">H⁺＋Cl⁻</text>
        <text x="327" y="316" text-anchor="middle" font-size="13" font-weight="800" fill="#c8321f">＝HCl</text>
        <text x="327" y="327" text-anchor="middle" font-size="12" textLength="52" lengthAdjust="spacing" fill="#c8321f">鹽酸＝胃酸</text>
      </g>

      <!-- 步驟 4：Na⁺–K⁺ 幫浦 -->
      <g id="s4" opacity="0">
        <rect x="96" y="52" width="168" height="78" rx="8" fill="#fff8e6" stroke="#e0b34a"/>
        <text x="180" y="74" text-anchor="middle" font-size="13" font-weight="800" fill="#7a5600">Na⁺–K⁺ 幫浦（鈉鉀幫浦）</text>
        <text x="180" y="93" text-anchor="middle" font-size="12" font-weight="700" fill="#7a5600">在血液這一側</text>
        <text x="180" y="110" text-anchor="middle" font-size="12" fill="#7a5600">每次 3 個 Na⁺ 出去、2 個 K⁺ 進來</text>
        <text x="180" y="125" text-anchor="middle" font-size="12" fill="#5b6b78">要花能量（ATP）</text>
        <rect x="68" y="236" width="18" height="60" rx="6" fill="#ffe7a8" stroke="#b07d00" stroke-width="2"/>
        <path d="M110 250 L 30 250" fill="none" stroke="#1f2a33" stroke-width="2.2" marker-end="url(#ak)"/>
        <path d="M30 280 L 110 280" fill="none" stroke="#1f2a33" stroke-width="2" marker-end="url(#ak)"/>
        <text x="116" y="255" font-size="13" font-weight="800">3 Na⁺ 出去</text>
        <text x="116" y="285" font-size="13" font-weight="800">2 K⁺ 進來</text>
        <rect x="104" y="140" width="152" height="80" rx="8" fill="#fff" stroke="#c9d4dc"/>
        <text x="180" y="160" text-anchor="middle" font-size="12" font-weight="700">出去的正電比進來的多</text>
        <text x="180" y="177" text-anchor="middle" font-size="12" font-weight="800" fill="#2457a6">→ 細胞裡偏負電（−）</text>
        <text x="180" y="194" text-anchor="middle" font-size="12" fill="#5b6b78">負電把同樣帶負電的 Cl⁻</text>
        <text x="180" y="209" text-anchor="middle" font-size="12" fill="#5b6b78">往小管推，幫忙做出胃酸</text>
        <path d="M258 180 L 314 180" fill="none" stroke="#2457a6" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#ac)"/>
        <text x="326" y="176" text-anchor="middle" font-size="13" font-weight="800" fill="#2457a6">Cl⁻</text>
        </g>
    </svg></figure>
    <div class="steps" role="group" aria-label="選擇步驟">
    <button id="b1" aria-pressed="true" data-s="1">1 做出酸和鹼</button>
    <button id="b2" aria-pressed="false" data-s="2">2 鹼出去、Cl⁻ 進來</button>
    <button id="b3" aria-pressed="false" data-s="3">3 酸送進胃</button>
    <button id="b4" aria-pressed="false" data-s="4">4 鈉鉀幫浦</button>
  </div>
    
    <section class="step-content" id="step-1" aria-label="第 1 步收支和說明">
      <section class="ledger" aria-labelledby="ledger-1">
        <h2 id="ledger-1">收支小卡 · 壁細胞內</h2>
        <dl><div class="ledger-row"><dt>原料</dt><dd><strong>CO₂ ＋ H₂O</strong><span>形成碳酸。</span></dd></div>
<div class="ledger-row outgoing"><dt>產物</dt><dd><strong>H⁺ 和 HCO₃⁻</strong><span>碳酸解離成這兩種離子。</span></dd></div></dl>
      </section>
      <details class="explanation">
        <summary>白話說明與課本出處</summary>
        <p class="plain">壁細胞裡有一種<b>酵素（碳酸酐酶）</b>，把 CO₂ 和水湊在一起變成碳酸，碳酸馬上拆成兩半：一半是<span class="acid">H⁺（酸）</span>，一半是<span class="base">HCO₃⁻（鹼）</span>。</p>
        <p class="src">課本：CO₂ 與 H₂O 在碳酸酐酶催化下形成 H₂CO₃，而後迅速分解成 HCO₃⁻ 和 H⁺。（生理 CH07 p.7-24 第 1 步）</p>
      </details>
    </section>
    <section class="step-content" id="step-2" aria-label="第 2 步收支和說明" hidden>
      <section class="ledger" aria-labelledby="ledger-2">
        <h2 id="ledger-2">收支小卡 · 血液側</h2>
        <dl><div class="ledger-row outgoing"><dt>出去</dt><dd><strong>HCO₃⁻</strong><span>進入血液，形成鹼潮。</span></dd></div>
<div class="ledger-row"><dt>進來</dt><dd><strong>Cl⁻</strong><span>跟移出的 HCO₃⁻ 交換。</span></dd></div>
<div class="ledger-row"><dt>進來</dt><dd><strong>Na⁺ 和 Cl⁻</strong><span>Na⁺ 順濃度差帶入 Cl⁻。</span></dd></div></dl>
      </section>
      <details class="explanation">
        <summary>白話說明與課本出處</summary>
        <p class="plain">細胞裡的 <span class="base">HCO₃⁻</span> 越積越多，就被送到血液那一側；每送出一個 <span class="base">HCO₃⁻</span>，就換一個 Cl⁻ 進來，電荷才會平衡。這就是呼吸系統學過的<b>氯轉移</b>，和紅血球運送 CO₂ 時是同一個道理。Na⁺ 也從外面流進細胞，順便帶 Cl⁻ 進來。出去的 <span class="base">HCO₃⁻</span> 進入流過胃的血液，血液暫時<b>偏鹼</b>，叫做<b>鹼潮</b>。</p>
        <p class="src">課本：過多的 HCO₃⁻ 被動分泌出細胞外，再以電荷平衡的動力將 Cl⁻ 送入細胞；HCO₃⁻ 進入流經胃部的血管，使血液呈鹼性，稱為鹼潮。Na⁺ 因濃度差進入細胞，同時帶入 Cl⁻。（CH07 p.7-24 第 2、3 步）氯轉移：HCO₃⁻ 擴散入血漿，Cl⁻ 進入紅血球取代 HCO₃⁻（CH06 p.6-28）。</p>
      </details>
    </section>
    <section class="step-content" id="step-3" aria-label="第 3 步收支和說明" hidden>
      <section class="ledger" aria-labelledby="ledger-3">
        <h2 id="ledger-3">收支小卡 · 小管側</h2>
        <dl><div class="ledger-row outgoing"><dt>出去</dt><dd><strong>H⁺</strong><span>氫鉀幫浦耗能送入小管。</span></dd></div>
<div class="ledger-row"><dt>產物</dt><dd><strong>鹽酸（HCl）</strong><span>Cl⁻ 與 H⁺ 在小管會合。</span></dd></div></dl>
      </section>
      <details class="explanation">
        <summary>白話說明與課本出處</summary>
        <p class="plain">面向胃腔那一側有 <b>H⁺–K⁺ 幫浦（氫鉀幫浦）</b>：把 <span class="acid">H⁺</span> 推進小管，<b>要花能量</b>。<span class="acid">H⁺</span> 和 Cl⁻ 在小管會合，變成<b>鹽酸（HCl）</b>，就是胃酸。</p>
        <p class="plain">乙醯膽鹼、胃泌素與組織胺促進泌酸。胰泌素、膽囊收縮素（CCK）與體制素抑制泌酸。</p>
        <p class="plain">壁細胞用 H⁺-K⁺ 幫浦把 H⁺ 送進小管，這是消耗 ATP、逆濃度差的初級主動運輸。</p>
        <p class="src">胃酸調節見生理 CH07 p.7-24～7-27。氫鉀幫浦送出 H⁺ 並在小管形成鹽酸，見 CH07 p.7-24 第 4 點；初級主動運輸見 CH01 p.22。</p>
      </details>
    </section>
    <section class="step-content" id="step-4" aria-label="第 4 步收支和說明" hidden>
      <section class="ledger" aria-labelledby="ledger-4">
        <h2 id="ledger-4">收支小卡 · 血液側</h2>
        <dl><div class="ledger-row outgoing"><dt>出去</dt><dd><strong>3 個 Na⁺</strong><span>鈉鉀幫浦耗能，把 Na⁺ 送往血液。</span></dd></div>
<div class="ledger-row"><dt>進來</dt><dd><strong>2 個 K⁺</strong><span>淨移出 1 個正電荷。</span></dd></div></dl>
        <p id="acid-teacher-note" class="teacher-note">白話補充：細胞內偏負電，把 Cl⁻ 往小管推，幫忙做出胃酸。</p>
      </section>
      <details class="explanation">
        <summary>白話說明與課本出處</summary>
        <p class="plain">血液那一側還有 <b>Na⁺–K⁺ 幫浦（鈉鉀幫浦）</b>：每次把 <b>3 個 Na⁺ 送出去、2 個 K⁺ 收進來</b>，要花能量。出去的正電比進來的多，有助於維持細胞裡<b>偏負電</b>。</p>
        <p class="src">課本：壁細胞利用「Na⁺–K⁺ 幫浦」把細胞內多餘的 Na⁺ 送出細胞，同時吸入 K⁺，以維持細胞膜電位的平衡（CH07 p.7-24～7-25 第 5 點）。鈉鉀幫浦每次送出 3 個 Na⁺、送回 2 個 K⁺，使細胞內正電荷減少，有助於維持膜內相對負電性（CH02 p.2-8）。</p>
      </details>
    </section>
    <button id="back-to-quiz" class="back primary" type="button" hidden>回到看圖題</button>
    <div class="actions">
      <button id="show-zoom" type="button" aria-haspopup="dialog">放大細胞圖</button>
      <button id="advance" class="primary" type="button">看第 2 步</button>
    </div>
  </section>
  <section id="recall" class="recall" aria-labelledby="recall-title" hidden>
    <h2 id="recall-title" tabindex="-1">開口說胃酸</h2>
    <article class="flash"><p class="position">回想 1 / 4 · 壁細胞裡</p><h2 tabindex="-1">碳酸拆開後，酸和鹼各是哪一個？</h2>
<figure><div class="cue"><svg class="symbol" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M24 3v13m0 0c0 10-14 6-14 18m14-18c0 10 14 6 14 18"/><circle cx="10" cy="39" r="4"/><circle cx="38" cy="39" r="4"/></svg><b>H₂CO₃</b></div><figcaption>碳酸在壁細胞裡一拆為二。</figcaption></figure>
<button class="flip" type="button" aria-expanded="false" aria-controls="answer-0">看白話解答</button>
<div class="reply" id="answer-0" hidden><h2>做出酸和鹼</h2><p class="plain">壁細胞裡有一種<b>酵素（碳酸酐酶）</b>，把 CO₂ 和水湊在一起變成碳酸，碳酸馬上拆成兩半：一半是<span class="acid">H⁺（酸）</span>，一半是<span class="base">HCO₃⁻（鹼）</span>。</p><details class="citation"><summary>課本出處</summary><p class="src">課本：CO₂ 與 H₂O 在碳酸酐酶催化下形成 H₂CO₃，而後迅速分解成 HCO₃⁻ 和 H⁺。（生理 CH07 p.7-24 第 1 步）</p></details></div>
    </article>
    <article class="flash" hidden><p class="position">回想 2 / 4 · 朝向血液的一側</p><h2 tabindex="-1">哪個離子進血液，讓血液暫時偏鹼？</h2>
<figure><div class="cue"><svg class="symbol" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16h32m-8-8 8 8-8 8m8 8H7m8-8-8 8 8 8"/></svg><b>HCO₃⁻ ／ Cl⁻</b></div><figcaption>血液這一側，兩種離子一出一進。</figcaption></figure>
<button class="flip" type="button" aria-expanded="false" aria-controls="answer-1">看白話解答</button>
<div class="reply" id="answer-1" hidden><h2>鹼出去、氯進來</h2><p class="plain">出去的 HCO₃⁻（碳酸氫根）進入流過胃的血液，血液暫時偏鹼，稱為鹼潮。</p><details class="citation"><summary>課本出處</summary><p class="src">課本：過多的 HCO₃⁻ 被動分泌出細胞外，再以電荷平衡的動力將 Cl⁻ 送入細胞；HCO₃⁻ 進入流經胃部的血管，使血液呈鹼性，稱為鹼潮。Na⁺ 因濃度差進入細胞，同時帶入 Cl⁻。（CH07 p.7-24 第 2、3 步）氯轉移：HCO₃⁻ 擴散入血漿，Cl⁻ 進入紅血球取代 HCO₃⁻（CH06 p.6-28）。</p></details></div>
    </article>
    <article class="flash" hidden><p class="position">回想 3 / 4 · 朝向小管的一側</p><h2 tabindex="-1">H⁺ 在哪裡遇到 Cl⁻，變成胃酸？</h2>
<figure><div class="cue"><svg class="symbol" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8c0 15 17 16 17 26m20-26c0 15-20 16-20 26m-7-4 7 8 7-8"/></svg><b>H⁺ ＋ Cl⁻</b></div><figcaption>想想氫鉀幫浦把 H⁺ 往哪裡送。</figcaption></figure>
<button class="flip" type="button" aria-expanded="false" aria-controls="answer-2">看白話解答</button>
<div class="reply" id="answer-2" hidden><h2>酸送進胃</h2><p class="plain">H⁺–K⁺ 幫浦（氫鉀幫浦）耗能把 H⁺ 送進小管。H⁺ 和 Cl⁻ 在小管會合，形成鹽酸（HCl）。</p><details class="citation"><summary>課本出處</summary><p class="src">課本：H⁺ 經 H⁺–K⁺ 幫浦送入小管，與 Cl⁻ 會合形成鹽酸。（CH07 p.7-24 第 4 點）</p></details></div>
    </article>
    <article class="flash" hidden><p class="position">回想 4 / 4 · 回到血液側</p><h2 tabindex="-1">鈉鉀幫浦每運作一次，細胞淨移出幾個正電荷？</h2>
<figure><div class="cue"><svg class="symbol" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h36m-8-7 8 7-8 7M41 34H8m8-7-8 7 8 7"/></svg><b>Na⁺ ／ K⁺</b></div><figcaption>想想每次送出和收進的正電數量。</figcaption></figure>
<button class="flip" type="button" aria-expanded="false" aria-controls="answer-3">看白話解答</button>
<div class="reply" id="answer-3" hidden><h2>幫浦維持電位</h2><p class="plain">鈉鉀幫浦花能量送出 3 個 Na⁺，送進 2 個 K⁺。每次淨移出 1 個正電荷，有助於維持膜內相對負電性。</p><details class="citation"><summary>課本出處</summary><p class="src">課本：壁細胞利用「Na⁺–K⁺ 幫浦」把細胞內多餘的 Na⁺ 送出細胞，同時吸入 K⁺，以維持細胞膜電位的平衡（CH07 p.7-24～7-25 第 5 點）。鈉鉀幫浦每次送出 3 個 Na⁺、送回 2 個 K⁺，使細胞內正電荷減少，有助於維持膜內相對負電性（CH02 p.2-8）。</p></details></div></article>
    <nav class="pages" aria-label="切換回想題">
      <button id="prev" type="button" disabled>上一題</button>
      <button id="next" type="button">下一題</button>
    </nav>
    <p id="recall-gate" class="recall-gate" role="status"></p>
    <button id="start-quiz" class="back primary" type="button" disabled>開始看圖題</button>
    <button id="back-to-lesson" class="back" type="button">回到四步圖解</button>
  </section>
  <section id="acid-quiz" aria-label="看圖練習" hidden>
    <figure class="diagram quiz-diagram"></figure>
    <button id="quiz-zoom" type="button" aria-haspopup="dialog">放大細胞圖</button>
    <div class="quiz-body"></div>
    <button id="review-steps" class="back" type="button">重看四步圖解</button>
  </section>
  <section id="acid-done" class="completion" hidden>
    <h2 tabindex="-1">完成這一關</h2>
    <p>胃酸是胃腺壁細胞分泌的鹽酸，可殺菌並活化胃蛋白酶原。</p>
    <button id="replay" type="button">重看四步圖解</button>
  </section>
<dialog id="zoom" aria-labelledby="zoom-title">
  <div class="zoom-head">
    <h2 id="zoom-title">放大細胞圖</h2>
    <button id="close-zoom" type="button" autofocus>關閉</button>
  </div>
  <p class="zoom-help" id="zoom-help">可左右滑動查看整張圖。</p>
  <div class="zoom-frame" tabindex="0" role="region" aria-label="壁細胞放大圖" aria-describedby="zoom-help"></div>
</dialog>
`;
