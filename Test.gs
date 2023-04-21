function showTestSidebar() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('Test_UI.html')
    .setWidth(300)
    .setHeight(600)
    .setTitle('Test Functions and HTML');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function getAllItems() {
  const functions = getItemsFromSheet('WB FUNCTIONS', 'FUNCTION');
  const htmlItems = getItemsFromSheet('WB HTML', 'HTML');
  const allItems = [...functions, ...htmlItems];
  return allItems;
}


function getItemsFromSheet(sheetName, contentType) {
  // sheetName = "WB FUNCTIONS", contentType = "FUNCTION"
  // sheetName = "WB HTML", contentType = "HTML"
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow() - 2;
  const data = sheet.getRange(references.valuesStartRow, references.jsonDenseColumnNum, lastRow, 1).getValues();
  const items = [];
  data.forEach(function(row) {
    if (row[0]) {
      var item = {}
      item = JSON.parse(row[0]);
      item.type = contentType
      items.push(item);
      Logger.log({item})
    }
  });
  return items;
}