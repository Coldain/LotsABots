function onOpen(e) {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu("Developer")
    .addItem("Open Projects","showSidebar")
    .addItem("Open Dialogue","showGPT")
    .addItem('Test Sidebar', 'showTestSidebar').addToUi();
}

// TODO create onInstall to set up checkForHashChanges timer and createBackup
function setUpBackupTrigger() {
  const backupFrequency = 'MONTHLY'; // Change this to the desired frequency, e.g., 'DAILY', 'WEEKLY', etc.
  ScriptApp.newTrigger('createBackup')
    .timeBased()
    .everyDays(30) // Change this to the desired interval based on your backup frequency
    .create();
}

function onEdit(e) {
  Logger.log(e);
  const sheetName = e.source.getActiveSheet().getName();
  Logger.log(`sheetName: ${sheetName}`);
  const sheet = e.source.getSheetByName(sheetName);
  Logger.log(`sheet: ${sheet}`);
  const changedRange = e.range;
  if (changedRange.getRow() === references.descriptionRow && changedRange.getColumn() === references.jsonSparseColumnNum) {
    Logger.log(`KeyFilter Changed from ${e.oldValue} to ${e.value}`)
    handlekeyFilterChanged(sheet);
  } else {
    Logger.log(`KeyData Changed`)
    handleKeyDataChanged(sheet, changedRange,e);
  }
}

function checkForHashChanges() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const valuesStartColumnIndex = letterToColumn(references.valuesStartColumn);

  sheets.forEach(sheet => {
    const checkSumHashSum = sheet.getRange(references.descriptionRow, letterToColumn(references.hashNewColumn)).getValue();
    const lastHashSum = sheet.getRange(references.descriptionRow, letterToColumn(references.hashOldColumn)).getValue();

    Logger.log(`Sheet: ${sheet.getName()}, checkSumHashSum: ${checkSumHashSum}, lastHashSum: ${lastHashSum}`);

    if (checkSumHashSum !== lastHashSum) {
      const lastRow = sheet.getLastRow();
      if (lastRow >= references.valuesStartRow) {
        const hashColumns = sheet.getRange(references.valuesStartRow, letterToColumn(references.hashNewColumn), lastRow - references.valuesStartRow + 1, 2).getValues();

        for (let i = 0; i < hashColumns.length; i++) {
          if (hashColumns[i][0] !== hashColumns[i][1]) {
            const row = references.valuesStartRow + i;
            const changedRange = sheet.getRange(row, valuesStartColumnIndex, 1, sheet.getLastColumn() - valuesStartColumnIndex + 1);

            Logger.log(`Updating row ${row} in sheet ${sheet.getName()}`);

            for (let loopCount = 0; loopCount < references.validationLoopCount; loopCount++) {
              handleKeyDataChanged(sheet, changedRange);
            }
            sheet.getRange(row, letterToColumn(references.hashOldColumn)).setValue(hashColumns[i][0]);
          }
        }
      } else {
        Logger.log(`No rows with data in sheet ${sheet.getName()}`);
      }
    }
  });
}


function createBackup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const backupFolderId = 'YOUR_BACKUP_FOLDER_ID'; // Replace with your backup folder ID
  const backupFolder = DriveApp.getFolderById(backupFolderId);
  const currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
  const backupName = `${spreadsheet.getName()}_backup_${currentDate}`;
  
  DriveApp.getFileById(spreadsheet.getId()).makeCopy(backupName, backupFolder);
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
  const html = renderHTMLUUID(uuid);
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