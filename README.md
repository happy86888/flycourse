# BK 里程旅行實戰班網站 v5.0

本版修正三件事：

1. 手機版大標題重新處理換行
   - 手機版不再強制沿用桌機 `<br>` 斷行
   - 中文標點避免單獨掉到下一行
   - 390 / 430px 寬度的標題字級再收斂

2. Google Sheet「設定」分頁自動建立
   - 部署新版 Apps Script 後，只要重新整理網站一次，程式會自動建立／補齊「設定」分頁
   - 不需要手動建立欄位

3. 匯款帳號改由 Google Sheet 管理
   - 不需要再改 HTML / GitHub
   - 付款頁進入第二步時，才另外向 Apps Script 讀取銀行資訊
   - 首頁 status API 不回傳匯款帳號

## Google Sheet「設定」分頁

部署新版 Apps Script 後，重新整理網站一次，Google Sheet 會出現「設定」分頁：

- B2：開放報名（核取方塊）
- B3：額滿標題
- B4：額滿說明
- B6：銀行名稱
- B7：銀行代碼
- B8：匯款帳號
- B9：匯款提醒

### 一鍵額滿

- B2 勾選：開放報名
- B2 取消勾選：額滿

額滿後：
- 首頁報名按鈕會顯示「本梯次報名額滿」
- 報名頁會顯示額滿訊息
- 付款頁不會顯示銀行帳號
- Apps Script 後端也會停止新增報名資料

## 一次性的 Apps Script 更新方式

1. 打開報名 Google Sheet
2. 擴充功能 → Apps Script
3. 把 `google-apps-script/Code.gs` 全部覆蓋到目前 Apps Script
4. 儲存
5. 部署 → 管理部署作業
6. 編輯目前 Web App 部署
7. 版本選「新版本」
8. 部署
9. 回到 https://course.briankill.com/ 重新整理一次
10. 回 Google Sheet，即可看到「設定」分頁

原本 `/exec` 網址不需更換。
