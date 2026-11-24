window.MECHANISM_LESSON_DATA = {
  "id": "d4-l4-gastric-acid",
  "schemaVersion": 2,
  "stages": [
    {
      "id": "L4",
      "questions": [
        {
          "id": "1",
          "fullId": "stomach-level-4-1",
          "level": 3,
          "mode": "order",
          "prompt": "依壁細胞圖排列製造鹽酸的路徑。",
          "items": [
            {
              "id": "o1",
              "text": "碳酸酐酶催化產生 H⁺ 與 HCO₃⁻"
            },
            {
              "id": "o2",
              "text": "H⁺–K⁺ 幫浦（氫鉀幫浦）"
            },
            {
              "id": "o3",
              "text": "H⁺ 與 Cl⁻ 形成鹽酸"
            }
          ],
          "expectedOrder": [
            "o1",
            "o2",
            "o3"
          ],
          "feedbackCorrect": "壁細胞先形成 H⁺，H⁺–K⁺ 幫浦（氫鉀幫浦）把 H⁺ 送入小管，H⁺ 與 Cl⁻ 在小管形成鹽酸。",
          "feedbackWrong": "從壁細胞內開始，依序想到小管側。",
          "src": "gastric-acid-secretion#功能 / 機轉"
        },
        {
          "id": "3",
          "fullId": "stomach-level-4-3",
          "level": 2,
          "mode": "multi",
          "prompt": "複選：哪些物質會促進圖中的壁細胞泌酸？",
          "options": [
            {
              "id": "q3-a",
              "text": "ACh（乙醯膽鹼）",
              "correct": true
            },
            {
              "id": "q3-b",
              "text": "胃泌素",
              "correct": true
            },
            {
              "id": "q3-c",
              "text": "組織胺",
              "correct": true
            },
            {
              "id": "q3-d",
              "text": "體制素",
              "correct": false
            },
            {
              "id": "q3-e",
              "text": "胰泌素",
              "correct": false
            }
          ],
          "feedbackCorrect": "乙醯膽鹼、胃泌素及組織胺都會促進壁細胞泌酸。",
          "feedbackWrong": "再想想哪些物質會抑制泌酸。",
          "src": "gastric-acid-secretion#國考重點"
        },
        {
          "id": "4",
          "fullId": "stomach-level-4-4",
          "level": 3,
          "mode": "single",
          "prompt": "哪一個幫浦耗能把 H⁺ 從壁細胞送進小管？",
          "options": [
            {
              "id": "q4-a",
              "text": "小管側氫鉀幫浦",
              "correct": true
            },
            {
              "id": "q4-b",
              "text": "血液側鈉鉀幫浦",
              "correct": false
            },
            {
              "id": "q4-c",
              "text": "血液側氫鉀幫浦",
              "correct": false
            },
            {
              "id": "q4-d",
              "text": "小管側鈉鉀幫浦",
              "correct": false
            }
          ],
          "feedbackCorrect": "小管側的 H⁺–K⁺ 幫浦耗能送出 H⁺。血液側的 Na⁺–K⁺ 幫浦維持膜電位。",
          "feedbackWrong": "回想兩種幫浦各位在哪一側，再選一次。",
          "src": "gastric-acid-secretion#功能 / 機轉、gastric-acid-secretion#臨床應用"
        }
      ]
    }
  ]
};
