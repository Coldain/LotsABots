function loadHTML(UUID){
  // Get the sheet with the HTML
  const sheet = SpreadsheetApp.getActive().getSheetByName("WB HTML");
  // Get list of all the UUIDs in the sheet from column I (UUID) and find the row with the matching UUID starting at row 3
  const row = sheet.getRange("I:I").getValues().findIndex((row) => row[0] === UUID) + 3;
  // Get the HTML from the sheet and load it into the template
  // The HTML is in the column with the header "HTML" and the row with the matching UUID
  const html = sheet.getRange("HTML:" + row).getValue();
  // return the HTML output to be rendered or used later
  return html; 
}

function loadFUNCTION(UUID, ...args){
  // Get the sheet with the functions
  const sheet = SpreadsheetApp.getActive().getSheetByName("WB FUNCTIONS");
  // Get list of all the UUIDs in the sheet from column I (UUID) and find the row with the matching UUID starting at row 3
  const row = sheet.getRange("I:I").getValues().findIndex((row) => row[0] === UUID) + 3;
  // get the parameters from the sheet and load them into the template
  // The parameters are in the column with the header "PARAMETERS" and the row with the matching UUID
  const parameters = sheet.getRange("PARAMETERS:" + row).getValue();
  const func = sheet.getRange("FUNCTION:" + row).getValue();
  // Create a new function with the parameters and function from the sheet, if there are both parameters and args then use the both, if there are only parameters then use those, if there are only args then use those
  if (parameters && args) {
    var newFunc = new Function(parameters, args, func);
  } else if (parameters) {
    var newFunc = new Function(parameters, func);
  } else (args) {
    var newFunc = new Function(args, func);
  }
  // return the function output to be ran or used later
  return newFunc;
}
