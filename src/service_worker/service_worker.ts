chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ running_workflow_list: [] });
});

const createNotification = (
  repoName,
  runName,
  conclusion,
  ownerName,
  runsId
) => {
  chrome.storage.sync.get(["notification_level"], (result) => {
    if (result.notification_level && result.notification_level !== 3) {
      chrome.notifications.create(
        repoName +
          "|" +
          runName +
          "|" +
          conclusion +
          "|" +
          ownerName +
          "|" +
          runsId,
        {
          type: "basic",
          iconUrl: "actions-icon.png",
          title: `${repoName} repo runs completed`,
          message: `${runName} workflow runs ${conclusion}, please have a look.`,
          buttons: [{ title: "View workflow" }],
        },
        (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            console.log(`Notification created with ID: ${notificationId}`);
          }
        }
      );
    }
  });
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "createNotification") {
    const params = message.params;
    createNotification(
      params.repoName,
      params.runName,
      params.conclusion,
      params.ownerName,
      params.runsId
    );
    sendResponse({ status: "notification creating" });
  }
});

chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
      const [repoName, , , ownerName, runsId] = notificationId.split("|");
      chrome.tabs.create({
        url: `https://github.com/${ownerName}/${repoName}/actions/runs/${runsId}`,
      });
    }
  }
);
