let lastActiveTabId = null;
let lastActiveTabUrl = null;
let videoWasPaused = false;

// Function to pause video in a tab
function pauseVideoInTab(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      const video = document.querySelector('video');
      if (video) {
        video.pause();
        return true;
      }
      return false;
    }
  }).then((result) => {
    if (result && result[0] && result[0].result) {
      console.log(`Video paused in tab ${tabId}`);
    }
  }).catch((error) => {
    console.error(`Error pausing video in tab ${tabId}: ${error.message}`);
  });
}

// Function to play video in a tab
function playVideoInTab(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      const video = document.querySelector('video');
      if (video) {
        video.play();
        return true;
      }
      return false;
    }
  }).then((result) => {
    if (result && result[0] && result[0].result) {
      console.log(`Video played in tab ${tabId}`);
    }
  }).catch((error) => {
    console.error(`Error playing video in tab ${tabId}: ${error.message}`);
  });
}

// Listener for tab activation changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (lastActiveTabId !== null) {
    chrome.tabs.get(lastActiveTabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(`Error getting tab: ${chrome.runtime.lastError.message}`);
        return;
      }
      
      if (tab && tab.url.includes("youtube.com")) {
        pauseVideoInTab(lastActiveTabId);
        videoWasPaused = true;
      }
    });
  }

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(`Error getting tab: ${chrome.runtime.lastError.message}`);
      return;
    }

    if (tab && tab.url.includes("youtube.com") && videoWasPaused) {
      playVideoInTab(activeInfo.tabId);
      videoWasPaused = false;
    }

    lastActiveTabId = activeInfo.tabId;
    lastActiveTabUrl = tab.url;
  });
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes("youtube.com")) {
    if (tabId === lastActiveTabId && videoWasPaused) {
      playVideoInTab(tabId);
      videoWasPaused = false;
    }
  }
});
