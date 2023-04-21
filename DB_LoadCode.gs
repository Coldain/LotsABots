// This is google app script code attached to a google sheet
// This code is used to load HTML from a google sheet into the template
// This code is used to load functions from a google sheet into the template
const references = {
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
  // Get the sheet with the functions
  const sheet = SpreadsheetApp.getActive().getSheetByName("WB FUNCTIONS");
  // Get list of all the uuids in the sheet from column I (uuid) and find the row with the matching uuid
  const row = sheet.getRange(references.uuidRange).getValues().findIndex((row) => row[0] === uuid) + 3;
  // Find the columns with the parameters and function
  const func = sheet.getRange(getColumnsByHeaders(sheet, "FUNCTION")[0] + row).getValue();

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
    loadedFunction(); // Call the function directly
    Logger.log(`Function Ran: ${loadedFunction}`);
  }
}

function renderHTMLUUID(uuid)
{
  // uuid = "3493a4be-8838-4e4e-85ed-ca2fb3f02bc9"
  const html = loadHTML(uuid)
  const htmlOutput = HtmlService.createHtmlOutput(html[0])
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

function getColumnsByHeaders(sheet, ...colNames) {
  const data = sheet.getRange(references.headerRange).getValues();
  const columns = {};

  colNames.forEach(colName => {
    const col = data[0].findIndex((col) => col === colName) + 1;
    if (col > 0) {
      columns[colName] = String.fromCharCode(col + 64);
    }
  });

  return columns;
}

function getMatchingObjects(sheetName, headers, searchValues) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow() - 1;

  // Get the columns for each header
  const columns = headers.map((header) => getColumnByHeader(sheet, header));

  // Get the values for each column
  const values = columns.map((col) => sheet.getRange(col + "2:" + col + (lastRow + 1)).getValues().flat());

  // Find matching rows
  const matchingRows = [];
  for (let row = 0; row < lastRow; row++) {
    let match = true;
    for (let i = 0; i < headers.length; i++) {
      // Check if the search value is an array
      if (Array.isArray(searchValues[i])) {
        // If it's an array, check if the value exists in the array
        if (!searchValues[i].includes(values[i][row])) {
          match = false;
          break;
        }
      } else {
        // If it's not an array, check if the values are equal
        if (values[i][row] !== searchValues[i]) {
          match = false;
          break;
        }
      }
    }
    if (match) {
      matchingRows.push(row + 2);
    }
  }

  // Get the JSON data from column B for each matching row
  const matchingObjects = matchingRows.map((row) => {
    const jsonData = sheet.getRange(references.jsonDenseColumn + row).getValue();
    return { row, jsonData };
  });

  return matchingObjects;
}

