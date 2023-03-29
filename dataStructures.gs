/*
Using app script API endpoints I want to create a script that allows for communicating via different methods (chat, sms, voice messages, video, etc) that the google app script will write these interactions to a spreadsheet. I'll need message type, conversations id, users id, and last message (includes intent, expression, interpretation, and attachments). I'll build these out as JSON that gets stored in google sheets. that uses functions and formulas to build the references. 
I want to store JSON in the leftmost columns that are made up of functions and references to the the other columns. Giving me easy object interpretation from the JSON but also easy analysis and interpretation using the other columns via normal spreadsheet rules and logic.
Read from the JSON, write to the additional columns.

Here's the JSON schema I have so far. What suggestions or improvements do you have to make this more capable.
*/

/*
Good that's the intent, it's just a schema for the state will load in only section of a user object so I can display key details and be able to reference back to the main object by id if I want to do more interactions. Kind of like a soft loaded state for the sub objects. Any other properties I should add to my objects. Can you create me the sub objects as their own structures now? With suggested additional properties that developers or users might want :D
*/

/*
What are the sheet names and the headers I should create to facilitate this?

example

Sheet: Users
Headers: JSON,id,name,icon,...
...
*/

/*

*/

/*

*/

/*

*/



const sesssionData = {
  activeUser: { // the active user of the chat session
    id: null, // id of the active user
    view: null, // will change priorMessages structure to have raw, interpretation, or expression
    // ...
  },
  sideConversation: { // will be side chat with the AI that can load in different sidechats related to this user, defaults to the one that is related to conversation
      activeSide: { // contents and details of the active side converation
        id: null, // the id of the side conversation
        name: null, // the name of the side conversation
        intent: null, // intent of the conversation, like keywords and meta data, will be explorable and searchable
        // contents...
      },
      sides: [ // list of side conversations
        {
          id: null, // the id of the side conversation
          name: null, // the name of the side conversation
          intent: null, // intent of the conversation, like keywords and meta data, will be explorable and searchable
          description: null, // short description of this topic
        }
        //...
      ],
      //...
  },
  activeConversation: {
    id: null, // Id of the active conversation to reference more messages from the thread
    users: {
      members: [ // list of user members of the group, includes the activeUer
        { // can be used to 
          id: null, // id of the active user
          name: null, // name of the user
          icon: null, // the url for their image to be displayed in the conversation
        // ...
        },
        // ...
      ],
      // ...
    },
    summary: { // feeds into a summary bot that will track intents of current message and 
      intent: null, // intent of the conversation, like keywords and meta data, will be explorable and searchable
      setting: null, // the type of conversation setting (work, fun, game, supportive, philisophical, etc)
      interpretation: null, // a summary of the conversation that takes in the intent, setting, previous interpretation, current message and last message
      suggestions: [ // based upon the summary, current message, last message, provides AI driven options and suggestion for the conversation. Will be either as adaptive cards, interactive html, forms, selections etc that users of the chat can interact with 
        {
          //...
        }
      ]
      // ... 
    }, 
    currentMessage: {
      id: null, // the id of the message
      mode: null, // the mode of communication chat, sms, voice, video
      raw: null, // the raw message, depends on the mode (maybe a string, rich text, mp4, mp3, wav etc) 
      intent: null, // intent of the message, like keywords and meta data, will be explorable and searchable
      context: null, // summary of additional attachments, links, etc contents and relevance to the conversation.summary
      attachments: null, // summary of additional attachments, links, etc
      timestamp: null, // the 
      reactions: [ // different emoji reactions and their count, can have custom emojis
        {
          id: null, // the id of the reaction
          icon: null, // the url of the reaction
          count: null, // the count of this reaction to the message
        },
        //...
      ],
      sender: {
        style: null, // the type of expression setting (detailed, story telling, etc) short description of how the raw message should be translated through the AI to the recepients
        expression: null, // an expression of the currentMessage.raw filter through AI using sender.style and conversation.summary
        id: null, // id of the user who sent the message
        //...
      } ,
      recepients: [
        {
          style: null, // the type of expression setting (detailed, story telling, etc) short description of how the raw message should be translated through the AI from the sender
          id: null, // id of the user who will recieve the message
          interpretation: null, // an interpretation of the currentMessage.raw filter through AI using sender.style and conversation.summary
        }
        //...
      ],
      // ...
    },
    lastMessage: {
      id: null, // the id of the message
      mode: null, // the mode of communication chat, sms, voice, video
      raw: null, // the raw message, depends on the mode (maybe a string, rich text, mp4, mp3, wav etc) 
      intent: null, // intent of the message, like keywords and meta data, will be explorable and searchable
      context: null, // summary of additional attachments, links, etc contents and relevance to the conversation.summary
      attachments: null, // summary of additional attachments, links, etc
      reactions: [ // different emoji reactions and their count, can have custom emojis
        {
          id: null, // the id of the reaction
          icon: null, // the url of the reaction
          count: null, // the count of this reaction to the message
        },
        //...
      ],
      sender: {
        style: null, // the type of expression setting (detailed, story telling, etc) short description of how the raw message should be translated through the AI to the recepients
        expression: null, // an expression of the currentMessage.raw filter through AI using sender.style and conversation.summary
        id: null, // id of the user who sent the message
        icon: null, // the url for their image to be displayed in the conversation
        //...
      } ,
      recepients: [
        {
          style: null, // the type of expression setting (detailed, story telling, etc) short description of how the raw message should be translated through the AI from the sender
          id: null, // id of the user who will recieve the message
          interpretation: null, // an interpretation of the currentMessage.raw filter through AI using sender.style and conversation.summary
        }
        //...
      ],
      // ...
    },
    priorMessages: [ // will be diplay the message but can used to retrieve addditional information and explore expressions and interpretations of past messages, exludes currentMessage, and lastMessage
      {
        id: null, // the id of the message
        mode: null, // the mode of communication chat, sms, voice, video
        content: null, // will be raw, interpretation, or expression, 
        intent: null, // intent of the message, like keywords and meta data, will be explorable and searchable
        hasAttachments: null, // indicates if it has attachments so they can be retrieved and explored
        reactions: [ // different emoji reactions and their count, can have custom emojis
          {
            id: null, // the id of the reaction
            icon: null, // the url of the reaction
            count: null, // the count of this reaction to the message
          },
          //...
        ],
        //...
      }
      // ...
    ],
    thread: { // used to have side conversations on a specific message
      id: null, // id of the message thread
      priorMessages: [ // will be diplay the message but can used to retrieve addditional information and explore expressions and interpretations of past messages
        {
          id: null, // the id of the message
          mode: null, // the mode of communication chat, sms, voice, video
          raw: null, // the raw message, depends on the mode (maybe a string, rich text, mp4, mp3, wav etc) 
          intent: null, // intent of the message, like keywords and meta data, will be explorable and searchable
          reactions: [ // different emoji reactions and their count, can have custom emojis
            {
              id: null, // the id of the reaction
              icon: null, // the url of the reaction
              count: null, // the count of this reaction to the message
            },
            //...
          ],
          //...
        }
        // ...
      ]
      // ...
    },
    //...
  },
  conversations: [ // list of side conversations
    {
      id: null, // the id of the side conversation
      name: null, // the name of the side conversation
      intent: null, // intent of the conversation, like keywords and meta data, will be explorable and searchable
      description: null, // short description of this topic
    }
    //...
  ],
  //...
}

