function showPersona() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('SOMA/UI/Persona.html')
    .setWidth(600)
    .setTitle('Persona');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}


function showAIX() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('SOMA/UI/AI-X.html')
    .setWidth(800)
    .setHeight(600)
  SpreadsheetApp.getUi().showModalDialog(htmlOutput,'AI-X: Interactive Personas');
}
