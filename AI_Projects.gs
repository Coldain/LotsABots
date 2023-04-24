function doGet(e) {
  if (e.parameter.action === "data") {
    // Read the data from the sheet
    const data = readFromSheet();

    // Return the data as JSON
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  } else if (e.parameter.action === "personaTopBar") {
    const htmlTemplate = HtmlService.createTemplateFromFile('SOMA/UI/Persona.html');
    return htmlTemplate.evaluate().setTitle('Persona Top Bar');
  } else {
    // Handle other cases or return an error
    return HtmlService.createHtmlOutput("Invalid action.");
  }
}

function doPost(e) {
  if (e.parameter.action === "writeData") {
    // Extract the JSON data from the request
    const jsonData = JSON.parse(e.postData.contents);

    // Write the data to the sheet
    writeToSheet(jsonData);

    // Return a success message
    return ContentService.createTextOutput("Data written successfully.");
  } else {
    // Handle other cases or return an error
    return HtmlService.createHtmlOutput("Invalid action.");
  }
}


function showSidebar() {
  const htmlOutput = HtmlService.createHtmlOutput('AI_Projects_UI.html')
    .setWidth(600)
    .setTitle('Projects');
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}


// Load data from the specified sheet by UUID
function loadData(sheetName, uuid) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const uuidColumn = 9; // Column I
  const dataColumn = 3; // Column C
  const numRows = sheet.getLastRow();

  for (let i = 1; i <= numRows; i++) {
    if (sheet.getRange(i, uuidColumn).getValue() === uuid) {
      return sheet.getRange(i, dataColumn).getValue();
    }
  }

  throw new Error(`UUID not found: ${uuid}`);
}

// Save data to the specified sheet by UUID
function saveData(sheetName, uuid, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const uuidColumn = 9; // Column I
  const numRows = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let rowIndex = -1;
  for (let i = 1; i <= numRows; i++) {
    if (sheet.getRange(i, uuidColumn).getValue() === uuid) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`UUID not found: ${uuid}`);
  }

  const updates = [];
  for (const [columnIndex, header] of headers.entries()) {
    if (header && data.hasOwnProperty(header.toLowerCase())) {
      updates.push([data[header.toLowerCase()]]);
    } else {
      updates.push([null]);
    }
  }

  sheet.getRange(rowIndex, 1, 1, updates.length).setValues([updates]);
}

function loadSessionData() {
  const uuid = PropertiesService.getUserProperties().getProperty('uuid');
  if (!uuid) {
    // Display a dialog box with a message, input field, and an "OK" button. The user can also
    // close the dialog by clicking the close button in its title bar.
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt('Enter the your user UUID:');

    // Process the user's response.
    if (response.getSelectedButton() == ui.Button.OK) {
    Logger.log('The user\'s uuisd is %s.', response.getResponseText());
    PropertiesService.getUserProperties().setProperty('uuid',response.getResponseText());
    } else {
    Logger.log('The user clicked the close button in the dialog\'s title bar.');
    }
  }

  const userData = JSON.parse(loadUserData(uuid));
  const conversations = JSON.parse(userData.conversationsARRAY).map((conversationUUID) => {
    const conversationData = JSON.parse(loadConversationData(conversationUUID));
    const messages = JSON.parse(conversationData.messagesARRAY).map((messageUUID) => {
      const messageData = JSON.parse(loadMessageData(messageUUID));
      return messageData;
    });

    conversationData.messages = messages;
    return conversationData;
  });

  const sessionData = {
    activeUser: userData,
    conversations: conversations,
  };

  return JSON.stringify(sessionData);
}

function htmlLogger(text){
  Logger.log(text)
}

// Load user data by UUID
function loadUserData(uuid) {
  const userSheetName = 'AI_Users';
  return loadData(userSheetName, uuid);
}

// Load message data by UUID
function loadMessageData(uuid) {
  const messageSheetName = 'AI_Messages';
  return loadData(messageSheetName, uuid);
}

// Load conversation data by UUID
function loadConversationData(uuid) {
  const conversationSheetName = 'AI_Conversations';
  return loadData(conversationSheetName, uuid);
}

