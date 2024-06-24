// background.js

// Function to pause video in a tab
function pauseVideoInTab(tabId) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const video = document.querySelector('video');
        if (video) {
          video.pause();
        }
      }
    }).then(() => {
      console.log(`Video paused in tab ${tabId}`);
    }).catch((error) => {
      console.error(`Error pausing video in tab ${tabId}: ${error.message}`);
    });
  }
  
  // Listener for tab activation changes
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(`Error getting tab: ${chrome.runtime.lastError.message}`);
        return; // Stop execution if there was an error getting the tab
      }
      
      if (tab && tab.url.includes("youtube.com")) {
        pauseVideoInTab(tab.id);
      }
    });
  });
  
  // Listener for tab updates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab && tab.url.includes("youtube.com")) {
      pauseVideoInTab(tabId);
    }
  });
  