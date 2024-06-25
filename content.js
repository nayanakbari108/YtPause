chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const video = document.querySelector('video');
  if (video) {
    if (request.action === "pauseVideo") {
      video.pause();
      sendResponse({result: "paused"});
    } else if (request.action === "playVideo") {
      video.play();
      sendResponse({result: "played"});
    }
  }
});