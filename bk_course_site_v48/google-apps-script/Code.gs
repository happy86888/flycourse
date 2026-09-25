const SPREADSHEET_ID = '14H_UN89Pc49Wxa1wvOB96nTyfaH0xptDKQTyXvzDYho';
const SHEET_NAME = '報名資料';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

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

    // Basic anti-spam honeypot. Real users should never fill this field.
    if (data.website) {
      return jsonOutput({ success: true });
    }

    const required = ['course_plan', 'name', 'phone', 'email', 'payment_last5'];
    for (const key of required) {
      if (!String(data[key] || '').trim()) {
        throw new Error('Missing required field: ' + key);
      }
    }

    const last5 = String(data.payment_last5 || '').replace(/\D/g, '').slice(0, 5);
    if (last5.length !== 5) {
      throw new Error('Invalid payment_last5');
    }

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

    return jsonOutput({ success: true });
  } catch (err) {
    return jsonOutput({ success: false, error: String(err) });
  }
}

function doGet() {
  return jsonOutput({ status: 'ok', service: 'BK Course Registration' });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
