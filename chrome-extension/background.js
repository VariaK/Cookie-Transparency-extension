chrome.runtime.onInstalled.addListener(() => {
  console.log("Cookie Transparency extension installed.");
});

// Listen for tab updates and get cookies
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab &&
    tab.url &&
    tab.url.startsWith("http")
  ) {
    chrome.cookies.getAll({ url: tab.url }, (cookies) => {
      console.log(`Cookies for ${tab.url}:`, cookies);

      chrome.runtime.sendMessage({
        type: "COOKIE_UPDATE",
        url: tab.url,
        cookies: cookies,
      });
    });
  }
});

// respond to messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_COOKIES") {
    chrome.cookies.getAll({ url: request.url }, (cookies) => {
      sendResponse({ cookies: cookies });
    });
    return true; // Keeps the message channel open for async response
  }
});
