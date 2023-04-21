// Build JSON object from the sheet data
function buildJSON(sheet, row) {
  // sheet = SpreadsheetApp.getActive().getSheetByName("AI Agents"), row = 3
  Logger.log(`buildJSON - sheet: ${sheet.getSheetName()}, row: ${row}`);

  // Define the range of columns for the data
  const lastColumn = sheet.getLastColumn();
  Logger.log(`buildJSON - lastColumn: ${lastColumn}`);

  // Retrieve headers, descriptions, and values from the sheet
  const ranges = sheet.getRangeList([
    `${references.uuidColumn}${references.headersRow}:${sheet.getRange(references.headersRow, lastColumn).getA1Notation()}`,
    `${references.uuidColumn}${references.descriptionRow}:${sheet.getRange(references.descriptionRow, lastColumn).getA1Notation()}`,
    `${references.uuidColumn}${row}:${sheet.getRange(row, lastColumn).getA1Notation()}`,
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
      fullObj[key] = fullObj[key].toString();
    }
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
    const header = headers[i];
    const lowerHeader = header.toLowerCase();
    const value = values[i];

    // If the header exists (is not empty)
    if (header) {
      if (lowerHeader.includes("json")) {
        Object.assign(obj, processJSON(header, value));
      } else if (lowerHeader.includes("function")) {
        Object.assign(obj, processFunction(header, value));
      } else if (lowerHeader.includes("html")) {
        Object.assign(obj, processHTML(header, value));
      } else if (lowerHeader.includes("array")) {
        Object.assign(obj, processArray(header, value));
      } else {
        obj[header] = value;
      }
    }
  }
  return obj;
}


function createReducedObject(fullObj, keyList) {

  if (keyList[0]){ // Check if keylist has values, if not return full object
    const reducedObj = {};

    // Create a mapping of lowercased keys to their original keys in the fullObj
    const keyMapping = {};
    for (const key in fullObj) {
      keyMapping[key.toLowerCase()] = key;
    }

    for (const key of keyList) {
      const lowerCaseKey = key.toLowerCase();
      if (lowerCaseKey in keyMapping) {
        // Use the original casing of the key found in the fullObj
        const originalKey = keyMapping[lowerCaseKey];
        reducedObj[originalKey] = fullObj[originalKey];
      }
    }
    return reducedObj;
  } else{
    return fullObj;
  }

}



