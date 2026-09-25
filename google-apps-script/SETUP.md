# Google Apps Script 更新說明（v5.0）

此版本會自動建立 Google Sheet 的「設定」分頁，並把報名開關、額滿文字與銀行匯款資訊集中管理。

## 更新

1. Google Sheet → 擴充功能 → Apps Script
2. 用本資料夾 `Code.gs` 完整取代舊程式
3. 儲存
4. 部署 → 管理部署作業
5. 編輯目前的 Web App 部署
6. 版本選「新版本」
7. 部署

部署後網址仍使用原本：
`https://script.google.com/macros/s/AKfycbyTnwYPq1zrMg5WfDIrnCkPH9w4RhKoP_IV1JgJY6yCDu2HqoTcPDshOnXX5iinzxcD/exec`

## 「設定」分頁沒有出現？

新版部署完成後，只要重新整理 `https://course.briankill.com/` 一次，網站會呼叫 status API，Apps Script 會自動建立「設定」分頁。

也可以在 Apps Script 編輯器中手動執行一次：
`setupCourseSettings`

## 設定欄位

- B2：開放報名（勾選＝開放；取消＝額滿）
- B3：額滿標題
- B4：額滿說明
- B6：銀行名稱
- B7：銀行代碼
- B8：匯款帳號
- B9：匯款提醒

付款頁會即時讀取 B6:B9；之後更換匯款帳號，不必再修改網站檔案。
