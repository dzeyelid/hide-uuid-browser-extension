// Create these instances at first, because avoid a bug discussed 
// in this issue https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon.
const actions = [
  new chrome.declarativeContent.ShowPageAction(),
  new chrome.declarativeContent.SetIcon({path: {
    16: "images/16x16.png",
    24: "images/24x24.png",
    32: "images/32x32.png"
  }}),
  new chrome.declarativeContent.RequestContentScript({
    js: [
      'core/effect.js'
    ],
  }),
];

function loadTargetDomains() {
  chrome.storage.sync.get('targetDomains', (data) => {
    if (!data || !data.hasOwnProperty('targetDomains')) {
      chrome.storage.sync.set({targetDomains: []});
      return;
    }

    let targetDomains = [];
    Array.prototype.push.apply(targetDomains, data.targetDomains);
    let conditions = [];
    targetDomains.forEach(domain => {
      conditions.push(
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: domain,
          },
        }),
      );
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions,
        actions,
      }]);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type == MESSAGE_TYPE_SHOULD_RELOAD_SETTINGS) {
    loadTargetDomains();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  loadTargetDomains();
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log(changeInfo.status);
//   if (changeInfo.status == "complete") {
//     chrome.storage.sync.get('targetDomains', (data) => {
//       if (!data || !data.hasOwnProperty('targetDomains')) {
//         return;
//       }
//       const matches = tab.url.match(/https*:\/\/([^\/]+).*/);
//       if (!matches) {
//         return;
//       }
//       const domain = data.targetDomains.find(e => e == matches[1]);
//       if (!domain) {
//         return;
//       }

//       console.log('Execute');
//       chrome.tabs.executeScript(tabId, {file: 'core/effect.js'});
//     });
//   }
// });
