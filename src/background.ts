chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAFUW_OPEN_POPUP" && sender.tab?.id) {
    chrome.storage.local.set(
      {
        sourceTabId: sender.tab.id,
        ...message,
      },
      () => {
        chrome.action.openPopup();
      }
    );
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(["sourceTabId"], (result) => {
    if (result.sourceTabId === tabId) {
      chrome.storage.local.remove(["pendingTransaction", "sourceTabId"]);
    }
  });
});
