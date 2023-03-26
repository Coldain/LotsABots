function buildJSON(sheet, row) {
  //example data
  // sheet = SpreadsheetApp.getActive().getSheetByName("Users"), row=4
  Logger.log(`buildJSON - sheet: ${sheet}, row: ${row}`);
  const idColumn = "H";
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

  // Read the list of keys from C1
  const fullObj = createFullObject(headers, values);

  for (const key in fullObj) {
    if (typeof fullObj[key] === "function") {
      fullObj[key] = fullObj[key].toString(); // Convert functions to strings
    }
  }

  // New code: Call the showAlert function stored in cell A1
  const showAlertFunction = fullObj["testFunction"];
  if (showAlertFunction) {
    const showAlert = eval(`(${showAlertFunction})`);
    showAlert();
  }


  return fullObj;

  // let jsonWithComments = "{\n";

  // for (const [index, header] of headers.entries()) {
  //   const key = header.toLowerCase();
  //   const value = obj[key];
  //   const description = descriptions[index];

  //   jsonWithComments += `  ${header}: ${
  //     typeof value === "string" ? `"${value.replace(/"/g, '\\"')}"` : value
  //   }, // ${description}\n`;
  // }

  // jsonWithComments += "}";


  // jsonWithComments += "}";

  // Logger.log(`buildJSON - jsonWithComments: ${jsonWithComments}`);
  // return jsonWithComments;
}


function createFullObject(headers, values) {
  const obj = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    const value = values[i];

    if (header.toLowerCase().includes("json")) {
      const key = header.replace(/json/i, "JSON");
      Logger.log(`${key} - value: ${value}`);
      const sanitizedValue = value.replace(/([^\\])'/g, "$1\"").replace(/,\s*$/, ""); // Remove trailing comma
      Logger.log(`${key} - sanitizedValue: ${sanitizedValue}`);
      try {
        obj[header.replace(/json/i, "JSON")] = parseJsonWithComments(sanitizedValue);
      } catch (error) {
        Logger.log(`Unable to parse JSON value for key "${key}": ${sanitizedValue}`);
        obj[key] = null;
      }
    } else if (header.toLowerCase().includes("function")) {
      const key = header.replace(/function/i, "Function");
      try {
        obj[key] = eval(`(${value})`); // Wrap the value in parentheses to convert it into an anonymous function
      } catch (error) {
        Logger.log(`Unable to parse function for key "${key}": ${value}`);
        obj[key] = null;
      }
    } else {
      obj[header] = value;
    }
  }
  return obj;
}

function createReducedObject(fullObj, keyList) {
  const reducedObj = {};

  for (const key of keyList) {
    const lowerCaseKey = key.toLowerCase();
    if (lowerCaseKey in fullObj) {
      reducedObj[lowerCaseKey] = fullObj[lowerCaseKey];
    }
  }

  return reducedObj;
}

function onEdit(e) {
  Logger.log(e);
  const sheetName = e.source.getActiveSheet().getName();
  Logger.log(`sheetName: ${sheetName}`);
  const sheet = e.source.getSheetByName(sheetName);
  Logger.log(`sheet: ${sheet}`);
  const changedRange = e.range;
  Logger.log(`changedRange: ${changedRange}`);
  if (changedRange.getRow() === 1 && changedRange.getColumn() === 3) {
    keyFilterChanged(sheet);
  } else {
    dataChanged(sheet, changedRange,e);
  }
}

function keyFilterChanged(sheet) {
  //example data
  // sheet = SpreadsheetApp.getActive().getSheetByName("Users")
  const keyList = sheet.getRange("C1").getValue().split("|");
  const data = sheet.getRange("B3:H" + sheet.getLastRow()).getValues();

  const reducedObjects = data.map(row => {
    if (row[6]) { // Check if the H column has a value
      const fullObj = JSON.parse(row[0]);
      const reducedObj = createReducedObject(fullObj, keyList);
      return [JSON.stringify(reducedObj, null, 5)];
    } else {
      return [""];
    }
  });

  sheet.getRange(3, 3, reducedObjects.length, 1).setValues(reducedObjects);
}



function dataChanged(sheet,changedRange){
  //example data
  // sheet = SpreadsheetApp.getActive().getSheetByName("Users")
  // changedRange = sheet.getRange("I4")
  const startingColumn = 7; // Where the actual data ends
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
      if (row >= dataRow) {
        for (let c = 0; c < numColumns; c++) {
          const column = changedRange.getColumn() + c;
          const newValue = sheet.getRange(row, column).getValue();
          const oldValueKey = `row_${row}_column_${column}_oldValue`;
          const oldValue = scriptProperties.getProperty(oldValueKey);

          if (newValue.toString() !== "banana") { //oldValue
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
        const fullObj = buildJSON(sheet, row);
        const keyList = ["id", "name", "icon", "status"]; // Update this with your actual key list
        const reducedObj = createReducedObject(fullObj, keyList);

        Logger.log(`fullObj: ${JSON.stringify(fullObj)}`);
        Logger.log(`reducedObj: ${JSON.stringify(reducedObj)}`);

        const now = new Date();
        const createdDate = sheet.getRange(row, 6).getValue() || now;
        const createdBy = sheet.getRange(row, 7).getValue() || userEmail;

        if (idValue) {
          // Set values in columns B, C, D, E, F, and G at once
          sheet.getRange(row, 2, 1, 6).setValues([
            [JSON.stringify(fullObj,null,2), JSON.stringify(reducedObj, null, 5), now, userEmail, createdDate, createdBy],
          ]);
        } else {
          Logger.log(`No idValue for row ${row}, clearing columns D through G`);
          // Clear out columns D through G if there's no data
          sheet.getRange(row, 4, 1, 4).clearContent();

        }
      }
    }
  }
}

function parseJsonWithComments(jsonString) {
  const lines = jsonString.split('\n');
  const sanitizedLines = lines.map((line) => {
    const commentIndex = line.indexOf('//');
    return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  });
  const sanitizedJsonString = sanitizedLines.join('');
  return JSON.parse(sanitizedJsonString);
}



