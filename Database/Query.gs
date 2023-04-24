// This is google app script code attached to a google sheet
// This code is used to load HTML from a google sheet into the template
// This code is used to load functions from a google sheet into the template
const references = {
  userSheetName: "UC Users",
  personaSheetName: "AI Personas",
  htmlSheetName: "WB HTML",
  validationLoopCount: 1,
  uuidColumn: "I",
  uuidColumnNum: 9,
  uuidRange: "I3:I", //`${references.uuidColumn}3:${references.uuidColumn}`
  headerRange: "1:1",
  headersRow: 1,
  descriptionRow: 2,
  valuesStartRow: 3,
  valuesStartColumn: "K",
  keyList: "C2",
  jsonHashRange: "A3:B",
  hashNewColumn: "A",
  hashOldColumn: "D",
  jsonSparseColumnNum: 3,
  jsonSparseColumn: "C",
  jsonSparseRange: "C3:C",
  jsonDenseColumnNum: 2,
  jsonDenseColumn: "B",
  jsonDenseRange: "B3:B",
  statusColumn: "J",
  createdColumn: "G",
  createdColumnNum: 7,
  createdByColumn: "H",
  createdByColumnNum: 8,
  modifiedByColumn: "F",
}

function getReferences()
{
  return references
}

function letterToColumn(letter) {
  const A = 'A'.charCodeAt(0);
  return letter.charCodeAt(0) - A + 1;
}


function test2(){
  const htmlOutput = HtmlService.createHtmlOutput(`<!DOCTYPE html>
<html>
<head>
<style>
    .hover-text {
        font-size: 50px;
        color: blue;
    }
    .hover-text:hover {
        color: red;
    }
</style>
</head>
<body>

<h1>Hover over me!</h1>

<p class="hover-text">cool</p>
<p class="hover-text">awesome</p>
<p class="hover-text">sweet</p>

</body>
</html>`)
  SpreadsheetApp.getUi().showModalDialog(htmlOutput,'Developer GPT');
}

function loadHTML(uuid){
  // uuid = "3493a4be-8838-4e4e-85ed-ca2fb3f02bc9"
  Logger.log(`loadHTML - ${uuid}`)
  // Get the sheet with the HTML
  const sheet = SpreadsheetApp.getActive().getSheetByName("WB HTML");
  // Get list of all the uuids in the sheet from column I (uuid) and find the row with the matching uuid starting at row 3
  const row = sheet.getRange(references.uuidRange).getValues().findIndex((row) => row[0] === uuid) + 3;
  // Get the HTML from the sheet and load it into the template
  const columns = getColumnsByHeaders(sheet, 'HTML', 'name');
  Logger.log(`HTML Cell: ${columns.HTML}${row}`); // {Column1: 'A', Column2: 'B', Column3: 'C'}
  Logger.log(`Name Cell: ${columns.name}${row}`); // {Column1: 'A', Column2: 'B', Column3: 'C'}

  // The HTML is in the column with the header "HTML" and the row with the matching uuid
  const html = sheet.getRange(`${columns.HTML}${row}`).getValue();
  const name = sheet.getRange(`${columns.name}${row}`).getValue();
  Logger.log(`Retrieved ${name} as ${html}`)
  // return the HTML output to be rendered or used later
  return [html, name]; 
}

function loadFUNCTION(uuid, ...args) {
  // uuid = "af035686-09fb-414e-b698-7e8f3979a791"
  // Get the sheet with the functions
  const sheet = SpreadsheetApp.getActive().getSheetByName("WB FUNCTIONS");
  // Get list of all the uuids in the sheet from column I (uuid) and find the row with the matching uuid
  const row = sheet.getRange(references.uuidRange).getValues().findIndex((row) => row[0] === uuid) + 3;
  // Find the columns with the parameters and function
  const func = sheet.getRange(getColumnsByHeaders(sheet, "FUNCTION")["FUNCTION"] + row).getValue();

  let loadedFunction
  // Try to convert the value into a function
  try {
    loadedFunction = new Function(`return (${func});`)(); // Use the Function constructor
    Logger.log(`loaded: ${func}`);
  } catch (error) {
    Logger.log(`Unable to parse function for: ${func}`);
    loadedFunction = null;
  }
  if (loadedFunction) {
    Logger.log(`Function Found: ${loadedFunction}`);
    return loadedFunction(); // Call the function directly
  }
}

