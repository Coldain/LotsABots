function onOpen(e) {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu("Developer").addItem("Open Projects","showSidebar").addItem("Open Dialogue","showGPT").addToUi();
  ui.createMenu('Test')
      .addItem('Load HTML', 'testHTML')
      .addItem('Load Function', 'testFUNCTION')
      .addItem('test2', 'test2')
      .addToUi();
}

function onEdit(e) {
  Logger.log(e);
  const sheetName = e.source.getActiveSheet().getName();
  Logger.log(`sheetName: ${sheetName}`);
  const sheet = e.source.getSheetByName(sheetName);
  Logger.log(`sheet: ${sheet}`);
  const changedRange = e.range;
  Logger.log(`changedRange: ${changedRange}`);
  if (changedRange.getRow() === 1 && changedRange.getColumn() === 3) {
    handlekeyFilterChanged(sheet);
  } else {
    handleKeyDataChanged(sheet, changedRange,e);
  }
}

function testFUNCTION(){
  const uuid = Browser.inputBox("Enter UUID");
  const func = loadFUNCTION(uuid);
  Logger.log(`func - ${(func).toString()}`)
  const output = func();
  return output;
}

function testHTML(){
  const uuid = Browser.inputBox("Enter UUID");
  const html = renderHTML(uuid);
  Logger.log(`html - ${(html).toString()}`)
  return html;
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