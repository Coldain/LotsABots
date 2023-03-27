// Build JSON object from the sheet data
function buildJSON(sheet, row) {
  // Example data:
  // sheet = SpreadsheetApp.getActive().getSheetByName("Users"), row=4
  Logger.log(`buildJSON - sheet: ${sheet}, row: ${row}`);

  // Define the range of columns for the data
  const idColumn = "I";
  const lastColumn = sheet.getLastColumn();
  Logger.log(`buildJSON - lastColumn: ${lastColumn}`);

  // Retrieve headers, descriptions, and values from the sheet
  const [headers, descriptions, values] = sheet.getRangeList([
    `${idColumn}1:${sheet.getRange(1, lastColumn).getA1Notation()}`,
    `${idColumn}2:${sheet.getRange(2, lastColumn).getA1Notation()}`,
    `${idColumn}${row}:${sheet.getRange(row, lastColumn).getA1Notation()}`,
  ]).getRanges().map(range => range.getValues()[0]);

  Logger.log(`buildJSON - headers: ${JSON.stringify(headers)}`);
  Logger.log(`buildJSON - descriptions: ${JSON.stringify(descriptions)}`);
  Logger.log(`buildJSON - values: ${JSON.stringify(values)}`);

  // Create a full object from headers and values
  const fullObj = createFullObject(headers, values);

  // Convert functions to strings if they exist in the object
  for (const key in fullObj) {
    if (typeof fullObj[key] === "function") {
      fullObj[key] = fullObj[key];
    }
  }

  // If there's a showAlert function in the object, call it
  const showAlertFunction = fullObj["testFunction"];
  if (showAlertFunction) {
    const showAlert = eval(`(${showAlertFunction})`);
    showAlert();
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
        Logger.log(`${key} - value: ${value}`);

        // Sanitize the JSON value by replacing single quotes with double quotes
        // and removing any trailing commas
        const sanitizedValue = value.replace(/([^\\])'/g, "$1\"").replace(/,\s*$/, "");
        Logger.log(`${key} - sanitizedValue: ${sanitizedValue}`);

        // Try to parse the sanitized JSON value
        try {
          obj[key] = parseJsonWithComments(sanitizedValue);
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
          obj[key] = eval(`(${value})`); // Wrap the value in parentheses to convert it into an anonymous function
        } catch (error) {
          Logger.log(`Unable to parse function for key "${key}": ${value}`);
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
  // Example data
  // sheet = SpreadsheetApp.getActive().getSheetByName("Users")
  // changedRange = sheet.getRange("J3")
  const startingColumn = 9; // I Where the actual data ends
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
      const hash = sheet.getRange("A" + row).getValue();
      const oldhash = sheet.getRange("D" + row).getValue();
      Logger.log(`Row: ${row}, hash: ${hash}, oldhash: ${oldhash}`);
      Logger.log(`Checking row: ${row}`);
      if (row >= dataRow) {
        for (let c = 0; c < numColumns; c++) {
          const column = changedRange.getColumn() + c;

          if (hash !== oldhash) {
            updatedRows.add(row);
          }
          Logger.log(
            `row: ${row}, column: ${column}, newHash: ${hash}, oldHash: ${oldhash}`
          );
        }
      } else {
        Logger.log(`Skipping row ${row} because it's not greater than dataRow`);
      }
    }

    for (const row of updatedRows) {
      Logger.log(`Processing updated row: ${row}`);
      const idValue = sheet.getRange(row, startingColumn).getValue();
      const hash = sheet.getRange("A" + row).getValue();
      const oldhash = sheet.getRange("D" + row).getValue();
      Logger.log(`idValue: ${idValue}`);
      if (hash) {
        const fullObj = buildJSON(sheet, row);
        const keyList = sheet.getRange("C1").getValue().split("|");
        const reducedObj = createReducedObject(fullObj, keyList);

        Logger.log(`fullObj: ${JSON.stringify(fullObj)}`);
        Logger.log(`reducedObj: ${JSON.stringify(reducedObj)}`);
        Logger.log(
          `Updated row ${row}, newHash: ${hash}, oldHash: ${oldhash}`
        );

        const now = new Date();
        let createdDate = sheet.getRange(row, 7).getValue();
        if (!sheet.getRange(row, 7).getValue()) {
          createdDate = now;
        }
        let createdBy = sheet.getRange(row, 8).getValue();
        if (!sheet.getRange(row, 8).getValue()) {
          createdBy = userEmail;
        }

        if (hash) {
          if (idValue) {
            // Set values in columns B, C, D, E, F, G and H at once
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
            // Set create a UUUI and include it in the update.
            sheet.getRange(row, 2, 1, 8).setValues([
              [JSON.stringify(fullObj,null,2), JSON.stringify(reducedObj, null, 5),hash, now, userEmail, createdDate, createdBy,generateUUID()],
            ]);
          }
        } else {
          Logger.log(`No idValue for row ${row}, clearing columns D through G`);
          // Clear out columns D through G if there's no data
          sheet.getRange(row, 4, 1, 6).clearContent();

        }
      }
    }
  }
}

function getJSONArray(userIdsCell, idRange, infoRange) {
  // userIdsCell= "Q3"
  // idRange = "AI_Conversations!I$3:I"
  // infoRange = "AI_Conversations!C$3:C"
  // Get the active spreadsheet 
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log(`Active spreadsheet: ${sheet.getName()}`);
  Logger.log(`userIdsCell: ${userIdsCell}\nidRange: ${idRange}\ninfoRange: ${infoRange}`);

  // Read the user IDs from the specified cell and split them into an array
  const idArray = JSON.parse(sheet.getRange(userIdsCell).getValue());
  Logger.log(`User IDs from input cell: ${idArray}`);

  // Get the ranges for user IDs and user information
  const ids = sheet.getRange(idRange).getValues();
  const userInfo = sheet.getRange(infoRange).getValues();
  Logger.log(`User IDs range: ${JSON.stringify(ids)}`);
  Logger.log(`User IDs range: ${ids}`);
  Logger.log(`User information range: ${JSON.stringify(userInfo)}`);
  Logger.log(`User information range: ${userInfo}`);

  // Initialize the result array
  const result = [];

  // Iterate through the user IDs from the input cell
  idArray.forEach(userId => {
    Logger.log(`Processing user ID: ${userId}`);
    // Search for the matching user ID in the ids range
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === userId) {
        // Add the corresponding user information JSON string to the result array
        Logger.log(`Match found for user ID ${userId} at index ${i}`);
        result.push(userInfo[i][0]);
        
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
  const lines = jsonString.split('\n');
  const sanitizedLines = lines.map((line) => {
    const commentIndex = line.indexOf('//');
    return commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  });
  const sanitizedJsonString = sanitizedLines.join('');
  return JSON.parse(sanitizedJsonString);
}


function createHash(input) {
  var hash = 0;
  if (input.length === 0) return hash;
  for (var i = 0; i < input.length; i++) {
    var char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

