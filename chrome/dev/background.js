var onTabChange = (tab) => {
    var host = tab.url.split("://")[1],
        tabId = tab.id;
    
    if(/^(gitter|stackoverflow)/.test(host))
        chrome.pageAction.show(tabId);
    else
        chrome.pageAction.hide(tabId);
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, onTabChange);
});

chrome.tabs.onUpdated.addListener((tabId, changedInfo, tab) => {
    onTabChange(tab);
});