function renderHTMLUUID(uuid)
{
  // uuid = "3493a4be-8838-4e4e-85ed-ca2fb3f02bc9"
  const html = loadHTML(uuid)
  const htmlOutput = HtmlService.createHtmlOutput(html[0])
    .setWidth(1600)
    .setHeight(900);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput,html[1])
}

// lets create a test function to load in and run a specific uuid
function testLoadFunction(){
  // get the uuid from the sheet
  const uuid = "3493a4be-8838-4e4e-85ed-ca2fb3f02bc9";
  // load the function
  const func = loadFUNCTION(uuid);
  // run the function
  const output = func();
  // return the output
  return output;
}


function testGettingHeaders()
{
  // Example usage for getMatchingObjects
  // const sheetNames = [references.userSheetName, references.personaSheetName];
  // const headers = ["uuid", "email"];
  // const searchValues = ["ethan.jensen@ringcentral.com", "e0e8ddb8-46e8-4fb1-a69a-3ef10289f8e3", "b094d5f6-e864-46f8-a55d-3435dbdad018"];
  // const matchingObjects = getMatchingObjects(sheetNames, headers, searchValues);
  // Logger.log(matchingObjects);

  // const matchingObjects = getMatchingObjects(references.personaSheetName);
  const matchingObjects =  getMatchingObjects(["WB HTML","WB FUNCTIONS"])
  Logger.log(matchingObjects)
  // sheetNames= "WB HTML"
  // searchValues = ["0d27c092-306a-4125-9c59-481ff7068c1b","de35b340-660e-4327-b48d-365eaacd6438","57f24295-66b0-489a-a363-0be9eadcf19d","ad5667ed-fb91-4d7f-9129-b4e670bf5c32"]
  // headers =  "uuid"
}

function getMatchingObjects(sheetNames, headers, searchValues) {
  Logger.log(`Looking on sheets: ${sheetNames}\n For values: ${searchValues}\n In Headers: ${headers}.`)
  sheetNames = typeof sheetNames === 'string' ? [sheetNames] : sheetNames;
  headers = typeof headers === 'string' ? [headers] : headers;
  searchValues = typeof searchValues === 'string' ? [searchValues] : searchValues;
  const sheets = sheetNames.map(name => SpreadsheetApp.getActive().getSheetByName(name));
  const results = {};
  let i = 0;
  Logger.log(`Looking on sheets (updated if strings to arrays): ${sheetNames}\n For values: ${searchValues}\n In Headers: ${headers}.`)
  sheets.forEach(sheet => {
    const sheetName = sheet.getSheetName()
    results[sheetName] = []; // Initialize an empty array for each sheet in the results object
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();

    let columnIndexMap;
    if (headers !== undefined) {
      columnIndexMap = headers.map(header => data[0].findIndex(col => col === header));
    }

    const matchingRows = data.slice(2).filter((row, rowIndex) => {
      if (!row[0]) return false; // Skip empty rows

      if (!searchValues) { // If searchValues is not defined, return true for all non-empty rows
        return true;
      }

      return searchValues.some(searchValue => {
        if (headers === undefined) {
          return row.some(value => Array.isArray(searchValue) ? searchValue.includes(value) : value === searchValue);
        }
        return columnIndexMap.some(index => {
          const value = row[index];
          return Array.isArray(searchValue) ? searchValue.includes(value) : value === searchValue;
        });
      });
    });

    matchingRows.forEach((row) => {
      const jsonData = row[references.jsonDenseColumnNum-1];
      Logger.log(`Found Matching Data row ${row}, on ${sheetName} for ${searchValues} in ${headers}.
      Result:
      ${JSON.stringify(jsonData, null, 5)}
      `)
      results[sheetName].push({ row: data.indexOf(row) + 1, jsonData });
      i++;
    });
  });

  Logger.log(`We found a total of ${i} unique matches.
    Returning: 
      ${JSON.stringify(results, null, 5)}
  `)

  return results;
}



