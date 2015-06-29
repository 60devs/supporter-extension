var onTabChange = (tab) => {
    var host = tab.url.split("://")[1],
        tabId = tab.id;
    
    if(/^(github|stackoverflow|gitter|tips\.60devs)/.test(host))
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

chrome.pageAction.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {
        action: "pageActionClick"
    });
});