const sheetDataReferences = {
  globalSettings: {
    idSheet: 528883630,
    validationRules: [
      {
        name: "globalCallerId",
        validation: value => value != null && String(value).length >= 10
      },
      {
        name: "timeZone",
        validation: value => value != null && value !== ""
      },
    ],
  },
  unavailableCodes: {
    idSheet: 144079780,
    row: 4,
    elementKey: 'unavailableCodeName',
    api: {
      oldEndPointBool: true,
      endpoint: "/incontactapi/services/v19.0/unavailable-codes",
      post: {
        payloadManipulation: payload => {
          if (payload.hasOwnProperty('stateIdAcw')) {
            delete payload.stateIdAcw;
          }
          if (!payload.postContact)
          {
            payload.postContact = false
          }
          if (!payload.isActive)
          {
            payload.isActive = true // must be true on create.
          }
          return payload;
        },
        responseManipulation: (response, payloadJSON, referenceData) => {
          const payload = JSON.parse(payloadJSON);
          const elementKey = referenceData.elementKey;
          const elementKeyValue = payload[elementKey];
          if (response.hasOwnProperty('results')) {
            if (response.results[0].success) {
              return {
                "stateIdAcw": response.results[0].unavailableCodeId,
                "backgroundColor": "green",
                "select": false,
                [elementKey]: elementKeyValue
              };
            }
          }
          // Handle error cases (no 'results' property or error !== "Success")
          return {
            "stateIdAcw": response.error_description,
            "backgroundColor": "red",
            "select": true,
            [elementKey]: elementKeyValue
          };
        }
      },
      get: {
        batchMode: true,
        responseManipulation: (response, payload, referenceData) => {
          if (response.hasOwnProperty('unavailableCodes')) {
            response.unavailableCodes = response.unavailableCodes.map(apiItem => {
              const { outStateName, outStateId,isAcw,agentTimeoutMins, ...otherProperties } = apiItem;
              return {
                ...otherProperties,
                unavailableCodeName: outStateName,
                stateIdAcw: outStateId,
                postContact: isAcw,
                agentTimeout: agentTimeoutMins,
              };
            });
          }
          return response;
        },
      },
    },
    validationRules: [
      {
        name: "agentTimeout",
        manipulate: item => {
          const agentTimeout = parseFloat(item.agentTimeout);
          if (isNaN(agentTimeout) || agentTimeout < 30 || agentTimeout > 720) {
            item.agentTimeout = 120;
            return "Agent Timeout was not provided, invalid or out of range, defaulting to 120.";
          } else {
            item.agentTimeout = agentTimeout;
          }
          return null;
        },
        validation: value => {
          const parsedValue = parseFloat(value);
          if (isNaN(parsedValue)) return 1;
          if (parsedValue < 30 || parsedValue > 720) return 2;
          return 0;
        },
        warningMessage: (item, index, errorCode) => {
          const baseMessage = `\nUnavailable Code ${index} (${item.unavailableCodeName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'has an invalid Agent Timeout value (must be an NUMBER between 30 and 720';
            case 2:
              return baseMessage + 'has an out of range Agent Timeout value (must be between 30 and 720).';
          }
        },
        defaultValue: 120,
      },
      {
        name: "unavailableCodeName",
        validation: value => {
          if (value == null || value.length === 0) return 1; // Empty value
          if (value.length >= 25) return 2; // Too long
          const regex = /^[a-zA-Z0-9\s]*$/; // Regular expression to match alphanumeric characters and spaces
          if (!regex.test(value)) return 3; // Contains special characters
          return 0; // No error
        },
        warningMessage: (item, index, errorCode) => {
          const baseMessage = `\nUnavailable Code ${index} (${item.unavailableCodeName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'is missing data: Name.';
            case 2:
              return baseMessage + 'has too many characters (max 25): Name.';
            case 3:
              return baseMessage + 'contains special characters: Name.';
          }
        },
      },
      {
        name: "postContact",
        validation: value => typeof value === 'boolean' ? 0 : 1,
        warningMessage: (item, index, errorCode) => {
          if (errorCode === 1) {
            return `\nUnavailable Code ${index} (${item.unavailableCodeName}) has an invalid Post Contact (ACW) value. Defaulting to false.`;
          }
        },
        defaultValue: false,
      },
    ],
  },
  hoursOfOperations: {
    idSheet: 819809787,
    row: 5,
    elementKey: "profileName",
    validationRules: [
      {
        name: "profileName",
        manipulate: item => item,
        validation: value => {
          if (value.length < 1) return 1;
          if (value.length >= 30) return 2;
          return 0;
        },
        errorMessage: (item, index, errorCode) => {
          const baseMessage = `\nCampaign ${index} (${item.campaignName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'is missing data: Name.';
            case 2:
              return baseMessage + 'has too many characters (max 30): Name.';
          }
        },
      },
      {
        name: "daysOfWeek",
        manipulate: item => item.days,
        validation: value => {
          if (Array.isArray(value) && value.length === 7) {
            for (const day of value) {
              if (!day.day || !day.hasOwnProperty('openTime') || !day.hasOwnProperty('closeTime') || !day.hasOwnProperty('hasAdditionalHours') || !day.hasOwnProperty('isClosedAllDay')) {
                return 1;
              }
            }
            return 0;
          } else {
            return 1;
          }
        },
        warningMessage: (item, index, errorCode) => {
          if (errorCode === 1) {
            return `Row ${index}: Days of the week data is missing or invalid, defaulting to closed all day.`;
          }
          return "";
        },
        errorMessage: (item, index, errorCode) => "",
        defaultValue: [
          { day: "Sunday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true },
          { day: "Monday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true },
          { day: "Tuesday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true },
          { day: "Wednesday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true },
          { day: "Thursday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true },
          { day: "Friday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true },
          { day: "Saturday", openTime: "", closeTime: "", hasAdditionalHours: false, isClosedAllDay: true }
        ]
      },
      {
        name: "holidays",
        manipulate: item => item.holidays,
        validation: value => {
          if (Array.isArray(value)) {
            for (const holiday of value) {
              if (!holiday.holidayName || !holiday.holidayDate || !holiday.hasOwnProperty('holidayIsClosedAllDay') || !holiday.hasOwnProperty('holidayOpenTime') || !holiday.hasOwnProperty('holidayCloseTime') || !holiday.hasOwnProperty('holidayHasAdditionalHours') || !holiday.hasOwnProperty('holidayAdditionalOpenTime') || !holiday.hasOwnProperty('holidayAdditionalCloseTime')) {
                return 1;
              }
            }
            return 0;
          } else {
            return 1;
          }
        },
        warningMessage: (item, index, errorCode) => {
          if (errorCode === 1) {
            return `Row ${index}: Holiday data is missing or invalid, defaulting to no holidays.`;
          }
          return "";
        },
        errorMessage: (item, index, errorCode) => "",
        defaultValue: []
      }

    ],
    api: {
      oldEndPointBool: true,
      endpoint: "/incontactapi/services/v24.0/hours-of-operation",
      post: {
        payloadManipulation: payload => {
          if (payload.hasOwnProperty("profileId")) {
            delete payload.profileId;
          }
          return payload;
        },
        responseManipulation: response => {
          const hoursOfOperationId = response["profileId"];
          return hoursOfOperationId;
        },
      },
      getHours: {
        altSheetDataBool: true,
        
      }
    },
  },
  teams: {
    idSheet: 1505494979,
    row: 6,
    elementKey: 'name',
    api:{
      endpoint: "/user-management/v1/teams",
      post:{
        payloadManipulation: payload => {
          if (payload.hasOwnProperty('id')) {
            delete payload.id;
          }
          if (payload.hasOwnProperty('acdId')) {
            delete payload.acdId;
          }
          if (payload.hasOwnProperty('teamAcdId')) {
            delete payload.teamAcdId;
          }
          return payload;
        },
      },
      acd:{
        endpoint: "/incontactapi/services/v24.0/teams?fields=teamId,teamName&searchString=",
        post: {
          oldEndPointBool: true,
          payloadManipulation: payload => {
            if (payload.hasOwnProperty('acdId')){
              delete payload.acdId;
            }
            return payload;
          },
        },
      },
    },
  },
  users: {
    idSheet: 679321217,
    row: 6,
    elementKey: 'firstName',
    api:{
      endpoint: "/incontactapi/services/v24.0/agents",
      oldEndPointBool: true,
      agents:{
        post: {
          payloadManipulation: payload => {
            if (payload.hasOwnProperty('acdId')) {
              delete payload.acdId;
            }
            return payload;
          },
        },
      },
      employees:{
        endpoint:"/user-management/v1/users",
        oldEndPointBool: false,
        post: {
          payloadManipulation: payload => {
            if (payload.hasOwnProperty('id')) {
              delete payload.id;
            }
            return payload;
          },
          responseManipulation: (response, payload, oldEndPointBool) => {
            const successStatus = response["success"];

            if (successStatus == true) {
              const uuid = response["uuid"];
              return uuid;
            } else {
              if (response.details == "USER_ALREADY_EXISTS") {
                return getEmployeeId(payload.fullName, oldEndPointBool);
              } else {
                return "error";
              }
            }
          },
        },
        get: {
          endpointManipulation: fullName => `?includeDeleted=false&fullNameContains=${fullName}`,
          responseManipulation: response => {
            if (response.users.length > 0) {
              const roleUUID = response["users"][0]["roleUUID"];
              return roleUUID;
            } else {
              return "Employee Not Found";
            }
          },
        },
      },
      assignSkills:{
        oldEndPointBool: true,
        batchMode: true,
        endpointManipulation: agentId => `/${agentId}/skills`,
        post: {
          responseManipulation: response => {
            const agentId = response["agents"][0]["agentId"];
            return agentId;
          },
        },
      },
      postRoleSearch:{
        // oldEndPointBool: false,
        elementKey: 'securityProfiles',
        idSheet: 696752806,
        row: 1,
        endpoint:"/authorization/v1/roles/search",
        authEndPointBool: true,
        altSheetDataBool: true,
        batchMode: true,
        post: {
          payloadManipulation: payload => {
            return {
              "filter": {
                // "roleId": [
                //   "11e91ef8-c08c-8cb0-8a53-0242ac110004"
                // ],
                // "roleName": [
                //   "Employee"
                // ],
                "status": [
                  "ACTIVE"
                ]
              },
              "page": {
                "pageSize": 100,
                "pageNo": 0
              },
              "metrices": {
                "columns": [
                  "roleId",
                  "roleName",
                  "displayName",
                  "description",
                  "status",
                  "sequence",
                  "modifiable",
                  "internal"
                ]
              }
            };
          }, 
          responseManipulation: (data, payload, applicableConfig) => {
            const roles = data.roles;
            const sheetId = applicableConfig.idSheet;
            const sheet = getSheetById(sheetId);

            if (!sheet) {
              console.error(`Sheet with ID ${sheetId} not found.`);
              return;
            }

            // Extract the desired data from the response and insert headers
            const dataToWrite = roles.map(role => [role.displayName, role.roleName, role.roleId]);
            dataToWrite.unshift([ 'displayName', 'roleName', 'roleId']);

            // Write the data to the sheet
            const range = sheet.getRange(1, 32, dataToWrite.length, 3); // Row 1, Column AF (32), with the length and width of dataToWrite
            range.setValues(dataToWrite);

            console.log('Data successfully written to the sheet!');
          }
        },
      },
    },
  },
  addressBook: {
    idSheet:1093283917,
  },
  campaigns: {
    idSheet: 452547004,
    row: 4,
    elementKey: 'campaignName',
    api: {
      endpoint: "/incontactapi/services/v24.0/campaigns",   
      batchMode : true,
      post:{
        payloadManipulation: payload => {
          payload.campaigns.forEach(campaign => {
            if (typeof campaign.isActive !== "boolean" & !campaign.isActive) {
              campaign.isActive = true;
            }
          });
          return payload;
        },
        responseManipulation: (response, payloadJSON, referenceData) => {
          Logger.log(response)
          const payload = JSON.parse(payloadJSON);
          const elementKey = referenceData.elementKey;
          const elementKeyValue = payload[elementKey];
          if (response.hasOwnProperty("error_description")) {
            throw new Error(response.error_description);
          } else {
            // If there are no errors, process the response and return the formatted data
            if (response.hasOwnProperty("campaignResults")) {
              const campaignResults = response.campaignResults
                .map((result, index) => {
                  if(result.success){
                    return {
                      "campaignId": result.campaignId,
                      "backgroundColor": result.success ? "green" : "red",
                      "select": !result.success,
                      [elementKey]: payload.campaigns[index][elementKey],
                    };
                  }
                })
                .filter(result => result !== null && result !== undefined); // Filter out null values
              if (campaignResults.length === 0 || campaignResults[0] === undefined) {
                // If all elements had errors, throw the whole response as an error message
                throw new Error(`All elements had errors: ${JSON.stringify(response)}`);
              } else {
                return campaignResults;
              }
            }
          }
        },
      },
      get: {
        responseManipulation: (response, payloadJSON, referenceData) => {
          return response.resultSet.campaigns

        },
      },
    },
    validationRules: [
      {
        name: "campaignName",
        validation: value => {
          if (value.length < 1) return 1;
          if (value.length >= 80) return 2;
          return 0;
        },
        errorMessage: (item, index, errorCode) => {
          const baseMessage = `\nCampaign ${index} (${item.campaignName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'is missing data: Name.';
            case 2:
              return baseMessage + 'has too many characters (max 80): Name.';
          }
        },
      },
      {
        name: "isActive",
        validation: value => typeof value === 'boolean' ? 0 : 1,
        warningMessage: (item, index, errorCode) => {
          const baseMessage = `\nCampaign ${index} (${item.isActive}) `;
          if (errorCode === 1) {
            return baseMessage + 'has an invalid isActive value. Defaulting to false.';
          }
        },
        defaultValue: false,
      },
    ],
  },
  dispositions: {
    idSheet: 1303345151,
    row: 4,
    elementKey: 'dispositionName',
    api: {
      oldEndPointBool: true,
      endpoint: "/incontactapi/services/v24.0/dispositions",  
      batchMode : true,
      post:{
        payloadManipulation: payload => {
          payload.dispositions.forEach(disposition => {
            if (!disposition.isDialer) {
              disposition.isPreviewDisposition = false;
              disposition.classificationId = 31
            }
            else
            {
              if (!disposition.isPreviewDisposition) {
                disposition.isPreviewDisposition = true;
              }
            }
            delete disposition.dispositionId;
            delete disposition.isDialer;
            delete disposition.classificationType;
          });
          return payload;
        },
        responseManipulation: (response, payloadJSON, referenceData) => {
          const payload = JSON.parse(payloadJSON);
          const elementKey = referenceData.elementKey;
          const elementKeyValue = payload[elementKey];

          if (response.hasOwnProperty("error_description")) {
            throw new Error(response.error_description);
          } else {
            // If there are no errors, process the response and return the formatted data
            if (response.hasOwnProperty("dispositionResults")) {
              const dispositionResults = response.dispositionResults
                .map((result, index) => {
                  if (result.success) {
                    return {
                      "dispositionId": result.dispositionId,
                      "backgroundColor": result.success ? "green" : "red",
                      "select": !result.success,
                      [elementKey]: payload.dispositions[index][elementKey],
                    };
                  }
                })
                .filter(result => result !== null && result !== undefined); // Filter out null values

              if (dispositionResults.length === 0 || dispositionResults[0] === undefined) {
                // If all elements had errors, throw the whole response as an error message
                throw new Error(`All elements had errors: ${JSON.stringify(response)}`);
              } else {
                return dispositionResults;
              }
            }
          }
        },
      },
    },
    validationRules: [
      {
        name: "dispositionName",
        validation: value => {
          if (value.length < 1) return 1;
          if (value.length >= 50) return 2;
          return 0;
        },
        errorMessage: (item, index, errorCode) => {
          const baseMessage = `\nCampaign ${index} (${item.dispositionName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'is missing data: Name.';
            case 2:
              return baseMessage + 'has too many characters (max 50): Name.';
          }
        },
      },
      {
        name: "classificationId",
        validation: (value, item) => {
          if (item.isDialer === true) {
            if (!Number.isInteger(value)) return 1;

            if (item.isPreviewDisposition === true) {
                if (![75, 76, 77, 78, 79, 80].includes(value)) return 2;
            } else {
                if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].includes(value)) return 3;
            }
          }
          return 0;
        },
        errorMessage: (item, index, errorCode) => {
          const baseMessage = `\nItem ${index} (${item.dispositionName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'has an invalid classificationId value (must be an integer).';
            case 2:
              return baseMessage + 'has an invalid classificationId value for preview dispositions (must be one of 75, 76, 77, 78, 79, or 80).';
            case 3:
              return baseMessage + 'has an invalid classificationId value (must be one of 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, or 13).';
          }
        },
      }
    ],
  },
  tags: {
    endpoint: "/incontactapi/services/v24.0/tags?",
    idSheet: 401014133,
    row: 4,
    validationRules: [
      {
        name: "tagName",
        validation: value => {
          if (value.length < 1) return 1;
          if (value.length >= 50) return 2;
          return 0;
        },
        errorMessage: (item, index, errorCode) => {
          const baseMessage = `\nCampaign ${index} (${item.campaignName}) `;
          switch (errorCode) {
            case 1:
              return baseMessage + 'is missing data: Name.';
            case 2:
              return baseMessage + 'has too many characters (max 50): Name.';
          }
        },
      },
    ],
  },
  skills: {
    api: {
      oldEndPointBool: true, 
      endpoint: "/incontactapi/services/v24.0/skills",   
      get: {
        endpointManipulation: (mediaType, skillId) => `?mediaTypeId=${mediaType}&searchString=${skillId}`,
      },
      put: {
        batchMode : true,
        endpointManipulation: skillId => `/${skillId}`,
        payloadManipulation: response => {
          var skillIds = [];
        
          for (let i = 0; i < response.skillsResults.length; i++)
          {
            var currentSkill = [];
            currentSkill[0] = response["skillsResults"][i].skillId
            skillIds.push(currentSkill);
          }
          return skillIds;
        }
      },
      post: {
        batchMode : true,
        payloadManipulation: payload => {
          if (payload.hasOwnProperty('skillId')) {
            delete payload.skillId;
          }
          return payload;
        },
        responseManipulation: response => {
          var skillIds = [];
        
          for (let i = 0; i < response.skillsResults.length; i++)
          {
            var currentSkill = [];
            currentSkill[0] = response["skillsResults"][i].skillId
            skillIds.push(currentSkill);
          }
          return skillIds;
        },
      },
      assignTags:{
          endpointManipulation: skillId => `/${skillId}/tags`,
      },
      assignSkills:{
          endpointManipulation: skillId => `/${skillId}/agents`,
      },
      dialerParameters:{
        get: {
          endpointManipulation: skillId => `/${skillId}/parameters`,
        },
        put: {
          endpointManipulation: (skillId,urlRoute) => `/${skillId}/${urlRoute}`,
        },
      },
    },
    phone: {
      idSheet: 812590542,
      row: 6,
    },
    voicemail: {
      idSheet: 1836287941,
      row: 6,
      api: {
        endpoint: "/incontactapi/services/v24.0/skills",   
        batchMode : true,
        post: {
          payloadManipulation: payload => {
            const formatObj = { campaigns: {} };
            formatObj.campaigns = payload.campaigns;
            return formatObj;
          },
        },
      },
    },
    email: {
      idSheet: 195162033,
      row: 6,
      api: {
        endpoint: "/incontactapi/services/v24.0/skills",   
        batchMode : true,
        post: {
          payloadManipulation: payload => {
            const formatObj = { campaigns: {} };
            formatObj.campaigns = payload.campaigns;
            return formatObj;
          },
        },
      },
    },
    emailSettings: {
      idSheet: 195162033,
      row: 6,
    },
    chat: {
      idSheet: 1779303704,
      row: 6,
      api: {
        endpoint: "/incontactapi/services/v24.0/skills",   
        batchMode : true,
        post: {
          payloadManipulation: payload => {
            const formatObj = { campaigns: {} };
            formatObj.campaigns = payload.campaigns;
            return formatObj;
          },
        },
      },
    },
    chatProfile: {
      idSheet: 430810747,
      row: 6,
    },
    quickReplies: {
      idSheet: 1460574648,
      row: 6,
    },
    workItems: {
      idSheet: 124238541,
      row: 6,
    },
  },
  poc: {
    phone: {
      idSheet: 1295206657,
      row: 3,
    },
    email: {
      idSheet: 789029165,
      row: 3,
    },
    chat: {
      idSheet: 562140295,
      row: 3,
    },
    sms: {
      idSheet: 2022332628,
      row: 3,
    },
  },
  sf: {
    idSheet: 2143704049,
  },
  rest: {
    idSheet: 94828376,
  },
  soap: {
    idSheet: 1285960908,
  },
  html: {
    idSheet: 162750350,
  },
  db: {
    idSheet: 324820349,
  },
  dataValidation: {
    idSheet: 696752806,
  },
  dataValidationSF: {
    idSheet: 105246766,
  },
};


