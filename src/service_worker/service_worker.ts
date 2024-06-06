const createNotification = () => {
  console.log("Creating notification from background");
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "actions-icon.png",
      title: "Repository Notification",
      message: "Notification triggered from content script",
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log(`Notification created with ID: ${notificationId}`);
      }
    }
  );
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "createNotification") {
    createNotification();
    sendResponse({ status: "notification created" });
  }
});
