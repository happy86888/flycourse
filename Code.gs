const SPREADSHEET_ID = '14H_UN89Pc49Wxa1wvOB96nTyfaH0xptDKQTyXvzDYho';
const SHEET_NAME = '報名資料';
const SETTINGS_SHEET_NAME = '設定';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const registration = getRegistrationConfig_(ss);

    // 額滿時，後端也停止收件，避免只靠前端控制。
    if (!registration.open) {
      return jsonOutput_({ success: false, code: 'REGISTRATION_CLOSED' });
    }

    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    const headers = [
      '報名時間',
      '課程方案',
      '金額',
      '怎麼稱呼你',
      '手機',
      'Email',
      '實體課場次 / 留言',
      '付款末五碼',
      '付款確認',
      '處理狀態'
    ];

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }

    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    // Honeypot：一般使用者不會填這個欄位。
    if (data.website) return jsonOutput_({ success: true });

    const required = ['course_plan', 'name', 'phone', 'email', 'payment_last5'];
    for (const key of required) {
      if (!String(data[key] || '').trim()) {
        throw new Error('Missing required field: ' + key);
      }
    }

    const last5 = String(data.payment_last5 || '').replace(/\D/g, '').slice(0, 5);
    if (last5.length !== 5) throw new Error('Invalid payment_last5');

    sheet.appendRow([
      new Date(),
      String(data.course_plan || '').trim(),
      Number(data.course_price || 0),
      String(data.name || '').trim(),
      String(data.phone || '').trim(),
      String(data.email || '').trim(),
      String(data.note || '').trim(),
      last5,
      '待確認',
      '新報名'
    ]);

    return jsonOutput_({ success: true });
  } catch (err) {
    return jsonOutput_({ success: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = String((e && e.parameter && e.parameter.action) || '').trim();

    if (action === 'status') {
      return jsonOrJsonpOutput_(getRegistrationConfig_(ss), e);
    }

    // 付款資料只在付款頁另外讀取，首頁的 status 不回傳銀行帳號。
    if (action === 'payment') {
      const registration = getRegistrationConfig_(ss);
      if (!registration.open) {
        return jsonOrJsonpOutput_({ open: false, title: registration.title, message: registration.message }, e);
      }
      return jsonOrJsonpOutput_(getPaymentConfig_(ss), e);
    }

    return jsonOrJsonpOutput_({ status: 'ok', service: 'BK Course Registration' }, e);
  } catch (err) {
    return jsonOrJsonpOutput_({ status: 'error', error: String(err) }, e);
  }
}

// 若想手動建立 / 補齊設定分頁，可在 Apps Script 編輯器執行這個函式一次。
// 其實新版部署後，只要有人打開網站，status API 也會自動建立設定分頁。
function setupCourseSettings() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ensureSettingsSheet_(ss);
  Logger.log('設定分頁已建立 / 更新：' + sheet.getName());
}

function ensureSettingsSheet_(ss) {
  let sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SETTINGS_SHEET_NAME);

  // 表頭
  if (!sheet.getRange('A1').getValue()) sheet.getRange('A1:B1').setValues([['設定項目', '設定值']]);

  // 報名狀態
  if (!sheet.getRange('A2').getValue()) sheet.getRange('A2').setValue('開放報名');
  const openCell = sheet.getRange('B2');
  if (!openCell.getDataValidation()) openCell.insertCheckboxes();
  if (openCell.getValue() === '') openCell.setValue(true);

  if (!sheet.getRange('A3').getValue()) sheet.getRange('A3').setValue('額滿標題');
  if (!sheet.getRange('B3').getValue()) sheet.getRange('B3').setValue('本梯次報名額滿');

  if (!sheet.getRange('A4').getValue()) sheet.getRange('A4').setValue('額滿說明');
  if (!sheet.getRange('B4').getValue()) sheet.getRange('B4').setValue('感謝你的關注，本梯次名額已滿。下一梯次開放時會再公告，也可以先透過 LINE 詢問。');

  // 付款資訊：之後只要改這裡，不用改 GitHub / HTML。
  if (!sheet.getRange('A6').getValue()) sheet.getRange('A6').setValue('銀行名稱');
  if (!sheet.getRange('B6').getValue()) sheet.getRange('B6').setValue('中國信託');

  if (!sheet.getRange('A7').getValue()) sheet.getRange('A7').setValue('銀行代碼');
  if (!sheet.getRange('B7').getValue()) sheet.getRange('B7').setValue('822');

  if (!sheet.getRange('A8').getValue()) sheet.getRange('A8').setValue('匯款帳號');
  if (!sheet.getRange('B8').getValue()) sheet.getRange('B8').setValue('115540-345068');

  if (!sheet.getRange('A9').getValue()) sheet.getRange('A9').setValue('匯款提醒');
  if (!sheet.getRange('B9').getValue()) sheet.getRange('B9').setValue('假設購買 19,800 元完整課程，只需匯款 19,785 元即可（以此類推）。');

  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 520);

  return sheet;
}

function getRegistrationConfig_(ss) {
  const sheet = ensureSettingsSheet_(ss);
  return {
    open: sheet.getRange('B2').getValue() === true,
    title: String(sheet.getRange('B3').getValue() || '本梯次報名額滿'),
    message: String(sheet.getRange('B4').getValue() || '感謝你的關注，本梯次名額已滿。下一梯次開放時會再公告。')
  };
}

function getPaymentConfig_(ss) {
  const sheet = ensureSettingsSheet_(ss);
  return {
    open: sheet.getRange('B2').getValue() === true,
    bank_name: String(sheet.getRange('B6').getValue() || ''),
    bank_code: String(sheet.getRange('B7').getValue() || ''),
    bank_account: String(sheet.getRange('B8').getValue() || ''),
    payment_note: String(sheet.getRange('B9').getValue() || '')
  };
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonOrJsonpOutput_(obj, e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '').trim();
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(obj);
}
