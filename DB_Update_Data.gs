// Build JSON object from the sheet data
function buildJSON(sheet, row) {
  Logger.log(`buildJSON - sheet: ${sheet}, row: ${row}`);

  // Define the range of columns for the data
  const idColumn = "I";
  const lastColumn = sheet.getLastColumn();
  Logger.log(`buildJSON - lastColumn: ${lastColumn}`);

  // Retrieve headers, descriptions, and values from the sheet
  const ranges = sheet.getRangeList([
    `${idColumn}1:${sheet.getRange(1, lastColumn).getA1Notation()}`,
    `${idColumn}2:${sheet.getRange(2, lastColumn).getA1Notation()}`,
    `${idColumn}${row}:${sheet.getRange(row, lastColumn).getA1Notation()}`,
  ]).getRanges();
  const [headers, descriptions, values] = ranges.map(range => range.getValues()[0]);

  Logger.log(`buildJSON - headers: ${JSON.stringify(headers)}`);
  Logger.log(`buildJSON - descriptions: ${JSON.stringify(descriptions)}`);
  Logger.log(`buildJSON - values: ${values}`);

  // Create a full object from headers and values
  const fullObj = createFullObject(headers, values);

  // Convert functions to strings if they exist in the object
  for (const key in fullObj) {
    if (typeof fullObj[key] === "function") {
      fullObj[key] = fullObj[key];
    }
  }

  // If there's a showAlert function in the object, call it
  const showAlertFunction = fullObj["testFUNCTION"];
  if (showAlertFunction) {
    Logger.log(`Function Found: ${fullObj["testFUNCTION"]}`);
    showAlertFunction(fullObj['name']); // Call the function directly
    Logger.log(`Function Ran: ${fullObj["testFUNCTION"]}`);
  }
  // After creating the fullObj in buildJSON function
  Logger.log(`Full object: ${JSON.stringify(fullObj)}`);

  return fullObj;
}

// Generate UUID (universally unique identifier)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Clear all script properties
function clearScriptProperties() {
  PropertiesService.getScriptProperties().deleteAllProperties();
}