function handlekeyFilterChanged(sheet) {
  //example data
  const keyList = sheet.getRange(references.keyList).getValue().split("|");
  const data = sheet.getRange(references.jsonHashRange + sheet.getLastRow()).getValues();

  // Batch operation to optimize processing time
  const reducedObjects = data.map(row => {
    if (row[0]) { // Check if the Hash column has a value
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
  if (typeof sheet === 'string') {
    Logger.log(sheet)
    Logger.log({changedRange})
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet);
    const userEmail = sheet.getRange(`${references.modifiedByColumn}${changedRange}`).getValue()
    processUpdatedRow(sheet, changedRange, userEmail, references.uuidColumnNum);
  }
  else{
    const userEmail = Session.getActiveUser().getEmail();
    if (sheet && changedRange.getColumn() >= references.uuidColumnNum) {
      const updatedRows = getUpdatedRows(sheet, changedRange, references.valuesStartRow);
      for (const row of updatedRows) {
        processUpdatedRow(sheet, row, userEmail, references.uuidColumnNum);
      }
    }
  }
}

function getUpdatedRows(sheet, changedRange, dataRow) {
  const numRows = changedRange.getNumRows();
  const updatedRows = new Set();

  for (let r = 0; r < numRows; r++) {
    const row = changedRange.getRow() + r;
    if (row >= dataRow) {
      updateRowIfNeeded(sheet, row, updatedRows);
    }
  }

  return updatedRows;
}


function updateRowIfNeeded(sheet, row, updatedRows) {
  const hash = sheet.getRange(references.hashNewColumn + row).getValue();
  const oldhash = sheet.getRange(references.hashOldColumn + row).getValue();
  const status = sheet.getRange(references.statusColumn + row).getValue();

  if (!oldhash && hash && status !== "Deleted") {
    sheet.getRange(references.uuidColumn + row).setValue(generateUUID());
    updatedRows.add(row);
    Logger.log(`New row: ${row}, Hash: ${hash}`);
  } else if (hash !== oldhash) {
    updatedRows.add(row);
    Logger.log(`Updated row: ${row}, newHash: ${hash}, oldHash: ${oldhash}`);
  } else if (status === "Deleted") {
    Logger.log(`Deleted row ${row}, clearing columns ${references.jsonDenseColumn} through ${references.uuidColumn}`);
    sheet.getRange(row, references.jsonDenseColumnNum, 1, (references.uuidColumnNum - references.jsonDenseColumnNum + 1)).clearContent();
  }
}

function processUpdatedRow(sheet, row, userEmail, startingColumn) {
  const idValue = sheet.getRange(row, startingColumn).getValue();
  const hash = sheet.getRange(references.hashNewColumn + row).getValue();
  const oldhash = sheet.getRange(references.hashOldColumn + row).getValue();
  const status = sheet.getRange(references.statusColumn + row).getValue();

  Logger.log(`Processing updated row: ${row}`);

  if (status !== "Deleted") {
    if (hash) {
      const fullObj = buildJSON(sheet, row);
      const keyList = sheet.getRange(references.keyList).getValue().split("|");
      const reducedObj = createReducedObject(fullObj, keyList);

      Logger.log(`fullObj: ${JSON.stringify(fullObj)}`);
      Logger.log(`reducedObj: ${JSON.stringify(reducedObj)}`);
      Logger.log(`Updated row ${row}, newHash: ${hash}, oldHash: ${oldhash}`);

      const now = new Date();
      let createdDate = sheet.getRange(row, references.createdColumnNum).getValue();
      if (!sheet.getRange(row, references.createdColumnNum).getValue()) {
        createdDate = now;
      }
      let createdBy = sheet.getRange(row, references.createdByColumnNum).getValue();
      if (!sheet.getRange(row, references.createdByColumnNum).getValue()) {
        createdBy = userEmail;
      }

      // Set values in columns B, C, D, E, F, G, and H at once
      sheet.getRange(row, references.jsonDenseColumnNum, 1, 7).setValues([
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
      // try{
      //   // If there's a function in the object, call it
      //   executeLoadedFunction(fullObj, "FUNCTION");
      //   // If there's a HTML in the object, render it
      //   renderLoadedHTML(fullObj, "HTML")
      // }
      // catch{
        
      // }
    } else {
      Logger.log(`No idValue for row ${row}, clearing columns ${references.jsonDenseColumn} through ${references.uuidColumn}`);
      // Clear out columns D through G if there's no data
      sheet.getRange(row, references.jsonDenseColumnNum, 1, (references.uuidColumnNum - references.jsonDenseColumnNum + 1)).clearContent();
    }
  } else {
    Logger.log(`Deleted row ${row}, clearing columns ${references.jsonDenseColumn} through ${references.uuidColumn}`);
    // Clear out columns D through G if there's no data
    sheet.getRange(row, references.jsonDenseColumnNum, 1, (references.uuidColumnNum - references.jsonDenseColumnNum + 1)).clearContent();
  }
}

function getJSONArray(rawIds, refSheetName) {
  // rawIds = '["e0e8ddb8-46e8-4fb1-a69a-3ef10289f8e3","1881a56b-2657-43f6-89d2-4e5cc2f9e38a"]'
  // refSheetName = "AI Users"
  // const sheetName = "AI Conversations"

  // Get the active spreadsheet and reference sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const refSheet = sheet.getSheetByName(refSheetName);
  const sheetName = sheet.getSheetName();

  Logger.log(`Active spreadsheet: ${sheetName}, Reference spreadsheet: ${refSheetName}`);

  // Parse the input rawIds as JSON
  Logger.log(`${refSheetName} IDs from input cell: ${rawIds}`);
  const idArray = JSON.parse(rawIds);

  // Get the ranges for IDs and sparse json information
  const ids = refSheet.getRange(references.uuidRange).getValues();
  const refInfo = refSheet.getRange(references.jsonSparseRange).getValues();

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

// Process JSON value
function processJSON(header, value) {
  const key = header.replace(/json/i, "JSON");
  // Logger.log({value})
  const sanitizedValue = value.replace(/,\s*$/, ""); //.replace(/([^\\])'/g, "$1\"")
  // Logger.log({sanitizedValue})

  try {
    return { [key]: JSON.parse(sanitizedValue) };
  } catch (error) {
    Logger.log(`Unable to parse JSON value for key "${key}": ${sanitizedValue}`);
    return { [key]: null };
  }
}

// Process FUNCTION value
function processFunction(header, value) {
  const key = header.replace(/function/i, "FUNCTION");

  try {
    return { [key]: new Function(`return (${value});`)() };
  } catch (error) {
    Logger.log(`Unable to parse function for key "${key}": ${value}`);
    return { [key]: null };
  }
}

// Process ARRAY value
function processArray(header, value) {
  const key = header.replace(/array/i, "ARRAY");

  try {
    return { [key]: JSON.parse(value) };
  } catch (error) {
    Logger.log(`Unable to parse array for key "${key}": ${value}`);
    return { [key]: null };
  }
}

// Process HTML value
function processHTML(header, value) {
  const obj = {};
  obj[header] = value.toString();
  return obj;
}

function renderLoadedHTML(loadedObj, htmlKey) {
  if (typeof loadedObj === "string") {
    try {
      loadedObj = JSON.parse(loadedObj);
    } catch (error) {
      Logger.log(`Failed to parse the input as JSON: ${loadedObj}`);
      return;
    }
  }

  const htmlString = loadedObj[htmlKey];

  if (htmlString) {
    const htmlOutput = HtmlService.createHtmlOutput(htmlString);
    const name = loadedObj["name"] || "Rendered HTML";
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, name);
  } else {
    Logger.log(`HTML with key "${htmlKey}" not found in the loaded object.`);
  }
}

function executeLoadedFunction(loadedObj, funcKey, params) {
  if (typeof loadedObj === "string") {
    try {
      loadedObj = JSON.parse(loadedObj);
    } catch (error) {
      Logger.log(`Failed to parse the input as JSON: ${loadedObj}`);
      return;
    }
  }

  const funcString = loadedObj[funcKey];

  if (funcString) {
    const func = new Function(`return (${funcString});`)();
    Logger.log(`Function Found: ${func}`);

    const paramsKey = "PARAMETERS";
    const objectParamsRaw = loadedObj[paramsKey];
    const objectParams = Array.isArray(objectParamsRaw) ? objectParamsRaw : [objectParamsRaw];
    const passedParams = params || [];
    const allParams = [...objectParams, ...passedParams];

    func(...allParams);
    Logger.log(`Function Ran: ${func}`);
  } else {
    Logger.log(`Function with key "${funcKey}" not found in the loaded object.`);
  }
}

function getSheetName() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
}


// TODO add change log, capture system changes and user changes
function logChange(userEmail, action, details) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DB Change Log");
  const timestamp = new Date();
  
  // Add a new row to the log sheet with the timestamp, user email, action, and details
  logSheet.appendRow([timestamp, userEmail, action, details]);
}

function showJsonInputDialog() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('DB_Update_Data_UI.html')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Input JSON Data');
}

function processJsonData(jsonData) {
  try {
    const dataObj = JSON.parse(jsonData);
    // Process the dataObj and add it to your sheet as needed
  } catch (error) {
    // Handle JSON parsing error
  }
}
