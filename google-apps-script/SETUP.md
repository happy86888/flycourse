# Google Sheet 串接設定

目標 Google Sheet：
https://docs.google.com/spreadsheets/d/14H_UN89Pc49Wxa1wvOB96nTyfaH0xptDKQTyXvzDYho/edit

## 1. 打開 Apps Script
在 Google Sheet 中選：
「擴充功能」→「Apps Script」

## 2. 貼入 Code.gs
把 `Code.gs` 內容全部貼到 Apps Script 編輯器，取代原本程式。

## 3. 部署成 Web App
右上角：
「部署」→「新增部署作業」→ 類型選「網頁應用程式」

設定：
- 執行身分：我
- 誰可以存取：任何人

按「部署」並完成 Google 授權。

## 4. 複製 Web App URL
會得到類似：
https://script.google.com/macros/s/AKfycb.../exec

把這個 `/exec` 網址傳回 ChatGPT，即可寫入網站 `registration-payment.js`。

## 報名資料會存在哪裡？
同一張 Google Sheet 裡會自動建立（或使用）分頁：`報名資料`

欄位：
報名時間 / 課程方案 / 金額 / 怎麼稱呼你 / 手機 / Email / 實體課場次・留言 / 付款末五碼 / 付款確認 / 處理狀態
