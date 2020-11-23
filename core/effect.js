// $x("//div[contains(text(), '-')]").filter((e) => /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/.test(e.innerText)).map((e) => e.style.filter = "blur(5px)");

writeLog = (message) => {
  console.log(`[hide-uuid-ext info]: ${message}`);
}

setUUIDElementsBlur = (maxCount = 80, delayMillseconds = 20, maxFoundCount = 4) => {
  return new Promise((resolve, reject) => {
    let count = 0;
    const intervalId = window.setInterval(() => {
      if (maxCount <= count++) {
        window.clearInterval(intervalId);
        reject(`Not found uuid within the trial count limit(${maxCount}).`);
      }
      const expression = "(//div|//span|//code)[text()[contains(., '-')]][not(contains(@style, 'blur'))]";
      const targets = document.evaluate(expression, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE);
      if (targets.snapshotLength > 0) {
        let found = maxFoundCount;
        for (i = 0; i < targets.snapshotLength; i++) {
          const el = targets.snapshotItem(i);
          if (/.*[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}.*/.test(el.innerText)) {
            el.style.filter = "blur(5px)";
            found--;
          }
        }
        if (found <= 0) {
          writeLog('Found uuid and masked it.');
          window.clearInterval(intervalId);
          resolve();
        }
      }
    }, delayMillseconds);
  });
}

setUUIDElementsBlur()
  .catch(e => writeLog(e));