// Create a full object from headers and values
function createFullObject(headers, values) {
  const obj = {};

  // Iterate through headers and values arrays
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    const value = values[i];

    // If the header exists (is not empty)
    if (header) {
      // Check if the header contains "json"
      if (header.toLowerCase().includes("json")) {
        const key = header.replace(/json/i, "JSON");
        // Sanitize the JSON value by replacing single quotes with double quotes
        // and removing any trailing commas
        const sanitizedValue = value.replace(/([^\\])'/g, "$1\"").replace(/,\s*$/, "");
        Logger.log(`${key} - sanitizedValue: ${sanitizedValue}`);

        // Try to parse the sanitized JSON value
        try {
          obj[key] = JSON.parse(sanitizedValue);
        } catch (error) {
          Logger.log(`Unable to parse JSON value for key "${key}": ${sanitizedValue}`);
          obj[key] = null;
        }
      } 
      // Check if the header contains "function"
      else if (header.toLowerCase().includes("function")) {
        const key = header.replace(/function/i, "FUNCTION");

        // Try to convert the value into a function
        try {
          obj[key] = new Function(`return (${value});`)(); // Use the Function constructor
          Logger.log(`Created "${key}": ${value}`);
        } catch (error) {
          Logger.log(`Unable to parse function for key "${key}": ${value}`);
          obj[key] = null;
        }
      }
      // Check if the header contains "HTML"
      else if (header.toLowerCase().includes("html")) {
        const key = header.replace(/function/i, "HTML");

        // Try to convert the value into a function
        try {
          obj[key] = HtmlService.createHtmlOutput(`${value}`)(); // Use the Function constructor
          Logger.log(`Created "${key}": ${value}`);
        } catch (error) {
          Logger.log(`Unable to parse HTML for key "${key}": ${value}`);
          obj[key] = null;
        }
      }
      // Check if the header contains "array"
      else if (header.toLowerCase().includes("array")) {
        const key = header.replace(/array/i, "ARRAY");

        // Try to parse the value as an array
        try {
          obj[key] = JSON.parse(value);
        } catch (error) {
          Logger.log(`Unable to parse array for key "${key}": ${value}`);
          obj[key] = null;
        }
      } 
      // Check if the header contains "array"
      else if (header.toLowerCase().includes("array")) {
        const key = header.replace(/array/i, "ARRAY");

        // Try to parse the value as an array
        try {
          obj[key] = JSON.parse(value);
        } catch (error) {
          Logger.log(`Unable to parse array for key "${key}": ${value}`);
          obj[key] = null;
        }
      } 
      // For any other header, assign the value directly to the object
      else {
        obj[header] = value;
      }
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

function handlekeyFilterChanged(sheet) {
  //example data
  // sheet = SpreadsheetApp.getActive().getSheetByName("Users")
  const keyList = sheet.getRange("C1").getValue().split("|");
  const data = sheet.getRange("A3:B" + sheet.getLastRow()).getValues();

  // Batch operation to optimize processing time
  const reducedObjects = data.map(row => {
    if (row[0]) { // Check if the H column has a value
      const fullObj = JSON.parse(row[1]);
      const reducedObj = createReducedObject(fullObj, keyList);
      return [JSON.stringify(reducedObj, null, 5)];
    } else {
      return [""];
    }
  });

  sheet.getRange(3, 3, reducedObjects.length, 1).setValues(reducedObjects);
}


function handleKeyDataChanged(sheet, changedRange) {
  const startingColumn = 9;
  const dataRow = 3;
  const userEmail = Session.getActiveUser().getEmail();

  if (sheet && changedRange.getColumn() >= startingColumn) {
    const updatedRows = getUpdatedRows(sheet, changedRange, dataRow);

    for (const row of updatedRows) {
      processUpdatedRow(sheet, row, userEmail, startingColumn);
    }
  }
}

function getUpdatedRows(sheet, changedRange, dataRow) {
  const numRows = changedRange.getNumRows();
  const numColumns = changedRange.getNumColumns();
  const updatedRows = new Set();

  for (let r = 0; r < numRows; r++) {
    const row = changedRange.getRow() + r;
    if (row >= dataRow) {
      for (let c = 0; c < numColumns; c++) {
        updateRowIfNeeded(sheet, row, updatedRows);
      }
    }
  }

  return updatedRows;
}

function updateRowIfNeeded(sheet, row, updatedRows) {
  const hash = sheet.getRange("A" + row).getValue();
  const oldhash = sheet.getRange("D" + row).getValue();
  const status = sheet.getRange("J" + row).getValue();

  if (!oldhash && hash && status !== "Deleted") {
    sheet.getRange("I" + row).setValue(generateUUID());
    updatedRows.add(row);
    Logger.log(`New row: ${row}, Hash: ${hash}`);
  } else if (hash !== oldhash) {
    updatedRows.add(row);
    Logger.log(`Updated row: ${row}, newHash: ${hash}, oldHash: ${oldhash}`);
  } else if (status === "Deleted") {
    Logger.log(`Deleted row ${row}, clearing columns D through G`);
    sheet.getRange(row, 2, 1, 8).clearContent();
  }
}

function processUpdatedRow(sheet, row, userEmail, startingColumn) {
  const idValue = sheet.getRange(row, startingColumn).getValue();
  const hash = sheet.getRange("A" + row).getValue();
  const oldhash = sheet.getRange("D" + row).getValue();
  const status = sheet.getRange("J" + row).getValue();

  Logger.log(`Processing updated row: ${row}`);

  if (status !== "Deleted") {
    if (hash) {
      const fullObj = buildJSON(sheet, row);
      const keyList = sheet.getRange("C1").getValue().split("|");
      const reducedObj = createReducedObject(fullObj, keyList);

      Logger.log(`fullObj: ${JSON.stringify(fullObj)}`);
      Logger.log(`reducedObj: ${JSON.stringify(reducedObj)}`);
      Logger.log(`Updated row ${row}, newHash: ${hash}, oldHash: ${oldhash}`);

      const now = new Date();
      let createdDate = sheet.getRange(row, 7).getValue();
      if (!sheet.getRange(row, 7).getValue()) {
        createdDate = now;
      }
      let createdBy = sheet.getRange(row, 8).getValue();
      if (!sheet.getRange(row, 8).getValue()) {
        createdBy = userEmail;
      }

      // Set values in columns B, C, D, E, F, G, and H at once
      sheet.getRange(row, 2, 1, 7).setValues([
        [
          JSON.stringify(fullObj, null, 2),
          JSON.stringify(reducedObj, null, 5),
          hash,
          now,
          userEmail,
          createdDate,
          createdBy,
        ],
      ]);
    } else {
      Logger.log(`No idValue for row ${row}, clearing columns D through G`);
      // Clear out columns D through G if there's no data
      sheet.getRange(row, 2, 1, 8).clearContent();
    }
  } else {
    Logger.log(`Deleted row ${row}, clearing columns D through G`);
    // Clear out columns D through G if there's no data
    sheet.getRange(row, 2, 1, 8).clearContent();
  }
}


function getJSONArray(rawIds, refSheetName) {
  // rawIds = '["e0e8ddb8-46e8-4fb1-a69a-3ef10289f8e3","1881a56b-2657-43f6-89d2-4e5cc2f9e38a"]'
  // refSheetName = "AI Users"

  // Get the active spreadsheet and reference sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const refSheet = sheet.getSheetByName(refSheetName);
  const sheetName = sheet.getSheetName();

  Logger.log(`Active spreadsheet: ${sheetName}, Reference spreadsheet: ${refSheetName}`);

  // Parse the input rawIds as JSON
  Logger.log(`${refSheetName} IDs from input cell: ${rawIds}`);
  const idArray = JSON.parse(rawIds);

  // Get the ranges for user IDs and user information
  const ids = refSheet.getRange("I3:I").getValues();
  const refInfo = refSheet.getRange("C3:C").getValues();

  Logger.log(`${refSheetName} IDs range: ${ids}`);
  Logger.log(`${refSheetName} information range: ${refInfo}`);

  // Initialize the result array
  const result = [];

  // Iterate through the IDs from the input cell
  idArray.forEach(refId => {
    Logger.log(`Processing ${refSheetName} ID: ${refId}`);

    // Search for the matching user ID in the ids range
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === refId) {
        // Add the corresponding information JSON string to the result array
        Logger.log(`Match found for ${refSheetName} ID ${refId} at index ${i}`);
        result.push(refInfo[i][0]);

        // Exit the loop since the matching user ID was found
        break;
      }
    }
  });

  // Join the result array with a comma and space separator, and add surrounding square brackets
  const output = '[' + result.join(', ') + ']';
  Logger.log(`Output JSON array: ${output}`);
  return output;
}

function parseJsonWithComments(jsonString) {
  // Split input string by line
  const lines = jsonString.split('\n');

  // Remove comments from each line
  const sanitizedLines = lines.map((line) => {
    const commentIndex = line.indexOf('//');
    return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  });

  // Join sanitized lines and parse as JSON
  const sanitizedJsonString = sanitizedLines.join('');
  return JSON.parse(sanitizedJsonString);
}

function createHash(input) {
  let hash = 0;
  if (input.length === 0) return hash;

  // Iterate through input string and calculate hash
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash;
}


