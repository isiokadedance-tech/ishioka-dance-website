/**
 * 石岡ダンス教室ホームページ用 API
 * 「クラス・料金」シートの published が TRUE の行だけを公開します。
 */
const SPREADSHEET_ID = '1886gmrZnJPTV5gyuW_WVgIOaa8Bk8ygwku5L82Dap5k';
const CLASSES_SHEET_NAME = 'クラス・料金';

function doGet(e) {
  try {
    const request = (e && e.parameter) || {};
    const sheet = String(request.sheet || 'classes').toLowerCase();

    if (sheet !== 'classes') {
      return jsonResponse({
        ok: false,
        error: 'unknown_sheet',
        message: 'sheet=classes を指定してください。'
      });
    }

    return jsonResponse({
      ok: true,
      classes: readPublishedClasses(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: 'server_error',
      message: String(error && error.message ? error.message : error)
    });
  }
}

function readPublishedClasses() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(CLASSES_SHEET_NAME);

  if (!sheet) {
    throw new Error('「' + CLASSES_SHEET_NAME + '」シートが見つかりません。');
  }

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0].map(function (header) {
    return String(header).trim();
  });

  return values.slice(1).map(function (row, rowIndex) {
    const item = {};
    headers.forEach(function (header, columnIndex) {
      if (header) item[header] = row[columnIndex] || '';
    });

    item.published = isPublished(item.published);
    item.id = 'class-' + (rowIndex + 1);
    return item;
  }).filter(function (item) {
    return item.published && String(item.className || '').trim() !== '';
  });
}

function isPublished(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === 'TRUE' || normalized === '公開' || normalized === 'YES' || normalized === '1';
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
