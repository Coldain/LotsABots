function buildJSON(sheetName, row) {
  Logger.log(`buildJSON - sheetName: ${sheetName}, row: ${row}`);
  const idColumn = "H";
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastColumn = sheet.getLastColumn();
  Logger.log(`buildJSON - lastColumn: ${lastColumn}`);
  
  const [headers, descriptions, values] = sheet.getRangeList([
    `${idColumn}1:${sheet.getRange(1, lastColumn).getA1Notation()}`,
    `${idColumn}2:${sheet.getRange(2, lastColumn).getA1Notation()}`,
    `${idColumn}${row}:${sheet.getRange(row, lastColumn).getA1Notation()}`,
  ]).getRanges().map(range => range.getValues()[0]);
  
  Logger.log(`buildJSON - headers: ${JSON.stringify(headers)}`);
  Logger.log(`buildJSON - descriptions: ${JSON.stringify(descriptions)}`);
  Logger.log(`buildJSON - values: ${JSON.stringify(values)}`);

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

  Logger.log(`buildJSON - jsonWithComments: ${jsonWithComments}`);
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
  const startingColumn = 8; // Where the actual data ends
  const dataRow = 3; // Where the actual data starts
  Logger.log(`startingColumn: ${startingColumn}`);
  const userEmail = Session.getActiveUser().getEmail(); // Get the user email

  if (sheet && changedRange.getColumn() >= startingColumn) {
    const scriptProperties = PropertiesService.getScriptProperties();
    const numRows = changedRange.getNumRows();
    Logger.log(`numRows: ${numRows}`);
    const numColumns = changedRange.getNumColumns();
    Logger.log(`numColumns: ${numColumns}`);

    const updatedRows = new Set();

    for (let r = 0; r < numRows; r++) {
      const row = changedRange.getRow() + r;
      Logger.log(`Checking row: ${row}`);
      if (row > dataRow) {
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
      } else {
        Logger.log(`Skipping row ${row} because it's not greater than dataRow`);
      }
    }

    for (const row of updatedRows) {
      Logger.log(`Processing updated row: ${row}`);
      const idValue = sheet.getRange(row, startingColumn).getValue();
      Logger.log(`idValue: ${idValue}`);
      if (idValue) {
        const jsonWithComments = buildJSON(sheetName, row);
        Logger.log(`jsonWithComments: ${jsonWithComments}`);
        sheet.getRange("B" + row).setValue(jsonWithComments);

        // Update modified date and modified by
        sheet.getRange(row, 4).setValue(new Date());
        sheet.getRange(row, 5).setValue(userEmail);

        // Update created by date and created by if they are blank
        if (!sheet.getRange(row, 6).getValue()) {
          sheet.getRange(row, 6).setValue(new Date());
        }
        if (!sheet.getRange(row, 7).getValue()) {
          sheet.getRange(row, 7).setValue(userEmail);
        }
      } else {
        Logger.log(`No idValue for row ${row}, clearing columns D through G`);
        // Clear out columns D through G if there's no data
        sheet.getRange(row, 4, 1, 4).clearContent();
      }
    }
  }
}




