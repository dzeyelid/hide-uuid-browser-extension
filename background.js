// Create the SetIcon instance at first, because avoid a bug discussed 
// in this issue https://stackoverflow.com/questions/28750081/cant-pass-arguments-to-chrome-declarativecontent-seticon.
const setIcon = new chrome.declarativeContent.SetIcon({path: {
  16: "images/16x16.png",
  24: "images/24x24.png",
  32: "images/32x32.png"
}});

function loadTargetDomains(permissions = {}) {
  let conditions = [];
  permissions.origins.forEach((origin) => {
    const matches = origin.match(/https*:\/\/([^\/]+).*/);
    if (matches) {
      conditions.push(
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: matches[1],
          },
        }),
      );  
    }
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions,
      actions: [
        setIcon,
      ],
    }]);
  });
}

chrome.permissions.onAdded.addListener((permissions) => {
  loadTargetDomains(permissions);
});

chrome.permissions.onRemoved.addListener((permissions) => {
  loadTargetDomains(permissions);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.permissions.getAll((permissions) => {
    loadTargetDomains(permissions);
  });
});

chrome.webNavigation.onCompleted.addListener((details) => {
  const matches = details.url.match(/(https*:\/\/[^\/]+).*/);
  if (!matches) {
    return;
  }
  chrome.permissions.contains({origins: [`${matches[1]}/*`]},
    (enabled) => {
      if (enabled) {
        chrome.tabs.executeScript(details.tabId, {
          file: 'core/effect.js',
          runAt: 'document_end',
        });
      }
    }
  );
});
