const ALARM_NAME = 'postureReminder';
const DEFAULT_INTERVAL = 30;

// On extension install or update
chrome.runtime.onInstalled.addListener(() => {
  // Set default interval and create alarm
  chrome.storage.local.get(['reminderInterval'], (result) => {
    const interval = result.reminderInterval || DEFAULT_INTERVAL;
    if (!result.reminderInterval) {
      chrome.storage.local.set({ reminderInterval: DEFAULT_INTERVAL });
    }
    createAlarm(interval);
  });
});

// On browser startup, restore alarm
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['reminderInterval'], (result) => {
    const interval = result.reminderInterval || DEFAULT_INTERVAL;
    createAlarm(interval);
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateAlarm') {
    createAlarm(message.minutes);
  }
});

// Handle alarm trigger
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    showNotification();
  }
});

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);
});

function createAlarm(minutes) {
  // Clear existing alarm and create new one
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: minutes,
      periodInMinutes: minutes
    });
  });
}

function showNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: "Don't be a shrimp",
    message: 'Sit straight! 🦐',
    priority: 2
  });
}
