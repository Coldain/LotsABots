function buildJSON(sheetName, row) {
  const idColumn = "H"
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastColumn = sheet.getLastColumn();
  const [headers, descriptions, values] = sheet.getRangeList([
    `${idColumn}1:${sheet.getRange(1, lastColumn).getA1Notation()}`,
    `${idColumn}2:${sheet.getRange(2, lastColumn).getA1Notation()}`,
    `${idColumn}${row}:${sheet.getRange(row, lastColumn).getA1Notation()}`,
  ]).getRanges().map(range => range.getValues()[0]);
  const obj = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    const value = values[i];

    if (header.includes("json")) {
      const key = header.replace("json", "");
      const sanitizedValue = value.replace(/([^\\])'/g, "$1\"").replace(/,\s*$/, ""); // Remove trailing comma
      obj[key] = JSON.parse(sanitizedValue);
    } else {
      obj[header] = value;
    }
  }

  let jsonWithComments = "{\n";

  for (const [index, header] of headers.entries()) {
    const key = header.toLowerCase();
    const value = obj[key];
    const description = descriptions[index];

    jsonWithComments += `  ${key}: ${
      typeof value === "string" ? `"${value}"` : value
    }, // ${description}\n`;
  }

  jsonWithComments += "}";

  return jsonWithComments;
}

function onEdit(e) {
  Logger.log(e);
  const sheetName = e.source.getActiveSheet().getName();
  Logger.log(`sheetName: ${sheetName}`);
  const sheet = e.source.getSheetByName(sheetName);
  Logger.log(`sheet: ${sheet}`);
  const changedRange = e.range;
  Logger.log(`changedRange: ${changedRange}`);
  const startingColumn = 8; // Column G
  Logger.log(`startingColumn: ${startingColumn}`);

  if (sheet && changedRange.getColumn() >= startingColumn) {
    const scriptProperties = PropertiesService.getScriptProperties();
    const numRows = changedRange.getNumRows();
    Logger.log(`numRows: ${numRows}`);
    const numColumns = changedRange.getNumColumns();
    Logger.log(`numColumns: ${numColumns}`);

    const updatedRows = new Set();

    for (let r = 0; r < numRows; r++) {
      const row = changedRange.getRow() + r;

      for (let c = 0; c < numColumns; c++) {
        const column = changedRange.getColumn() + c;
        const newValue = sheet.getRange(row, column).getValue();
        const oldValueKey = `row_${row}_column_${column}_oldValue`;
        const oldValue = scriptProperties.getProperty(oldValueKey);

        if (newValue.toString() !== oldValue) {
          scriptProperties.setProperty(oldValueKey, newValue.toString());
          updatedRows.add(row);
        }
        Logger.log(`row: ${row}, column: ${column}, newValue: ${newValue}, oldValue: ${oldValue}`);
      }
    }

    for (const row of updatedRows) {
      const idValue = sheet.getRange(row, startingColumn).getValue();
      if (idValue) {
        const jsonWithComments = buildJSON(sheetName, row);
        Logger.log(`jsonWithComments: ${jsonWithComments}`);
        sheet.getRange("B" + row).setValue(jsonWithComments);
      }
    }
  }
}



