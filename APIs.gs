function doGet(e) {
  // Read the data from the sheet
  const data = readFromSheet();

  // Return the data as JSON
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Extract the JSON data from the request
  const jsonData = JSON.parse(e.postData.contents);

  // Write the data to the sheet
  writeToSheet(jsonData);

  // Return a success message
  return ContentService.createTextOutput("Data written successfully.");
}


function writeToSheet(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Data");
  const headers = ["message_type", "conversation_id", "user_id", "last_message"];
  const row = [data.message_type, data.conversation_id, data.user_id, JSON.stringify(data.last_message)];
  
  sheet.appendRow(row);
}


function readFromSheet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Data");
  const lastRow = sheet.getLastRow();
  const dataRange = sheet.getRange(2, 1, lastRow - 1, 4); // Assuming the header row is 1
  const data = dataRange.getValues();

  const jsonData = data.map(row => {
    return {
      message_type: row[0],
      conversation_id: row[1],
      user_id: row[2],
      last_message: JSON.parse(row[3]),
    };
  });

  return jsonData;
}
