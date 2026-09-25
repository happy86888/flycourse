# BK 里程旅行實戰班網站 v4.7


## 本版更新
- 報名頁改成兩段式流程：
  1. `registration.html`：選課程＋基本資料
  2. `registration-payment.html`：付款資訊＋付款帳號末五碼
  3. `registration-success.html`：提醒私訊老師並輸入「報名成功」
- 第一頁不再顯示付款資訊。
- 「姓名」改為「怎麼稱呼你?」
- 「手機」改為「手機（沒有緊急或重要通知事項不會打）」
- 付款末五碼只在付款頁填寫。

## 重要：報名資料目前尚未送到後台
`registration-payment.js` 已設定 Google Apps Script `/exec` endpoint，可將完成付款步驟的報名資料寫入 Google Sheet。
在串接 Google Sheet / Apps Script / Formspree / 自建 API 前，學員填寫的資料只暫存在該學員瀏覽器 localStorage；老師端看不到報名紀錄。

建議正式上線前串接 Google Sheet，之後每一筆報名資料可在試算表查看：
- 送出時間
- 課程方案
- 金額
- 稱呼
- 手機
- Email
- 留言／實體課場次
- 付款帳號末五碼

## 付款帳號
`registration-payment.js` 已設定正式匯款帳號。付款資訊只在第二步付款頁顯示。

注意：若網站 repo 是 Public，熟悉技術的人仍可從網站原始碼找到收款帳號；目前此版主要避免一般訪客在第一步就直接看到付款資訊。


## V4.8 付款資訊
- 銀行：中國信託
- 銀行代碼：822
- 帳號：115540-345068
- 若銀行端產生轉帳手續費，可由應付金額扣除 NT$15 後匯款。
- 付款資訊只顯示於第二步付款頁。
