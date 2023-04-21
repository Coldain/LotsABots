function showGPT() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('AI_Dialogue_UI.html')
    .setTitle('Chatbot Sidebar')
    .setWidth(500)
    .setTitle('AI-X Interactions');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function getUuidFromUserProperties() {
  const userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('UUID');
}

function loadConversations() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("AI Conversations");
  const data = sheet.getRange(references.valuesStartRow, references.jsonDenseColumnNum, sheet.getLastRow() - 1, 2).getValues();
}


// function doGet() {
//   return HtmlService.createHtmlOutputFromFile('index');
// }
