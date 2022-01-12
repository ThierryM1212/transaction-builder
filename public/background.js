/*global chrome*/
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome extension successfully installed!');
  return;
});

chrome.browserAction.onClicked.addListener(function(tab){
  console.log("chrome.browserAction.onClicked");
  chrome.tabs.create({
      'url': chrome.runtime.getURL("index.html")
  });
});
