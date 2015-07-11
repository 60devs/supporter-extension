/* globals chrome */

var onTabChange = function(tab) {
  var host = tab.url.split('://')[1]
  var tabId = tab.id;

  if (/^(github|stackoverflow|gitter|tips\.60devs)/.test(host)) {
    chrome.pageAction.show(tabId);
  } else {
    chrome.pageAction.hide(tabId);
  }
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, onTabChange);
});

chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
  onTabChange(tab);
});

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {
    action: 'pageActionClick'
  });
});