function getColumnNumbersByHeaders(sheet, colNames) {
  colNames = typeof colNames === 'string' ? [colNames] : colNames;
  const data = sheet.getRange(references.headerRange).getValues();
  return colNames.reduce((columns, colName) => {
    const col = data[0].findIndex((col) => col === colName) + 1;
    if (col > 0) {
      columns[colName] = col;
    }
    return columns;
  }, {});
}

function getColumnsByHeaders(sheet, colNames) {
  colNames = typeof colNames === 'string' ? [colNames] : colNames;
  const data = sheet.getRange(references.headerRange).getValues();
  return colNames.reduce((columns, colName) => {
    const col = data[0].findIndex((col) => col === colName) + 1;
    if (col > 0) {
      columns[colName] = String.fromCharCode(col + 64);
    }
    return columns;
  }, {});
}

function storeComponentUUIDs() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    "PersonaDisplay": "0d27c092-306a-4125-9c59-481ff7068c1b",
    "PersonaSelection": "ad5667ed-fb91-4d7f-9129-b4e670bf5c32",
    "InteractionCards": "57f24295-66b0-489a-a363-0be9eadcf19d",
    "gameDetails": "de35b340-660e-4327-b48d-365eaacd6438"
  });
}

function getComponentUUIDs() {
  const scriptProperties = PropertiesService.getScriptProperties().getProperties();
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const uuidProperties = {};

  for (const key in scriptProperties) {
    if (scriptProperties.hasOwnProperty(key)) {
      if (uuidPattern.test(scriptProperties[key])) {
        uuidProperties[key] = scriptProperties[key];
      }
    }
  }
  return uuidProperties;
}

function displayUserSelector() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('Database/SelectUser.html')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Select a User');
}

function findActiveUser() {
  const usersSheetName = references.userSheetName;
  const userProps = PropertiesService.getUserProperties().getProperties();
  const userEmail = Session.getActiveUser().getEmail();
  const matchingObjects = getMatchingObjects([usersSheetName], ["uuid", "email"], [userProps.useruuid, userEmail])[usersSheetName];
  return matchingObjects.map(obj => ({ ...JSON.parse(obj.jsonData), row: obj.row }));
}

function findUserPersona() {
  const personaSheetName = references.personaSheetName;
  const userProps = PropertiesService.getUserProperties().getProperties();
  const userState = JSON.parse(userProps.userState)
  const matchingObjects = getMatchingObjects([personaSheetName], ["uuid"], [userState.personauuid])[personaSheetName];
  Logger.log(`User Properties: ${userProps}
              Objects Returned: ${matchingObjects}`)
  const activePersona = JSON.parse(matchingObjects[0].jsonData);
  Logger.log("Active Persona: ${activePersona}")
  return activePersona
}

// General functions to set, get, and update JSON data in properties

function setJSONProperty(propertyType, key, value) {
  const properties = getPropertiesObject(propertyType);
  properties.setProperty(key, JSON.stringify(value));
}

function getJSONProperty(propertyType, key) {
  const properties = getPropertiesObject(propertyType);
  const value = properties.getProperty(key);
  return value ? JSON.parse(value) : null;
}

function updateJSONProperty(propertyType, key, updatedValues) {
  const properties = getPropertiesObject(propertyType);
  const currentValue = getJSONProperty(propertyType, key);
  const newValue = { ...currentValue, ...updatedValues };
  properties.setProperty(key, JSON.stringify(newValue));
}

function getPropertiesObject(propertyType) {
  switch (propertyType) {
    case "user":
      return PropertiesService.getUserProperties();
    case "script":
      return PropertiesService.getScriptProperties();
    case "document":
      return PropertiesService.getDocumentProperties();
    default:
      throw new Error("Invalid property type");
  }
}

// Specific functions for user state

function setUserState(state) {
  setJSONProperty("user", "userState", state);
}

function getUserState() {
  return getJSONProperty("user", "userState");
}

function testupdate()
{
  const currentState = getUserState()
  updatedValues = {
    "personauuid": "b094d5f6-e864-46f8-a55d-3435dbdad018",
    "threaduuid": "47dc1ff7-0928-4fd3-927e-4e096224c035"
  }
  updateUserState(updatedValues)
}

function updateUserState(updatedValues) {
  updateJSONProperty("user", "userState", updatedValues);
}
