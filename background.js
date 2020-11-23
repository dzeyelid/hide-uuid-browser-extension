// Create the SetIcon instance at first, because avoid a bug discussed 
// in this issue https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon.
const setIcon = new chrome.declarativeContent.SetIcon({path: {
  16: "images/16x16.png",
  24: "images/24x24.png",
  32: "images/32x32.png"
}});

function loadTargetDomains() {
  chrome.permissions.getAll((permissions) => {
    let conditions = [];
    permissions.origins.forEach((origin) => {
      conditions.push(
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            originAndPathMatches: origin,
          },
        }),
      );
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions,
        actions: [
          setIcon,
        ],
      }]);
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status == 'complete' && tab.url) {
        const matches = tab.url.match(/(https*:\/\/[^\/]+).*/);
        if (!matches) {
          return;
        }
        chrome.permissions.contains(
          {origins: [`${matches[1]}/*`]},
          (enabled) => {
            if (enabled) {
              chrome.tabs.executeScript(tabId, {
                file: 'core/effect.js',
                runAt: 'document_end',
              });
            }
          }
        );
      }
    });
  });
}

chrome.permissions.onAdded.addListener((permissions) => {
  loadTargetDomains();
});

chrome.permissions.onRemoved.addListener((permissions) => {
  loadTargetDomains();
});

chrome.runtime.onInstalled.addListener(() => {
  loadTargetDomains();
});
