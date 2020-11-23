// Create the SetIcon instance at first, because avoid a bug discussed 
// in this issue https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon.
const setIcon = new chrome.declarativeContent.SetIcon({path: {
  16: "images/16x16.png",
  24: "images/24x24.png",
  32: "images/32x32.png"
}});

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
        actions: [
          new chrome.declarativeContent.ShowPageAction(),
          setIcon,
          new chrome.declarativeContent.RequestContentScript({
            js: [
              'core/effect.js',
            ],
          }),
        ],
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
