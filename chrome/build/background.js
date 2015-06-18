"use strict";

var onTabChange = function onTabChange(tab) {
    var host = tab.url.split("://")[1],
        tabId = tab.id;

    if (/^(gitter|stackoverflow)/.test(host)) chrome.pageAction.show(tabId);else chrome.pageAction.hide(tabId);
};

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, onTabChange);
});

chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {
    onTabChange(tab);
});