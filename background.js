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

// Listener for window focus changes within Chrome
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window is unfocused, pause video in last active tab if it's a YouTube video
    if (lastActiveTabId !== null && lastActiveTabUrl && lastActiveTabUrl.includes("youtube.com")) {
      pauseVideoInTab(lastActiveTabId);
      videoWasPaused = true;
    }
  } else {
    // Window is focused, check if the last active tab is a YouTube video
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        if (activeTab.url && activeTab.url.includes("youtube.com")) {
          // If the video was paused and now the window is focused again, play the video
          if (videoWasPaused) {
            playVideoInTab(activeTab.id);
            videoWasPaused = false;
          }
        }
        lastActiveTabId = activeTab.id;
        lastActiveTabUrl = activeTab.url;
      }
    });
  }
});
