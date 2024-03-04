chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("/repositories")) {
      const queryParameters = tab.url.split("/")[4];

      if (tab.status === 'complete') {
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          orgId: queryParameters,
        });
      }
    }
  });