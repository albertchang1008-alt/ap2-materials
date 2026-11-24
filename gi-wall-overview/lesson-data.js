window.MaterialShellContent = {
  "title": "消化系統總覽與消化管壁",
  "slug": "gi-wall-overview",
  "activityId": "dig-gi-wall-overview-v1",
  "materialVersion": "gi-wall-overview-ag2",
  "ui": {
    "opening": "準備開始",
    "start": "開始",
    "ending": "重點整理",
    "endingDone": "完成旅程",
    "truefalse": "是非確認",
    "transition": "準備進入考核",
    "foundation": "第一階段：先備確認",
    "case": "第二階段：情境考核",
    "complete": "本單元通關！",
    "beginAssessment": "開始第一階段",
    "continue": "繼續",
    "correct": "答對了！",
    "map": "總圖",
    "mapTitle": "總圖 · 重點整理",
    "overview": "總覽",
    "teach": "教學",
    "passed": "過關",
    "reset": "重置",
    "zoom": "放大檢視圖片",
    "timeRemaining": "剩下 {n} 秒",
    "assessmentTimeout": "時間到，這題還不熟，請重新開始考核。",
    "restartAssessment": "重新開始考核",
    "retryFoundation": "基礎題重新開始",
    "imageLoading": "圖片載入中",
    "imageRetry": "圖片載入失敗，點此重試",
    "close": "關閉",
    "teachGuide": "先看圖例，認識圖上的編號，再按圖下方每個按鈕切換看圖。全部看過後，按〔看完了，開始作答〕。",
    "textGuide": "先讀完本關說明，再按〔看完了，開始作答〕。",
    "reviewGuide": "切換按鈕看圖，對照相同編號讀圖例；看完按〔返回作答〕。",
    "stateSeen": "已看",
    "stateUnseen": "未看",
    "stateProgress": "已看 {seen}／{total} 個狀態；請按標示「未看」的按鈕。",
    "statesDone": "所有狀態都看過了。讀完圖例後，可往下開始作答。",
    "returnTeach": "回去看說明",
    "returnQuiz": "返回作答",
    "returnProgress": "返回原進度",
    "startQuiz": "看完了，開始作答",
    "submit": "確認送出",
    "retry": "再試一次",
    "retryCase": "重新挑戰第二階段",
    "retryEnding": "從第 1 格重來",
    "hint": "看提示",
    "hintLabel": "提示：",
    "next": "下一題",
    "nextLevel": "下一關",
    "showMap": "查看重點整理總圖",
    "summaryLabel": "這關重點：",
    "unselected": "(未選)",
    "resetOrder": "重選順序",
    "expand": "▼ 展開",
    "collapse": "▲ 收起",
    "locked": "過關後打開",
    "more": "看更多",
    "less": "收起",
    "yes": "對",
    "no": "錯",
    "levelHeader": "第 {n}／{total} 關 · {title}",
    "questionHeader": "第 {n}／{total} 題",
    "levelTab": "第 {n} 關",
    "unseen": "還有 {n} 個沒看",
    "passTitle": "第 {n} 關完成",
    "orderBadge": "第 {n} 步",
    "revisit": "回第 {n} 關看",
    "mapNode": "第 {n} 關：{title}",
    "tick": "✓",
    "lock": "🔒",
    "arrow": "↓",
    "legendFrameTitle": "完整圖與圖例",
    "legendRead": "先看圖例",
    "legendReadDone": "放大圖例 · 已看",
    "legendHeading": "圖例",
    "legendDialogTitle": "放大圖例",
    "legendBack": "返回",
    "legendConfirm": "圖例看完了",
    "legendFirstHint": "請先看圖例，認識圖中每種符號。",
    "legendDialogHint": "請查看全部圖例，再按「圖例看完了」。",
    "legendNotReady": "圖例圖片尚未準備完成，請返回後重試。",
    "legendLoadFailed": "圖例圖片載入失敗，請返回後重試。",
    "legendUnavailable": "尚未取樣",
    "legendProgress": "已看 {seen}／{total} 個必看步驟",
    "legendRemaining": "還有 {n} 個必看步驟",
    "focusWhole": "看完整圖",
    "focusZoom": "放大這一區"
  },
  "opening": {
    "prompt": "從食道到肛門，消化管壁有一套共同的基本構造，外面還有腹膜包覆、神經在管壁裡調控。6 關之後，你會用同一張「管壁地圖」看懂整條消化道。"
  },
  "levels": [
    {
      "id": "L1",
      "title": "消化系統與各種消化液",
      "summary": "唾液每日約1000–1500 mL、胃液約2000 mL、膽汁約500–800 mL、胰液約1500 mL；膽汁乳化脂肪但不直接消化脂肪。",
      "items": "唾液每日約1000–1500 mL、胃液約2000 mL、膽汁約500–800 mL、胰液約1500 mL；膽汁乳化脂肪但不直接消化脂肪。",
      "states": [
        {
          "id": "p1",
          "btnText": "唾液",
          "img": "figures/openstax-23-2.jpg",
          "ratio": "1500 / 1864",
          "caption": "唾液含水、鹽類、黏液與唾液澱粉酶，每日約1000–1500 mL。",
          "highlightNums": [],
          "legends": [
            {
              "num": "1",
              "name": "腮腺"
            },
            {
              "num": "5",
              "name": "食道"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L1-p1",
          "src": [
            "digestive-secretions#功能 / 機轉",
            "digestive-secretions#國考重點"
          ],
          "markers": [
            {
              "num": "1",
              "x": 52.6,
              "y": 18.8
            },
            {
              "num": "5",
              "x": 51.3,
              "y": 42.3
            }
          ]
        },
        {
          "id": "p2",
          "btnText": "胃液",
          "img": "figures/openstax-23-2.jpg",
          "ratio": "1500 / 1864",
          "caption": "胃液含胃酸、酶與黏液，每日約2000 mL。",
          "highlightNums": [],
          "legends": [
            {
              "num": "2",
              "name": "胃"
            },
            {
              "num": "7",
              "name": "橫結腸"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L1-p2",
          "src": [
            "digestive-secretions#功能 / 機轉",
            "digestive-secretions#國考重點"
          ],
          "markers": [
            {
              "num": "2",
              "x": 62.4,
              "y": 58.7
            },
            {
              "num": "7",
              "x": 54.9,
              "y": 69.0
            }
          ]
        },
        {
          "id": "p3",
          "btnText": "膽汁",
          "img": "figures/openstax-23-2.jpg",
          "ratio": "1500 / 1864",
          "caption": "膽汁每日約500–800 mL；膽鹽協助脂肪乳化，但不直接消化脂肪。",
          "highlightNums": [],
          "legends": [
            {
              "num": "3",
              "name": "肝臟"
            },
            {
              "num": "6",
              "name": "十二指腸"
            },
            {
              "num": "8",
              "name": "脾臟"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L1-p3",
          "src": [
            "digestive-secretions#功能 / 機轉",
            "digestive-secretions#國考重點"
          ],
          "markers": [
            {
              "num": "3",
              "x": 37.2,
              "y": 53.0
            },
            {
              "num": "6",
              "x": 44.7,
              "y": 65.1
            },
            {
              "num": "8",
              "x": 65.5,
              "y": 61.7
            }
          ]
        },
        {
          "id": "p4",
          "btnText": "胰液",
          "img": "figures/openstax-23-2.jpg",
          "ratio": "1500 / 1864",
          "caption": "胰液每日約1500 mL，含消化酶與富含碳酸氫根的液體，可中和酸性食糜。",
          "highlightNums": [],
          "legends": [
            {
              "num": "4",
              "name": "胰臟"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L1-p4",
          "src": [
            "digestive-secretions#功能 / 機轉",
            "digestive-secretions#國考重點"
          ],
          "markers": [
            {
              "num": "4",
              "x": 50.7,
              "y": 64.9
            }
          ]
        }
      ],
      "questions": [
        {
          "template": "choice",
          "mode": "single",
          "prompt": "膽汁在脂肪消化中的角色是什麼？",
          "options": [
            {
              "id": "o0",
              "text": "乳化脂肪"
            },
            {
              "id": "o1",
              "text": "直接水解脂肪"
            },
            {
              "id": "o2",
              "text": "中和胃酸"
            },
            {
              "id": "o3",
              "text": "分解澱粉"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "膽鹽協助脂肪乳化，不直接消化脂肪；乳化與酶的分解是不同作用。",
          "hint": "膽汁不是酶。",
          "feedbackCorrect": "膽汁負責乳化脂肪。",
          "src": [
            "digestive-secretions#功能 / 機轉",
            "digestive-secretions#容易混淆"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-1-3"
        }
      ],
      "teachGuide": "按下各種消化液，看看相關的器官。"
    },
    {
      "id": "L2",
      "title": "消化管壁的四層",
      "summary": "管壁由內而外為黏膜、黏膜下層、肌肉層、漿膜或外膜；黏膜肌層屬於黏膜；肌肉層內環外縱。",
      "kind": "figure",
      "figure": {
        "stage": "L2",
        "lesson": "stages/L2/index.html"
      }
    },
    {
      "id": "L3",
      "title": "管壁裡的兩個神經叢",
      "summary": "腸肌層神經叢在環肌與縱肌之間，主要調控平滑肌收縮；黏膜下層神經叢在黏膜下層，主要調控分泌。",
      "kind": "figure",
      "figure": {
        "stage": "L3",
        "lesson": "stages/L3/index.html"
      }
    },
    {
      "id": "L4",
      "title": "消化道的上皮",
      "summary": "口腔與食道是複層鱗狀上皮，負責保護；胃到大腸是單層柱狀上皮，負責分泌與吸收。",
      "items": "口腔與食道是複層鱗狀上皮，負責保護；胃到大腸是單層柱狀上皮，負責分泌與吸收。",
      "states": [
        {
          "id": "p1",
          "btnText": "口腔與食道",
          "img": "figures/openstax-4-8-stratified-squamous.webp",
          "ratio": "515 / 258",
          "caption": "口腔與食道內襯複層鱗狀上皮，以保護為主；食道是非角質化的。",
          "highlightNums": [],
          "legends": [
            {
              "name": "複層鱗狀上皮"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L4-p1",
          "src": [
            "gi-epithelium#功能 / 機轉"
          ]
        },
        {
          "id": "p2",
          "btnText": "胃到大腸",
          "img": "figures/openstax-4-8-simple-columnar.webp",
          "ratio": "515 / 388",
          "caption": "從胃到大腸是單層柱狀上皮，負責分泌與吸收；大腸也仍然是柱狀上皮。",
          "highlightNums": [],
          "legends": [
            {
              "name": "單層柱狀上皮"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L4-p2",
          "src": [
            "gi-epithelium#功能 / 機轉"
          ]
        },
        {
          "id": "p3",
          "btnText": "胃小凹",
          "img": "figures/openstax-23-16-gastric-pit.webp",
          "ratio": "564 / 278",
          "caption": "胃上皮形成胃小凹與胃腺。",
          "highlightNums": [],
          "legends": [
            {
              "name": "胃小凹（Gastric pit）"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L4-p3",
          "src": [
            "gi-epithelium#國考重點"
          ]
        },
        {
          "id": "p4",
          "btnText": "杯狀細胞",
          "img": "figures/openstax-23-19a-goblet-cell.webp",
          "ratio": "1000 / 465",
          "caption": "小腸與大腸的杯狀細胞分泌黏液。胃的黏液細胞不能等同於杯狀細胞。",
          "highlightNums": [],
          "legends": [
            {
              "name": "杯狀細胞（Goblet cell）"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L4-p4",
          "src": [
            "gi-epithelium#國考重點",
            "gi-epithelium#臨床應用",
            "gi-epithelium#容易混淆"
          ]
        }
      ],
      "questions": [
        {
          "template": "choice",
          "mode": "single",
          "prompt": "下列哪一個器官內襯複層鱗狀上皮？",
          "options": [
            {
              "id": "o0",
              "text": "食道"
            },
            {
              "id": "o1",
              "text": "胃"
            },
            {
              "id": "o2",
              "text": "小腸"
            },
            {
              "id": "o3",
              "text": "大腸"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "口腔與食道是複層鱗狀上皮；胃到大腸是單層柱狀上皮。",
          "hint": "越接近嘴巴、越需要保護。",
          "feedbackCorrect": "食道內襯複層鱗狀上皮。",
          "src": [
            "gi-epithelium#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-4-1"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "消化管壁四層中，哪一層與吸收養分有關？",
          "options": [
            {
              "id": "o0",
              "text": "黏膜層"
            },
            {
              "id": "o1",
              "text": "肌肉層"
            },
            {
              "id": "o2",
              "text": "黏膜下層"
            },
            {
              "id": "o3",
              "text": "漿膜"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "胃到大腸的單層柱狀上皮負責分泌與吸收，上皮屬於黏膜。",
          "hint": "直接接觸管腔內容物的那一層。",
          "feedbackCorrect": "黏膜層與吸收有關。",
          "src": [
            "gi-epithelium#功能 / 機轉",
            "gi-wall-layers#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-4-2"
        }
      ],
      "teachGuide": "依序看兩種上皮，再比較胃小凹與杯狀細胞。"
    },
    {
      "id": "L5",
      "title": "腹膜、網膜與腹膜後器官",
      "summary": "腹膜是最大的漿膜，分壁層與臟層；腎與胰是腹膜後器官；大網膜連胃大彎與橫結腸，小網膜連肝門與胃小彎、十二指腸。",
      "items": "腹膜是最大的漿膜，分壁層與臟層；腎與胰是腹膜後器官；大網膜連胃大彎與橫結腸，小網膜連肝門與胃小彎、十二指腸。",
      "states": [
        {
          "id": "p1",
          "btnText": "漿膜",
          "img": "figures/openstax-23-4.jpg",
          "ratio": "826 / 589",
          "caption": "漿膜由薄層疏鬆結締組織與間皮構成；壁層貼著體腔壁，臟層覆蓋器官表面，兩層之間的漿液可減少摩擦。",
          "highlightNums": [],
          "legends": [
            {
              "num": "1",
              "name": "壁層腹膜"
            },
            {
              "num": "2",
              "name": "臟層腹膜"
            },
            {
              "num": "3",
              "name": "腹膜腔"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L5-p1",
          "src": [
            "serous-membranes#定義",
            "serous-membranes#功能 / 機轉"
          ],
          "markers": [
            {
              "num": "1",
              "x": 69.4,
              "y": 94.4
            },
            {
              "num": "2",
              "x": 26.9,
              "y": 94.4
            },
            {
              "num": "3",
              "x": 49.4,
              "y": 93.4
            }
          ]
        },
        {
          "id": "p2",
          "btnText": "腹膜",
          "img": "figures/openstax-23-4.jpg",
          "ratio": "826 / 589",
          "caption": "腹膜是體內最大的漿膜；胸膜包覆肺、心包膜覆蓋心臟，也都是漿膜。臟層與壁層腹膜之間的腹膜腔含少量漿膜液，可減少器官間的摩擦。",
          "highlightNums": [],
          "legends": [
            {
              "num": "1",
              "name": "壁層腹膜"
            },
            {
              "num": "2",
              "name": "臟層腹膜"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L5-p2",
          "src": [
            "peritoneum#定義",
            "serous-membranes#國考重點"
          ],
          "markers": [
            {
              "num": "1",
              "x": 69.4,
              "y": 94.4
            },
            {
              "num": "2",
              "x": 26.9,
              "y": 94.4
            }
          ]
        },
        {
          "id": "p3",
          "btnText": "腹膜後器官",
          "img": "figures/openstax-23-4.jpg",
          "ratio": "826 / 589",
          "caption": "腎與胰是腹膜後器官，位在壁層腹膜與後腹壁之間；腹膜後不等於完全沒有腹膜關係。",
          "highlightNums": [],
          "legends": [
            {
              "num": "4",
              "name": "腎"
            },
            {
              "num": "5",
              "name": "胰"
            }
          ],
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "focusSource": "none",
          "focus": null,
          "nodeId": "gi-wall-overview-node-L5-p3",
          "src": [
            "peritoneum#臨床應用",
            "peritoneum#容易混淆"
          ],
          "markers": [
            {
              "num": "4",
              "x": 55.4,
              "y": 41.4
            },
            {
              "num": "5",
              "x": 38.4,
              "y": 46.9
            }
          ]
        },
        {
          "id": "p4",
          "btnText": "大網膜",
          "caption": "大網膜由胃大彎向下反摺到橫結腸，脂肪與淋巴結豐富，像一件「脂肪圍裙」。",
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "nodeId": "gi-wall-overview-node-L5-p4",
          "src": [
            "omentum#功能 / 機轉"
          ]
        },
        {
          "id": "p5",
          "btnText": "小網膜",
          "caption": "小網膜連接肝門與胃小彎、十二指腸，裡面有肝動脈、門靜脈與總膽管。",
          "legendMode": "none",
          "legendReason": "圖上只標編號，名稱與功能見圖下圖例。",
          "nodeId": "gi-wall-overview-node-L5-p5",
          "src": [
            "omentum#功能 / 機轉"
          ]
        }
      ],
      "questions": [
        {
          "template": "choice",
          "mode": "single",
          "prompt": "下列何者是腹膜後器官？",
          "options": [
            {
              "id": "o0",
              "text": "腎臟"
            },
            {
              "id": "o1",
              "text": "胃"
            },
            {
              "id": "o2",
              "text": "空腸"
            },
            {
              "id": "o3",
              "text": "橫結腸"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "腎與胰為腹膜後器官，位於壁層腹膜與後腹壁之間。",
          "hint": "課本舉了兩個例子：腎與胰。",
          "feedbackCorrect": "腎臟是腹膜後器官。",
          "src": [
            "peritoneum#臨床應用"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-5-1"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "連接胃大彎與橫結腸、有「脂肪圍裙」之稱的是？",
          "options": [
            {
              "id": "o0",
              "text": "大網膜"
            },
            {
              "id": "o1",
              "text": "小網膜"
            },
            {
              "id": "o2",
              "text": "腸繫膜"
            },
            {
              "id": "o3",
              "text": "壁層腹膜"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "大網膜由胃大彎向下反摺至橫結腸，富含脂肪與淋巴結。",
          "hint": "大彎對大網膜。",
          "feedbackCorrect": "大網膜。",
          "src": [
            "omentum#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-5-2"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "關於漿膜，下列何者錯誤？",
          "options": [
            {
              "id": "o0",
              "text": "胸膜包覆所有胸腔臟器，腹膜包覆所有腹腔臟器"
            },
            {
              "id": "o1",
              "text": "胸膜與腹膜都屬於漿膜"
            },
            {
              "id": "o2",
              "text": "漿膜分壁層與臟層"
            },
            {
              "id": "o3",
              "text": "漿膜含有間皮"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "腹膜後器官（如腎、胰）位於壁層腹膜之後，並非被腹膜完整包覆。",
          "hint": "想想腹膜後器官。",
          "feedbackCorrect": "「包覆所有臟器」的說法是錯的。",
          "src": [
            "serous-membranes#國考重點",
            "peritoneum#臨床應用"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-5-3"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "哪一個構造連接肝門與胃小彎？",
          "options": [
            {
              "id": "o0",
              "text": "大網膜"
            },
            {
              "id": "o1",
              "text": "小網膜"
            },
            {
              "id": "o2",
              "text": "腸繫膜"
            },
            {
              "id": "o3",
              "text": "腹膜後器官"
            }
          ],
          "answer": "o1",
          "feedbackWrong": "小網膜連接肝門與胃小彎、十二指腸。",
          "hint": "它也連到十二指腸。",
          "feedbackCorrect": "小網膜連接肝門與胃小彎、十二指腸。",
          "src": [
            "omentum#功能 / 機轉"
          ],
          "bankEligible": false,
          "id": "gi-wall-overview-level-5-4",
          "quizNoFigure": true
        }
      ],
      "teachGuide": "先看腹膜與腹膜後器官，再讀大網膜和小網膜的說明。"
    },
    {
      "id": "L6",
      "title": "消化道的反射與自主神經",
      "summary": "反射可經中樞或在腸壁局部完成；交感神經一般抑制、副交感神經一般促進消化道的蠕動與分泌。",
      "items": "反射可經中樞或在腸壁局部完成；交感神經一般抑制、副交感神經一般促進消化道的蠕動與分泌。",
      "states": [],
      "questions": [
        {
          "template": "choice",
          "mode": "single",
          "prompt": "不需要先經過中樞神經系統就能完成的反射是？",
          "options": [
            {
              "id": "o0",
              "text": "局部反射"
            },
            {
              "id": "o1",
              "text": "中樞反射"
            },
            {
              "id": "o2",
              "text": "兩者都需要經過中樞"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "局部反射在腸壁內完成；中樞反射需傳入中樞。",
          "hint": "腸內神經叢可以自己處理。",
          "feedbackCorrect": "局部反射不需先經中樞。",
          "src": [
            "gi-reflexes#容易混淆"
          ],
          "bankEligible": false,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-6-1"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "一般而言，交感神經對消化道的作用是？",
          "options": [
            {
              "id": "o0",
              "text": "抑制蠕動及分泌"
            },
            {
              "id": "o1",
              "text": "促進蠕動及分泌"
            },
            {
              "id": "o2",
              "text": "只促進分泌"
            },
            {
              "id": "o3",
              "text": "只促進蠕動"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "交感一般抑制蠕動及分泌；副交感一般促進。",
          "hint": "促進蠕動和分泌的是另一個。",
          "feedbackCorrect": "交感神經一般抑制蠕動及分泌。",
          "src": [
            "gi-autonomic-control#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-6-2"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "關於腸內神經系統，下列何者正確？",
          "options": [
            {
              "id": "o0",
              "text": "腸內纖維也能傳遞感覺"
            },
            {
              "id": "o1",
              "text": "一定要受意識控制才有功能"
            },
            {
              "id": "o2",
              "text": "屬於體運動神經系統"
            },
            {
              "id": "o3",
              "text": "切斷外來神經後就完全不能蠕動"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "腸內纖維亦可傳遞感覺；切斷外來神經後仍可蠕動。",
          "hint": "它可以獨立運作。",
          "feedbackCorrect": "腸內纖維也能傳遞感覺。",
          "src": [
            "enteric-nervous-system#國考重點",
            "enteric-nervous-system#臨床應用"
          ],
          "bankEligible": true,
          "quizImgState": null,
          "quizNoFigure": true,
          "id": "gi-wall-overview-level-6-3"
        }
      ],
      "noFigure": true,
      "body": [
        "消化道的化學與機械接受器，感受酸鹼度、壓力等刺激。",
        "消化道管壁上有化學接受器和機械接受器，感受食物刺激後，把訊息傳給腸肌層神經叢或經自主神經傳出。",
        "局部反射把訊息傳入腸內神經叢後直接作用，不需要先經過中樞。",
        "中樞反射把訊息傳入中樞神經系統，再由自主神經傳出。",
        "交感神經一般抑制蠕動及分泌；副交感神經（迷走神經與薦段骨盆神經）一般促進蠕動及分泌。"
      ]
    }
  ],
  "encouragement": {
    "correct": [
      "答對！這題你判斷得很穩 👍",
      "漂亮，觀念抓得很準 🎯",
      "沒錯，你已經把重點串起來了 🔗",
      "正確！這種判斷，以後在臨床很用得上 🩺",
      "對了！你的推理一步一步都站得住 🧠",
      "好眼力，陷阱選項沒騙到你 👀",
      "答對了，這題其實不簡單喔 ✨",
      "很好，保持這個節奏 🎵",
      "正確！看得出你有認真讀過 📖",
      "完全正確，給自己按個讚 👏",
      "沒錯！記住現在這個感覺 💡",
      "精準！下一題也交給你了 🚀",
      "答對！你的大腦今天狀態很好 ⚡",
      "正確，這個觀念你已經是自己的了 🌱"
    ],
    "levelPass": [
      "又破一關！你正在一塊一塊拼出完整的地圖 🧩",
      "這一關的重點，已經收進你的口袋了 🎒",
      "學習就是這樣，一關一關慢慢變強 💪",
      "累了就休息一下，你的進度都幫你記著 ☕",
      "今天的專注，就是之後考試時的底氣 🔥",
      "每多懂一點，將來照顧病人就多一分把握 💙",
      "很穩！下一關會用到剛剛學的東西喔 🔜",
      "把剛學的名詞小聲唸一次，會記得更牢 🗣️",
      "你比剛開始的自己，又多懂了一些 📈",
      "難的地方你都撐過來了，給自己一點掌聲 👏",
      "這一關過得漂亮，繼續往前走吧 🌟",
      "記不住也沒關係，總圖隨時可以回來複習 🗺️"
    ],
    "finish": "一層一層看懂管壁、一路跟著神經和腹膜走，你已經有一張整條消化道的地圖了。 🗺️ 🎉"
  },
  "ending": {
    "prompt": "結尾",
    "steps": [
      {
        "template": "choice",
        "mode": "single",
        "prompt": "黏膜肌層屬於哪一層？",
        "options": [
          {
            "id": "o0",
            "text": "黏膜"
          },
          {
            "id": "o1",
            "text": "肌肉層"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "黏膜肌層屬於黏膜。",
        "feedbackCorrect": "屬於黏膜。",
        "src": [
          "gi-wall-layers#容易混淆"
        ],
        "bankEligible": false,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "gi-wall-overview-ending-1",
        "revisitLevel": "L2"
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "梅氏神經叢在哪一層？",
        "options": [
          {
            "id": "o0",
            "text": "黏膜下層"
          },
          {
            "id": "o1",
            "text": "肌肉層"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "梅氏神經叢在黏膜下層；奧氏神經叢在肌肉層。",
        "feedbackCorrect": "黏膜下層。",
        "src": [
          "gi-muscularis#容易混淆"
        ],
        "bankEligible": false,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "gi-wall-overview-ending-2",
        "revisitLevel": "L3"
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "大網膜連接胃大彎和？",
        "options": [
          {
            "id": "o0",
            "text": "橫結腸"
          },
          {
            "id": "o1",
            "text": "肝門"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "大網膜由胃大彎反摺至橫結腸；小網膜連肝門。",
        "feedbackCorrect": "橫結腸。",
        "src": [
          "omentum#功能 / 機轉"
        ],
        "bankEligible": false,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "gi-wall-overview-ending-3",
        "revisitLevel": "L5"
      }
    ],
    "completeMessage": "整條消化道共用同一張管壁地圖：黏膜、黏膜下層、肌肉層、漿膜或外膜，神經叢藏在其中，腹膜把器官包好、掛好。"
  },
  "truefalse": [
    {
      "id": "gi-wall-overview-tf-1",
      "statement": "膽汁中的膽鹽是分解脂肪的消化酶。",
      "answer": false,
      "feedback": "膽鹽協助乳化，不直接消化脂肪。",
      "template": "choice",
      "mode": "single",
      "prompt": "膽汁中的膽鹽是分解脂肪的消化酶。",
      "feedbackWrong": "膽鹽協助乳化，不直接消化脂肪。",
      "feedbackCorrect": "膽鹽協助乳化，不直接消化脂肪。",
      "options": [
        {
          "id": true,
          "text": "對"
        },
        {
          "id": false,
          "text": "錯"
        }
      ],
      "src": [
        "digestive-secretions#容易混淆"
      ],
      "bankEligible": false
    },
    {
      "id": "gi-wall-overview-tf-2",
      "statement": "大腸雖然吸收水分，內襯仍是單層柱狀上皮。",
      "answer": true,
      "feedback": "胃至大腸都是單層柱狀上皮。",
      "template": "choice",
      "mode": "single",
      "prompt": "大腸雖然吸收水分，內襯仍是單層柱狀上皮。",
      "feedbackWrong": "胃至大腸都是單層柱狀上皮。",
      "feedbackCorrect": "胃至大腸都是單層柱狀上皮。",
      "options": [
        {
          "id": true,
          "text": "對"
        },
        {
          "id": false,
          "text": "錯"
        }
      ],
      "src": [
        "gi-epithelium#功能 / 機轉"
      ],
      "bankEligible": false
    },
    {
      "id": "gi-wall-overview-tf-3",
      "statement": "腹膜是體內最大的漿膜。",
      "answer": true,
      "feedback": "腹膜是體內最大的漿膜，分壁層與臟層。",
      "template": "choice",
      "mode": "single",
      "prompt": "腹膜是體內最大的漿膜。",
      "feedbackWrong": "腹膜是體內最大的漿膜，分壁層與臟層。",
      "feedbackCorrect": "腹膜是體內最大的漿膜，分壁層與臟層。",
      "options": [
        {
          "id": true,
          "text": "對"
        },
        {
          "id": false,
          "text": "錯"
        }
      ],
      "src": [
        "peritoneum#定義"
      ],
      "bankEligible": false
    },
    {
      "id": "gi-wall-overview-tf-l2-5",
      "statement": "食道最外層和小腸一樣是漿膜。",
      "prompt": "食道最外層和小腸一樣是漿膜。",
      "answer": false,
      "feedback": "食道最外層是纖維性外膜，沒有漿膜覆蓋；不能把它和腹腔消化道的漿膜當成一樣。",
      "feedbackCorrect": "食道最外層是纖維性外膜，沒有漿膜覆蓋；不能把它和腹腔消化道的漿膜當成一樣。",
      "feedbackWrong": "食道最外層是纖維性外膜，沒有漿膜覆蓋；不能把它和腹腔消化道的漿膜當成一樣。",
      "src": [
        "esophagus#容易混淆"
      ],
      "bankEligible": false
    }
  ],
  "assessment": {
    "intro": "太棒了！你已經完成 6 關，認識了消化液、管壁四層、腸內神經、上皮、腹膜和消化道反射。接下來是正式考題，會用課本上的用語，剛剛學過的概念都用得上。加油！",
    "foundation": [
      {
        "template": "choice",
        "mode": "single",
        "prompt": "消化道的梅氏神經叢位於下列何處？",
        "options": [
          {
            "id": "o0",
            "text": "黏膜下層"
          },
          {
            "id": "o1",
            "text": "肌肉層"
          },
          {
            "id": "o2",
            "text": "漿膜"
          },
          {
            "id": "o3",
            "text": "黏膜上皮"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "梅氏神經叢位於黏膜下層。",
        "feedbackCorrect": "答對了！黏膜下神經叢（梅氏神經叢）位於黏膜下層。",
        "src": [
          "gi-muscularis#容易混淆",
          "enteric-nervous-system#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-foundation-q01",
        "revisitLevel": "L3",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "連接肝門與胃小彎、十二指腸的是？",
        "options": [
          {
            "id": "o0",
            "text": "小網膜"
          },
          {
            "id": "o1",
            "text": "大網膜"
          },
          {
            "id": "o2",
            "text": "腸繫膜"
          },
          {
            "id": "o3",
            "text": "鐮狀韌帶"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "小網膜連接肝門與胃小彎、十二指腸。",
        "feedbackCorrect": "答對了！小網膜連接肝門與胃小彎、十二指腸。",
        "src": [
          "omentum#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-foundation-q02",
        "revisitLevel": "L5",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "關於消化道肌肉層，下列何者正確？",
        "options": [
          {
            "id": "o0",
            "text": "口、咽與食道上段含骨骼肌"
          },
          {
            "id": "o1",
            "text": "所有消化道都是平滑肌"
          },
          {
            "id": "o2",
            "text": "肌肉層一律內縱外環"
          },
          {
            "id": "o3",
            "text": "黏膜肌層就是肌肉層"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "口、咽與食道上段含骨骼肌；一般平滑肌層為內環外縱；黏膜肌層屬黏膜。",
        "feedbackCorrect": "答對了！口腔、咽與食道上段都含骨骼肌。",
        "src": [
          "gi-muscularis#國考重點",
          "gi-muscularis#容易混淆"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-foundation-q03",
        "revisitLevel": "L2",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "一般而言，副交感神經對消化道的作用是？",
        "options": [
          {
            "id": "o0",
            "text": "促進蠕動及分泌"
          },
          {
            "id": "o1",
            "text": "抑制蠕動及分泌"
          },
          {
            "id": "o2",
            "text": "只抑制分泌"
          },
          {
            "id": "o3",
            "text": "沒有作用"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "副交感神經一般促進蠕動及分泌。",
        "feedbackCorrect": "答對了！副交感神經通常促進消化道蠕動與分泌。",
        "src": [
          "gi-autonomic-control#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-foundation-q05",
        "revisitLevel": "L6",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "使消化道黏膜形成小皺襞的是哪一個構造？",
        "options": [
          {
            "id": "o0",
            "text": "黏膜肌層"
          },
          {
            "id": "o1",
            "text": "黏膜下層"
          },
          {
            "id": "o2",
            "text": "肌肉層"
          },
          {
            "id": "o3",
            "text": "漿膜"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "黏膜肌使黏膜形成小皺襞；它屬於黏膜。",
        "hint": "它的名字裡同時有「黏膜」和「肌」。",
        "feedbackCorrect": "黏膜肌層使黏膜形成小皺襞。",
        "src": [
          "gi-wall-layers#國考重點"
        ],
        "bankEligible": true,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "gi-wall-overview-foundation-l2-2",
        "revisitLevel": "L2",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "肌肉層的環肌收縮時，消化管會如何變化？",
        "options": [
          {
            "id": "o0",
            "text": "管徑變小"
          },
          {
            "id": "o1",
            "text": "管道縮短"
          },
          {
            "id": "o2",
            "text": "管道伸長"
          },
          {
            "id": "o3",
            "text": "管徑變大"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "環肌收縮使管徑縮小；縱肌收縮使管道縮短。",
        "hint": "想像繞在軟管外的帶子收緊。",
        "feedbackCorrect": "環肌收縮使管徑變小。",
        "src": [
          "gi-muscularis#功能 / 機轉"
        ],
        "bankEligible": true,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "gi-wall-overview-foundation-l2-3",
        "revisitLevel": "L2",
        "timeLimit": 45
      }
    ],
    "case": [
      {
        "template": "choice",
        "mode": "single",
        "prompt": "【緊張的午餐】小安邊吃飯邊擔心考試，覺得食物卡在胃裡下不去。這時消化道的蠕動與分泌最可能？",
        "options": [
          {
            "id": "o0",
            "text": "受交感神經抑制"
          },
          {
            "id": "o1",
            "text": "受副交感神經促進"
          },
          {
            "id": "o2",
            "text": "完全不受神經影響"
          },
          {
            "id": "o3",
            "text": "只受意識控制"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "緊張屬於應付緊急情況的反應，交感神經作用增強，一般抑制蠕動及分泌。",
        "feedbackCorrect": "答對了！緊張時交感神經作用增強，通常抑制消化道蠕動與分泌。",
        "src": [
          "gi-autonomic-control#功能 / 機轉",
          "catecholamines#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-case-q02",
        "revisitLevel": "L6",
        "timeLimit": 60
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "【器官位置】手術時發現某器官位在壁層腹膜與後腹壁之間，它最可能是？",
        "options": [
          {
            "id": "o0",
            "text": "胰臟"
          },
          {
            "id": "o1",
            "text": "胃"
          },
          {
            "id": "o2",
            "text": "空腸"
          },
          {
            "id": "o3",
            "text": "橫結腸"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "腎與胰為腹膜後器官，位在壁層腹膜與後腹壁之間。",
        "feedbackCorrect": "答對了！胰臟屬於腹膜後器官，位於壁層腹膜與後腹壁之間。",
        "src": [
          "peritoneum#臨床應用"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-case-q03",
        "revisitLevel": "L5",
        "timeLimit": 60
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "【上皮線索】在顯微鏡下看到非角質化的複層鱗狀上皮，這段消化道最可能是？",
        "options": [
          {
            "id": "o0",
            "text": "食道"
          },
          {
            "id": "o1",
            "text": "胃"
          },
          {
            "id": "o2",
            "text": "小腸"
          },
          {
            "id": "o3",
            "text": "大腸"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "食道為非角質化複層鱗狀上皮；胃至大腸為單層柱狀。",
        "feedbackCorrect": "答對了！食道內襯非角質化的複層鱗狀上皮。",
        "src": [
          "gi-epithelium#功能 / 機轉",
          "esophagus#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "gi-wall-overview-case-q04",
        "revisitLevel": "L4",
        "timeLimit": 60
      }
    ],
    "passMessage": "恭喜過關！",
    "failMessage": "差一點！看看解析，再試一次，你可以的。",
    "requireFigures": true
  },
  "tracking": {
    "nodeIds": [
      "gi-wall-overview-node-L1-p1",
      "gi-wall-overview-node-L1-p2",
      "gi-wall-overview-node-L1-p3",
      "gi-wall-overview-node-L1-p4",
      "gi-wall-overview-node-L2-mucosa",
      "gi-wall-overview-node-L2-submucosa",
      "gi-wall-overview-node-L2-muscularis",
      "gi-wall-overview-node-L2-outer",
      "gi-wall-overview-node-L2-epithelium",
      "gi-wall-overview-node-L2-lamina",
      "gi-wall-overview-node-L2-mucosal-muscle",
      "gi-wall-overview-node-L3-circular",
      "gi-wall-overview-node-L3-longitudinal",
      "gi-wall-overview-node-L3-myenteric",
      "gi-wall-overview-node-L3-submucosal-plexus",
      "gi-wall-overview-node-L4-p1",
      "gi-wall-overview-node-L4-p2",
      "gi-wall-overview-node-L4-p3",
      "gi-wall-overview-node-L4-p4",
      "gi-wall-overview-node-L5-p1",
      "gi-wall-overview-node-L5-p2",
      "gi-wall-overview-node-L5-p3",
      "gi-wall-overview-node-L5-p4",
      "gi-wall-overview-node-L5-p5"
    ],
    "questionIds": {
      "levels": {
        "L1": [
          "gi-wall-overview-level-1-3"
        ],
        "L2": [
          "gi-wall-overview-level-2-wall-name-outer",
          "gi-wall-overview-level-2-wall-name-mucosal-muscle",
          "gi-wall-overview-level-2-wall-function-muscle",
          "gi-wall-overview-level-2-wall-mucosa-members",
          "gi-wall-overview-level-2-wall-outside-in",
          "gi-wall-overview-level-2-wall-statement"
        ],
        "L3": [
          "gi-wall-overview-level-3-nerve-name-myenteric",
          "gi-wall-overview-level-3-nerve-name-submucosal",
          "gi-wall-overview-level-3-nerve-function-contraction",
          "gi-wall-overview-level-3-nerve-function-secretion",
          "gi-wall-overview-level-3-nerve-two-plexuses",
          "gi-wall-overview-level-3-nerve-statement",
          "gi-wall-overview-level-3-nerve-between-muscles"
        ],
        "L4": [
          "gi-wall-overview-level-4-1",
          "gi-wall-overview-level-4-2"
        ],
        "L5": [
          "gi-wall-overview-level-5-1",
          "gi-wall-overview-level-5-2",
          "gi-wall-overview-level-5-3",
          "gi-wall-overview-level-5-4"
        ],
        "L6": [
          "gi-wall-overview-level-6-1",
          "gi-wall-overview-level-6-2",
          "gi-wall-overview-level-6-3"
        ]
      },
      "ending": [
        "gi-wall-overview-ending-1",
        "gi-wall-overview-ending-2",
        "gi-wall-overview-ending-3"
      ],
      "truefalse": [
        "gi-wall-overview-tf-1",
        "gi-wall-overview-tf-2",
        "gi-wall-overview-tf-3",
        "gi-wall-overview-tf-l2-5"
      ],
      "foundation": [
        "gi-wall-overview-foundation-q01",
        "gi-wall-overview-foundation-q02",
        "gi-wall-overview-foundation-q03",
        "gi-wall-overview-foundation-q05",
        "gi-wall-overview-foundation-l2-2",
        "gi-wall-overview-foundation-l2-3"
      ],
      "case": [
        "gi-wall-overview-case-q02",
        "gi-wall-overview-case-q03",
        "gi-wall-overview-case-q04"
      ]
    },
    "nodeTotal": 24,
    "questionTotal": 39
  }
};
window.LaunchStages = {
  "L2": {
    "url": "stages/L2/index.html",
    "questionPrefix": "gi-wall-overview-level-2-"
  },
  "L3": {
    "url": "stages/L3/index.html",
    "questionPrefix": "gi-wall-overview-level-3-"
  }
};
