window.MaterialShellContent = {
  "title": "咽、吞嚥與食道",
  "slug": "swallowing-esophagus",
  "activityId": "dig-swallowing-esophagus-v1",
  "materialVersion": "swallowing-esophagus-ag2",
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
    "prompt": "食團離開口腔後，要穿過空氣和食物共用的咽，再沿著食道一路往下，穿過橫膈進入胃。6 關之後，你會知道食團是怎麼「安全」地被吞下去的。"
  },
  "levels": [
    {
      "id": "L1",
      "title": "咽的三個分部",
      "summary": "咽分鼻咽、口咽、喉咽；耳咽管開口在鼻咽，口咽與喉咽是空氣和食物的共同通路。",
      "kind": "figure",
      "figure": {
        "stage": "L1",
        "lesson": "stages/L1/index.html"
      }
    },
    {
      "id": "L2",
      "title": "咽周圍的扁桃體",
      "summary": "扁桃體由淋巴小結聚集而成，沒有輸入與輸出淋巴管；咽扁桃體一個，腭扁桃體與舌扁桃體各一對。",
      "kind": "figure",
      "figure": {
        "stage": "L2",
        "lesson": "stages/L2/index.html"
      }
    },
    {
      "id": "L3",
      "title": "吞嚥的三期",
      "summary": "口腔期可隨意啟動；咽期軟腭封鼻咽、會厭護氣道、呼吸暫停；食道期靠蠕動推送，下括約肌鬆弛。",
      "items": "口腔期可隨意啟動；咽期軟腭封鼻咽、會厭護氣道、呼吸暫停；食道期靠蠕動推送，下括約肌鬆弛。",
      "states": [
        {
          "id": "p1",
          "btnText": "口腔期",
          "caption": "吞嚥由口腔的隨意期啟動，舌把食團推向口腔後方。",
          "nodeId": "swallowing-esophagus-node-L3-p1",
          "src": [
            "swallowing#功能 / 機轉"
          ]
        },
        {
          "id": "p2",
          "btnText": "咽期",
          "caption": "咽期時軟腭封住鼻咽、喉上提、會厭保護氣道，上食道括約肌鬆弛；這時呼吸暫停。",
          "nodeId": "swallowing-esophagus-node-L3-p2",
          "src": [
            "swallowing#功能 / 機轉",
            "swallowing#臨床應用"
          ]
        },
        {
          "id": "p3",
          "btnText": "不能停",
          "caption": "食團一進入咽期，吞嚥就不能隨意中止；能隨意啟動，不代表三期都受意識控制。",
          "nodeId": "swallowing-esophagus-node-L3-p3",
          "src": [
            "swallowing#國考重點",
            "swallowing#容易混淆"
          ]
        },
        {
          "id": "p4",
          "btnText": "食道期",
          "caption": "食道期由蠕動推送食團，下食道括約肌鬆弛，讓食團進入胃。",
          "nodeId": "swallowing-esophagus-node-L3-p4",
          "src": [
            "swallowing#功能 / 機轉"
          ]
        }
      ],
      "questions": [
        {
          "template": "match",
          "mode": "order",
          "prompt": "依序點選吞嚥的三期。",
          "items": [
            {
              "id": "i0",
              "text": "口腔期"
            },
            {
              "id": "i1",
              "text": "咽期"
            },
            {
              "id": "i2",
              "text": "食道期"
            }
          ],
          "answer": [
            "i0",
            "i1",
            "i2"
          ],
          "feedbackWrong": "吞嚥依序為口腔期、咽期、食道期。",
          "hint": "跟著食團走的路線。",
          "feedbackCorrect": "口腔期→咽期→食道期。",
          "src": [
            "swallowing#功能 / 機轉"
          ],
          "bankEligible": false,
          "id": "swallowing-esophagus-level-3-1",
          "quizNoFigure": true
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "下列哪一項不是吞嚥咽期會發生的事？",
          "options": [
            {
              "id": "o0",
              "text": "下食道括約肌收縮"
            },
            {
              "id": "o1",
              "text": "軟腭封住鼻咽"
            },
            {
              "id": "o2",
              "text": "會厭保護氣道"
            },
            {
              "id": "o3",
              "text": "上食道括約肌鬆弛"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "咽期上食道括約肌鬆弛；食道期下食道括約肌是鬆弛，不是收縮。",
          "hint": "有一個括約肌的方向被說反了。",
          "feedbackCorrect": "下食道括約肌收縮不屬於吞嚥。",
          "src": [
            "swallowing#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-3-2"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "吞嚥進入哪一期之後，就不能再隨意中止？",
          "options": [
            {
              "id": "o0",
              "text": "咽期"
            },
            {
              "id": "o1",
              "text": "口腔期"
            },
            {
              "id": "o2",
              "text": "三期都可以隨意中止"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "口腔隨意期啟動後，進入咽期即不能隨意中止。",
          "hint": "第二期。",
          "feedbackCorrect": "進入咽期後就不能中止。",
          "src": [
            "swallowing#國考重點"
          ],
          "bankEligible": false,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-3-3"
        }
      ],
      "teachGuide": "依序按下各段說明，再開始作答。"
    },
    {
      "id": "L4",
      "title": "食道的走行與肌肉",
      "summary": "食道在氣管後方，經縱隔、穿橫膈到胃；上1/3骨骼肌、中1/3混合、下1/3平滑肌；三處狹窄在C6、T4、T10。",
      "items": "食道在氣管後方，經縱隔、穿橫膈到胃；上1/3骨骼肌、中1/3混合、下1/3平滑肌；三處狹窄在C6、T4、T10。",
      "states": [
        {
          "id": "p1",
          "btnText": "走行",
          "caption": "食道位在氣管後方，由喉咽經縱隔，再穿過橫膈通往胃。",
          "nodeId": "swallowing-esophagus-node-L4-p1",
          "src": [
            "esophagus#定義"
          ]
        },
        {
          "id": "p2",
          "btnText": "三處狹窄",
          "caption": "食道有三處狹窄：C6的起端、T4的氣管分叉處，以及T10穿過橫膈的食道裂孔。",
          "nodeId": "swallowing-esophagus-node-L4-p2",
          "src": [
            "esophagus#臨床應用"
          ]
        },
        {
          "id": "p3",
          "btnText": "三種肌肉",
          "caption": "食道肌肉上1/3為骨骼肌、中1/3為混合、下1/3為平滑肌；口咽也以骨骼肌參與吞嚥。",
          "nodeId": "swallowing-esophagus-node-L4-p3",
          "src": [
            "esophagus#功能 / 機轉",
            "gi-muscle-types#功能 / 機轉",
            "gi-muscle-types#臨床應用"
          ]
        }
      ],
      "questions": [
        {
          "template": "choice",
          "mode": "single",
          "prompt": "食道位在氣管的哪一側？",
          "options": [
            {
              "id": "o0",
              "text": "後方"
            },
            {
              "id": "o1",
              "text": "前方"
            },
            {
              "id": "o2",
              "text": "左側"
            },
            {
              "id": "o3",
              "text": "右側"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "食道位於氣管後方。",
          "hint": "吞東西時，氣管在你的前面。",
          "feedbackCorrect": "食道在氣管後方。",
          "src": [
            "esophagus#定義"
          ],
          "bankEligible": true,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-4-1"
        },
        {
          "template": "match",
          "mode": "order",
          "prompt": "由上往下，依序點選食道的三處狹窄。",
          "items": [
            {
              "id": "i0",
              "text": "C6 起端"
            },
            {
              "id": "i1",
              "text": "T4 氣管分叉處"
            },
            {
              "id": "i2",
              "text": "T10 食道裂孔"
            }
          ],
          "answer": [
            "i0",
            "i1",
            "i2"
          ],
          "feedbackWrong": "三處狹窄為C6起端、T4氣管分叉、T10食道裂孔。",
          "hint": "由頸部往胸部再到橫膈。",
          "feedbackCorrect": "C6→T4→T10。",
          "src": [
            "esophagus#臨床應用"
          ],
          "bankEligible": false,
          "id": "swallowing-esophagus-level-4-2",
          "quizNoFigure": true
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "下列消化道構造中，何者的肌肉含有骨骼肌？",
          "options": [
            {
              "id": "o0",
              "text": "食道上1/3"
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
              "text": "食道下1/3"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "食道上1/3為骨骼肌；胃、小腸與食道下1/3為平滑肌。",
          "hint": "越接近口腔，越可能是骨骼肌。",
          "feedbackCorrect": "食道上1/3含骨骼肌。",
          "src": [
            "gi-muscle-types#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-4-3"
        }
      ],
      "teachGuide": "依序按下各段說明，再開始作答。"
    },
    {
      "id": "L5",
      "title": "食道的管壁：沒有漿膜",
      "summary": "食道黏膜是非角質化複層鱗狀上皮；最外層是纖維性外膜，沒有漿膜覆蓋，和腹腔的胃腸不同。",
      "items": "食道黏膜是非角質化複層鱗狀上皮；最外層是纖維性外膜，沒有漿膜覆蓋，和腹腔的胃腸不同。",
      "states": [
        {
          "id": "p1",
          "btnText": "黏膜上皮",
          "caption": "食道的黏膜是非角質化的複層鱗狀上皮；從胃到大腸才轉為單層柱狀上皮。",
          "nodeId": "swallowing-esophagus-node-L5-p1",
          "src": [
            "esophagus#功能 / 機轉",
            "gi-epithelium#功能 / 機轉"
          ]
        },
        {
          "id": "p2",
          "btnText": "最外層",
          "caption": "食道最外層是纖維性外膜，沒有漿膜覆蓋；不能把它和腹腔消化道的漿膜當成一樣。",
          "nodeId": "swallowing-esophagus-node-L5-p2",
          "src": [
            "esophagus#功能 / 機轉",
            "esophagus#容易混淆"
          ]
        },
        {
          "id": "p3",
          "btnText": "只分泌黏液",
          "caption": "食道只分泌黏液，沒有消化酶。",
          "nodeId": "swallowing-esophagus-node-L5-p3",
          "src": [
            "esophagus#國考重點"
          ]
        }
      ],
      "questions": [
        {
          "template": "choice",
          "mode": "single",
          "prompt": "食道最外層是哪一種構造？",
          "options": [
            {
              "id": "o0",
              "text": "纖維性外膜"
            },
            {
              "id": "o1",
              "text": "漿膜"
            },
            {
              "id": "o2",
              "text": "黏膜"
            },
            {
              "id": "o3",
              "text": "黏膜肌層"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "食道最外層為纖維性外膜，無漿膜覆蓋。",
          "hint": "它和胃不一樣。",
          "feedbackCorrect": "食道最外層是纖維性外膜。",
          "src": [
            "esophagus#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-5-1"
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "食道最外面缺少哪一層？",
          "options": [
            {
              "id": "o0",
              "text": "肌肉層"
            },
            {
              "id": "o1",
              "text": "漿膜"
            },
            {
              "id": "o2",
              "text": "黏膜"
            },
            {
              "id": "o3",
              "text": "黏膜下層"
            }
          ],
          "answer": "o1",
          "feedbackWrong": "肌肉上1/3為骨骼肌、中1/3混合、下1/3為平滑肌；黏膜為非角質化複層鱗狀上皮，最外為纖維性外膜，無漿膜覆蓋。",
          "feedbackCorrect": "肌肉上1/3為骨骼肌、中1/3混合、下1/3為平滑肌；黏膜為非角質化複層鱗狀上皮，最外為纖維性外膜，無漿膜覆蓋。",
          "src": [
            "esophagus#功能 / 機轉",
            "esophagus#容易混淆"
          ],
          "bankEligible": false,
          "id": "swallowing-esophagus-level-5-2",
          "quizNoFigure": true
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "關於食道，下列何者錯誤？",
          "options": [
            {
              "id": "o0",
              "text": "具有單層柱狀上皮"
            },
            {
              "id": "o1",
              "text": "位於氣管後方"
            },
            {
              "id": "o2",
              "text": "以蠕動推送食團"
            },
            {
              "id": "o3",
              "text": "只分泌黏液，沒有消化酶"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "食道是非角質化複層鱗狀上皮；單層柱狀上皮從胃開始。",
          "hint": "找出上皮種類。",
          "feedbackCorrect": "「具有單層柱狀上皮」是錯的。",
          "src": [
            "esophagus#功能 / 機轉",
            "gi-epithelium#功能 / 機轉"
          ],
          "bankEligible": true,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-5-3"
        }
      ],
      "teachGuide": "依序按下各段說明，再開始作答。"
    },
    {
      "id": "L6",
      "title": "橫膈的三個開口",
      "summary": "主動脈裂孔：主動脈與胸管；食道裂孔：食道與迷走神經；腔靜脈孔：在中央腱右後方，下腔靜脈通過。",
      "items": "主動脈裂孔：主動脈與胸管；食道裂孔：食道與迷走神經；腔靜脈孔：在中央腱右後方，下腔靜脈通過。",
      "states": [
        {
          "id": "p1",
          "btnText": "主動脈裂孔",
          "caption": "主動脈裂孔有主動脈與胸管通過。",
          "nodeId": "swallowing-esophagus-node-L6-p1",
          "src": [
            "diaphragm-openings#功能 / 機轉"
          ]
        },
        {
          "id": "p2",
          "btnText": "食道裂孔",
          "caption": "食道裂孔有食道與其上的迷走神經通過；食道穿過橫膈處約在T10。",
          "nodeId": "swallowing-esophagus-node-L6-p2",
          "src": [
            "diaphragm-openings#功能 / 機轉",
            "diaphragm-openings#國考重點"
          ]
        },
        {
          "id": "p3",
          "btnText": "腔靜脈孔",
          "caption": "腔靜脈孔位於中央腱的右後部分，有下腔靜脈通過，不是上腔靜脈。",
          "nodeId": "swallowing-esophagus-node-L6-p3",
          "src": [
            "diaphragm-openings#功能 / 機轉",
            "diaphragm-openings#容易混淆"
          ]
        }
      ],
      "questions": [
        {
          "template": "match",
          "mode": "rows",
          "prompt": "把每一個構造配對到它穿過橫膈的開口。",
          "items": [
            {
              "id": "i0",
              "text": "食道"
            },
            {
              "id": "i1",
              "text": "胸管"
            },
            {
              "id": "i2",
              "text": "下腔靜脈"
            },
            {
              "id": "i3",
              "text": "迷走神經"
            }
          ],
          "targets": [
            {
              "id": "t0",
              "label": "主動脈裂孔"
            },
            {
              "id": "t1",
              "label": "食道裂孔"
            },
            {
              "id": "t2",
              "label": "腔靜脈孔"
            }
          ],
          "answer": {
            "i0": "t1",
            "i1": "t0",
            "i2": "t2",
            "i3": "t1"
          },
          "byItem": {
            "i0": "主動脈裂孔：主動脈＋胸管；食道裂孔：食道＋迷走神經；腔靜脈孔：下腔靜脈。",
            "i1": "主動脈裂孔：主動脈＋胸管；食道裂孔：食道＋迷走神經；腔靜脈孔：下腔靜脈。",
            "i2": "主動脈裂孔：主動脈＋胸管；食道裂孔：食道＋迷走神經；腔靜脈孔：下腔靜脈。",
            "i3": "主動脈裂孔：主動脈＋胸管；食道裂孔：食道＋迷走神經；腔靜脈孔：下腔靜脈。"
          },
          "feedbackWrong": "主動脈裂孔：主動脈＋胸管；食道裂孔：食道＋迷走神經；腔靜脈孔：下腔靜脈。",
          "hint": "每個開口除了主角，還有一個同行者。",
          "feedbackCorrect": "都配對正確。",
          "src": [
            "diaphragm-openings#功能 / 機轉",
            "diaphragm-openings#國考重點"
          ],
          "bankEligible": false,
          "id": "swallowing-esophagus-level-6-1",
          "quizNoFigure": true
        },
        {
          "template": "choice",
          "mode": "single",
          "prompt": "通過腔靜脈孔的是哪一條血管？",
          "options": [
            {
              "id": "o0",
              "text": "下腔靜脈"
            },
            {
              "id": "o1",
              "text": "上腔靜脈"
            },
            {
              "id": "o2",
              "text": "主動脈"
            },
            {
              "id": "o3",
              "text": "胸管"
            }
          ],
          "answer": "o0",
          "feedbackWrong": "腔靜脈孔有下腔靜脈通過；上腔靜脈不穿過橫膈。",
          "hint": "想想從腹腔回到胸腔的那一條。",
          "feedbackCorrect": "是下腔靜脈。",
          "src": [
            "diaphragm-openings#容易混淆"
          ],
          "bankEligible": true,
          "quizNoFigure": true,
          "id": "swallowing-esophagus-level-6-2"
        }
      ],
      "teachGuide": "依序按下各段說明，再開始作答。"
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
    "finish": "從咽到胃，一路有軟腭、會厭和括約肌把關；你也安全地把這一段吞下去了。 🫗 🎉"
  },
  "ending": {
    "prompt": "結尾",
    "steps": [
      {
        "template": "choice",
        "mode": "single",
        "prompt": "耳咽管開口在？",
        "options": [
          {
            "id": "o0",
            "text": "鼻咽"
          },
          {
            "id": "o1",
            "text": "喉咽"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "耳咽管開口在鼻咽。",
        "feedbackCorrect": "鼻咽。",
        "src": [
          "pharynx-divisions#國考重點"
        ],
        "bankEligible": false,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "swallowing-esophagus-ending-1",
        "revisitLevel": "L1"
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "咽期時呼吸會？",
        "options": [
          {
            "id": "o0",
            "text": "暫停"
          },
          {
            "id": "o1",
            "text": "照常進行"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "咽期呼吸暫停，保護食團不進入呼吸道。",
        "feedbackCorrect": "暫停。",
        "src": [
          "swallowing#臨床應用"
        ],
        "bankEligible": false,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "swallowing-esophagus-ending-2",
        "revisitLevel": "L3"
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "食道最外層有沒有漿膜？",
        "options": [
          {
            "id": "o0",
            "text": "沒有，是纖維性外膜"
          },
          {
            "id": "o1",
            "text": "有，和胃一樣"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "食道最外層為纖維性外膜，無漿膜。",
        "feedbackCorrect": "沒有漿膜。",
        "src": [
          "esophagus#功能 / 機轉"
        ],
        "bankEligible": false,
        "quizImgState": null,
        "quizNoFigure": true,
        "id": "swallowing-esophagus-ending-3",
        "revisitLevel": "L5"
      }
    ],
    "completeMessage": "食團經過咽，由軟腭和會厭把關，再靠食道蠕動往下，穿過T10的食道裂孔進入胃。"
  },
  "truefalse": [
    {
      "id": "swallowing-esophagus-tf-1",
      "statement": "扁桃體和淋巴結一樣有輸入與輸出淋巴管。",
      "answer": false,
      "feedback": "扁桃體沒有輸入與輸出淋巴管，靠隱窩接觸抗原。",
      "template": "choice",
      "mode": "single",
      "prompt": "扁桃體和淋巴結一樣有輸入與輸出淋巴管。",
      "feedbackWrong": "扁桃體沒有輸入與輸出淋巴管，靠隱窩接觸抗原。",
      "feedbackCorrect": "扁桃體沒有輸入與輸出淋巴管，靠隱窩接觸抗原。",
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
        "tonsil#國考重點"
      ],
      "bankEligible": false
    },
    {
      "id": "swallowing-esophagus-tf-2",
      "statement": "食道上1/3為骨骼肌，下1/3為平滑肌。",
      "answer": true,
      "feedback": "食道肌肉由上而下為骨骼肌、混合、平滑肌。",
      "template": "choice",
      "mode": "single",
      "prompt": "食道上1/3為骨骼肌，下1/3為平滑肌。",
      "feedbackWrong": "食道肌肉由上而下為骨骼肌、混合、平滑肌。",
      "feedbackCorrect": "食道肌肉由上而下為骨骼肌、混合、平滑肌。",
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
        "esophagus#功能 / 機轉"
      ],
      "bankEligible": false
    },
    {
      "id": "swallowing-esophagus-tf-3",
      "statement": "食道分泌消化酶，幫助分解食團。",
      "answer": false,
      "feedback": "食道只分泌黏液，無消化酶。",
      "template": "choice",
      "mode": "single",
      "prompt": "食道分泌消化酶，幫助分解食團。",
      "feedbackWrong": "食道只分泌黏液，無消化酶。",
      "feedbackCorrect": "食道只分泌黏液，無消化酶。",
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
        "esophagus#國考重點"
      ],
      "bankEligible": false
    }
  ],
  "assessment": {
    "intro": "太棒了！你已經完成 6 關，認識了咽、扁桃體、吞嚥三期、食道和橫膈的開口。接下來是正式考題，會用課本上的用語，剛剛學過的概念都用得上。加油！",
    "foundation": [
      {
        "template": "choice",
        "mode": "single",
        "prompt": "下列何者橫跨頸部、胸部，並穿過橫膈到腹部？",
        "options": [
          {
            "id": "o0",
            "text": "食道"
          },
          {
            "id": "o1",
            "text": "氣管"
          },
          {
            "id": "o2",
            "text": "咽"
          },
          {
            "id": "o3",
            "text": "喉"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "食道由喉咽經縱隔與橫膈通往胃。",
        "feedbackCorrect": "答對了！食道從喉咽往下，經胸部並穿過橫膈通往胃。",
        "src": [
          "esophagus#定義"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-foundation-q01",
        "revisitLevel": "L4",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "下列何者穿過橫膈的食道裂孔？",
        "options": [
          {
            "id": "o0",
            "text": "迷走神經"
          },
          {
            "id": "o1",
            "text": "胸管"
          },
          {
            "id": "o2",
            "text": "下腔靜脈"
          },
          {
            "id": "o3",
            "text": "主動脈"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "食道裂孔有食道及迷走神經通過。",
        "feedbackCorrect": "答對了！食道與迷走神經都經食道裂孔通過橫膈。",
        "src": [
          "diaphragm-openings#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-foundation-q02",
        "revisitLevel": "L6",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "下列何者的肌肉不是平滑肌？",
        "options": [
          {
            "id": "o0",
            "text": "口咽"
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
            "text": "食道下1/3"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "口咽以骨骼肌參與吞嚥；其餘為平滑肌。",
        "feedbackCorrect": "答對了！口咽的骨骼肌會參與吞嚥。",
        "src": [
          "gi-muscle-types#臨床應用",
          "gi-muscle-types#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-foundation-q03",
        "revisitLevel": "L4",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "關於扁桃體，下列何者正確？",
        "options": [
          {
            "id": "o0",
            "text": "由淋巴小結聚集而成"
          },
          {
            "id": "o1",
            "text": "有輸入淋巴管"
          },
          {
            "id": "o2",
            "text": "咽扁桃體成對"
          },
          {
            "id": "o3",
            "text": "舌扁桃體位於鼻咽後壁"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "扁桃體由淋巴小結聚集，無輸入輸出淋巴管；咽扁桃體單一、在鼻咽後壁。",
        "feedbackCorrect": "答對了！扁桃體由淋巴小結聚集而成。",
        "src": [
          "tonsil#定義",
          "tonsil#國考重點"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-foundation-q04",
        "revisitLevel": "L2",
        "timeLimit": 45
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "食道的推送主要靠什麼？",
        "options": [
          {
            "id": "o0",
            "text": "蠕動"
          },
          {
            "id": "o1",
            "text": "分節收縮"
          },
          {
            "id": "o2",
            "text": "重力"
          },
          {
            "id": "o3",
            "text": "括約肌收縮"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "食道期由蠕動推送食團。",
        "feedbackCorrect": "答對了！食道靠蠕動把食團推向胃。",
        "src": [
          "swallowing#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-foundation-q05",
        "revisitLevel": "L3",
        "timeLimit": 45
      }
    ],
    "case": [
      {
        "template": "choice",
        "mode": "single",
        "prompt": "【嗆到】吃飯時邊笑邊吞，食物差點跑進氣管。正常吞嚥時，負責保護氣道的是？",
        "options": [
          {
            "id": "o0",
            "text": "會厭"
          },
          {
            "id": "o1",
            "text": "軟腭"
          },
          {
            "id": "o2",
            "text": "上食道括約肌"
          },
          {
            "id": "o3",
            "text": "耳咽管"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "咽期會厭保護氣道；軟腭封住的是鼻咽。",
        "feedbackCorrect": "答對了！咽期吞嚥時會厭保護氣道，軟腭則封住鼻咽。",
        "src": [
          "swallowing#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-case-q01",
        "revisitLevel": "L3",
        "timeLimit": 60
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "食道由胸腔進入腹腔時會通過橫膈的哪個開口？",
        "options": [
          {
            "id": "o0",
            "text": "主動脈裂孔"
          },
          {
            "id": "o1",
            "text": "食道裂孔"
          },
          {
            "id": "o2",
            "text": "腔靜脈孔"
          }
        ],
        "answer": "o1",
        "feedbackWrong": "主動脈裂孔有主動脈及胸管通過；食道裂孔有食道與其上的迷走神經通過；腔靜脈孔位於中央腱右後部分，有下腔靜脈通過。",
        "feedbackCorrect": "主動脈裂孔有主動脈及胸管通過；食道裂孔有食道與其上的迷走神經通過；腔靜脈孔位於中央腱右後部分，有下腔靜脈通過。",
        "src": [
          "diaphragm-openings#功能 / 機轉"
        ],
        "bankEligible": false,
        "id": "swallowing-esophagus-case-q02",
        "revisitLevel": "L6",
        "timeLimit": 60,
        "quizNoFigure": true
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "【定位】食團在食道中經過的第二處狹窄，大約在什麼高度？",
        "options": [
          {
            "id": "o0",
            "text": "T4，氣管分叉處"
          },
          {
            "id": "o1",
            "text": "C6，食道起端"
          },
          {
            "id": "o2",
            "text": "T10，食道裂孔"
          },
          {
            "id": "o3",
            "text": "T12"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "三處狹窄依序為C6、T4、T10。",
        "feedbackCorrect": "答對了！食道第二處狹窄約在 T4 高度，鄰近氣管分叉。",
        "src": [
          "esophagus#臨床應用"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-case-q03",
        "revisitLevel": "L4",
        "timeLimit": 60
      },
      {
        "template": "choice",
        "mode": "single",
        "prompt": "【飛機降落】搭飛機降落時耳朵悶悶的，和中耳壓力有關。能平衡中耳壓力、開口在鼻咽的構造是？",
        "options": [
          {
            "id": "o0",
            "text": "耳咽管"
          },
          {
            "id": "o1",
            "text": "扁桃體"
          },
          {
            "id": "o2",
            "text": "會厭"
          },
          {
            "id": "o3",
            "text": "喉"
          }
        ],
        "answer": "o0",
        "feedbackWrong": "耳咽管連通鼻咽與中耳，可平衡中耳壓力。",
        "feedbackCorrect": "答對了！耳咽管連通鼻咽與中耳，可平衡中耳壓力。",
        "src": [
          "auditory-tube#定義",
          "auditory-tube#功能 / 機轉"
        ],
        "bankEligible": true,
        "id": "swallowing-esophagus-case-q04",
        "revisitLevel": "L1",
        "timeLimit": 60
      }
    ],
    "passMessage": "恭喜過關！",
    "failMessage": "差一點！看看解析，再試一次，你可以的。"
  },
  "tracking": {
    "nodeIds": [
      "swallowing-esophagus-node-L1-nasopharynx",
      "swallowing-esophagus-node-L1-oropharynx",
      "swallowing-esophagus-node-L1-epiglottis",
      "swallowing-esophagus-node-L1-laryngopharynx",
      "swallowing-esophagus-node-L2-pharyngeal-tonsil",
      "swallowing-esophagus-node-L2-palatine-tonsil",
      "swallowing-esophagus-node-L2-lingual-tonsil",
      "swallowing-esophagus-node-L3-p1",
      "swallowing-esophagus-node-L3-p2",
      "swallowing-esophagus-node-L3-p3",
      "swallowing-esophagus-node-L3-p4",
      "swallowing-esophagus-node-L4-p1",
      "swallowing-esophagus-node-L4-p2",
      "swallowing-esophagus-node-L4-p3",
      "swallowing-esophagus-node-L5-p1",
      "swallowing-esophagus-node-L5-p2",
      "swallowing-esophagus-node-L5-p3",
      "swallowing-esophagus-node-L6-p1",
      "swallowing-esophagus-node-L6-p2",
      "swallowing-esophagus-node-L6-p3"
    ],
    "questionIds": {
      "levels": {
        "L1": [
          "swallowing-esophagus-level-1-d3-l1-q1",
          "swallowing-esophagus-level-1-d3-l1-q2",
          "swallowing-esophagus-level-1-d3-l1-q3",
          "swallowing-esophagus-level-1-d3-l1-q4"
        ],
        "L2": [
          "swallowing-esophagus-level-2-d3-l2-q1",
          "swallowing-esophagus-level-2-d3-l2-q2",
          "swallowing-esophagus-level-2-d3-l2-q3",
          "swallowing-esophagus-level-2-d3-l2-q4"
        ],
        "L3": [
          "swallowing-esophagus-level-3-1",
          "swallowing-esophagus-level-3-2",
          "swallowing-esophagus-level-3-3"
        ],
        "L4": [
          "swallowing-esophagus-level-4-1",
          "swallowing-esophagus-level-4-2",
          "swallowing-esophagus-level-4-3"
        ],
        "L5": [
          "swallowing-esophagus-level-5-1",
          "swallowing-esophagus-level-5-2",
          "swallowing-esophagus-level-5-3"
        ],
        "L6": [
          "swallowing-esophagus-level-6-1",
          "swallowing-esophagus-level-6-2"
        ]
      },
      "ending": [
        "swallowing-esophagus-ending-1",
        "swallowing-esophagus-ending-2",
        "swallowing-esophagus-ending-3"
      ],
      "truefalse": [
        "swallowing-esophagus-tf-1",
        "swallowing-esophagus-tf-2",
        "swallowing-esophagus-tf-3"
      ],
      "foundation": [
        "swallowing-esophagus-foundation-q01",
        "swallowing-esophagus-foundation-q02",
        "swallowing-esophagus-foundation-q03",
        "swallowing-esophagus-foundation-q04",
        "swallowing-esophagus-foundation-q05"
      ],
      "case": [
        "swallowing-esophagus-case-q01",
        "swallowing-esophagus-case-q02",
        "swallowing-esophagus-case-q03",
        "swallowing-esophagus-case-q04"
      ]
    },
    "nodeTotal": 20,
    "questionTotal": 34
  }
};
window.LaunchStages = {
  "L1": {
    "url": "stages/L1/index.html",
    "questionPrefix": "swallowing-esophagus-level-1-"
  },
  "L2": {
    "url": "stages/L2/index.html",
    "questionPrefix": "swallowing-esophagus-level-2-"
  }
};
