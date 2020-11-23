function applyCurrentSettings() {
  let targetDomains = [];
  chrome.storage.sync.get('targetDomains', (data) => {
    if (data && data.hasOwnProperty('targetDomains')) {
      Array.prototype.push.apply(targetDomains, data.targetDomains);
      const field = document.getElementById('targetDomains');
      field.value = targetDomains.join(',');
    }
  });
}

function setListener() {
  let button = document.getElementById('saveTargetDomains');
  button.addEventListener('click', () => {
    const targetDomainsCSV = document.getElementById('targetDomains').value.split(/[\t\r\n\s]/).join('');
    const targetDomains = targetDomainsCSV.split(',');
    chrome.storage.sync.set({targetDomains, targetDomains}, () => {
      chrome.runtime.sendMessage({type: MESSAGE_TYPE_SHOULD_RELOAD_SETTINGS});
      showMessage('messageTargetDomains', 'Saved.');
      clearMessageDelay('messageTargetDomains', 2);
    })
  });
}

function showMessage(elementId, message) {
  const el = document.getElementById(elementId);
  el.innerText = message;
  el.classList.add('opacity-100');
}

function clearMessageDelay(elementId, seconds) {
  setTimeout((elementId) => {
    const el = document.getElementById(elementId);
    const classList = el.classList;
    classList.remove('opacity-100');
    classList.add('opacity-0');
    el.classList = classList;
  }, seconds * 1000, elementId);
}

applyCurrentSettings();
setListener();