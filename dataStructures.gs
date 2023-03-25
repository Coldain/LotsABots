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




