const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = 'https://script.google.com/macros/d/your_script_id/usercallback';

function showRCAuth() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('RC_APIs_UI.html')
  SpreadsheetApp.getUi().showModalDialog(htmlOutput,'Authorize RingCentral');
}

function authorize() {
  const url = `https://platform.devtest.ringcentral.com/restapi/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=random_string`;
  return url;
}

function usercallback(request) {
  const code = request.parameter.code;
  const state = request.parameter.state;

  // Verify state parameter to avoid CSRF attacks

  // Exchange code for access token
  const response = UrlFetchApp.fetch('https://platform.devtest.ringcentral.com/restapi/oauth/token', {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(`${CLIENT_ID}:${CLIENT_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: {
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': REDIRECT_URI
    }
  });

  const responseBody = JSON.parse(response.getContentText());

  // Store access token and refresh token
  // Use access token to call RingCentral APIs

  return HtmlService.createHtmlOutput('<h1>Authorization successful!</h1>');
}
