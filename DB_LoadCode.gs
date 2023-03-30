// This is google app script code attached to a google sheet
// This code is used to load HTML from a google sheet into the template
// This code is used to load functions from a google sheet into the template


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
  const row = sheet.getRange("I3:I").getValues().findIndex((row) => row[0] === uuid) + 3;
  // Get the HTML from the sheet and load it into the template
  // The HTML is in the column with the header "HTML" and the row with the matching uuid
  const html = sheet.getRange(getColumnByHeader(sheet, "HTML") + row).getValue();
  const name = sheet.getRange(getColumnByHeader(sheet, "name") + row).getValue();
  Logger.log(`Retrieved ${name} as ${html}`)
  // return the HTML output to be rendered or used later
  return [html, name]; 
}

function loadFUNCTION(uuid, ...args) {
  // Get the sheet with the functions
  const sheet = SpreadsheetApp.getActive().getSheetByName("WB FUNCTIONS");
  // Get list of all the uuids in the sheet from column I (uuid) and find the row with the matching uuid
  const row = sheet.getRange("I3:I").getValues().findIndex((row) => row[0] === uuid) + 3;
  // Find the columns with the parameters and function
  const func = sheet.getRange(getColumnByHeader(sheet, "FUNCTION") + row).getValue();


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

function renderHTML(uuid)
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

function getColumnByHeader(sheet, colName) {
  const data = sheet.getRange("1:1").getValues();
  const col = data[0].findIndex((col) => col === colName) + 1;
  return String.fromCharCode(col + 64);;
}
