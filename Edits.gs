
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
