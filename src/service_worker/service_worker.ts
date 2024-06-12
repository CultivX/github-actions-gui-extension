chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ running_workflow_list: [] });
});

const createNotification = (runName, conclusion) => {
  chrome.storage.sync.get(["notification_level"], (result) => {
    console.log(result.notification_level);

    if (result.notification_level && result.notification_level !== 3) {
      chrome.notifications.create(
        {
          type: "basic",
          iconUrl: "actions-icon.png",
          title: "Workflow runs completed",
          message: `${runName} workflow runs ${conclusion}, please have a look.`,
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
    createNotification(params.runName, params.conclusion);
    sendResponse({ status: "notification creating" });
  }
});
