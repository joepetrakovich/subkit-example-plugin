
const SUBKIT_EXTENSION_ID = 'nbfimkdbifhjfambljjggekodjlppiad';

const words = ['the', 'and', 'to', 'for', 'yes', 'no', 'it'];

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.sendMessage(SUBKIT_EXTENSION_ID,
      {
        command: 'register-plugin',
        name: 'Word Highlighter',
        description: 'Highlight words from a predefined word list.',
        help: "This plugin will highlight words from a predefined list whenever they appear on a subtitle.",
        icon: chrome.runtime.getURL('highlight-icon.svg'),
        hooks: ['onsubtitlesready', 'onaddstyles']
      },
      function (response) {
        console.log(response);
      }
    );
});

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  if (sender.id !== SUBKIT_EXTENSION_ID) {
    return;
  }
  
  if (request.command === 'on-add-styles-hook') {
    sendResponse({
      command: 'on-add-styles-hook-response',
      styles: ".marked mark { color: white; background-color: red; }",
      error: ''
    });

  } else if (request.command === 'on-subtitles-ready-hook') {
    
    const hookResponse = {
      command: 'on-subtitles-ready-hook-response',
      subtitles: request.subtitles,
      error: ''
    };

    if (request.language !== 'en') {  //only process english subtitles, otherwise send them back unmodified.
      return sendResponse(hookResponse);
    }

    request.subtitles.forEach((subtitle, index, subtitles) => {
      let html = subtitle.text;
      words.forEach(word => {
        html = html.replace(new RegExp('\\b' + word + '\\b', 'g'), `<mark>${word}</mark>`);
      });
      subtitles[index].html = `<span class='marked'>${html}</span>`;
    });
    
    hookResponse.subtitles = request.subtitles;
    
    return sendResponse(hookResponse);
  } 
});