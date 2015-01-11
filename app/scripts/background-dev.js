/*global chrome: false */

/* TODO
    
    - review code
    - tests
    - optimize

*/

var history = require('./history-tab.js');

function activateTab(tabId) {
    if (typeof tabId !== 'undefined') {
        console.log('activateTab ' + tabId);
        chrome.tabs.update(tabId, {
            'active': true,
            'highlighted': true
        });
    }
}

function showTabList(historyWin) {
    chrome.windows.getCurrent({
        populate: true
    }, function(win) {
        var activeTab = win.tabs.filter(function(tab) {
            return tab.active;
        });
        var inHistoryTabs = win.tabs.filter(function(tab) {
            return historyWin.tabs.indexOf(tab.id) !== -1;
        });

        inHistoryTabs.sort(function(a, b) {
            return historyWin.tabs.indexOf(a.id) - historyWin.tabs.indexOf(b.id);
        });

        inHistoryTabs[historyWin.highlighted]._highlighted = true;

        chrome.tabs.sendMessage(activeTab[0].id, {
            type: 'showTabList',
            tabs: inHistoryTabs
        });
    });
}

// when a new tab is selected, the history is updated
chrome.tabs.onActivated.addListener(function(active) {
    history.push(active);
    console.info('adding to the tab stack: ' + active.windowId + ' -- ' + active.tabId);
});

// listen for command Ctrl+Tab
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'switch_tab_history') {
        chrome.windows.getCurrent(function(win) {
            if (win && win.id) {
                showTabList(history.back(win.id));
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'activateTab') {
        var toBeActivated = history.activateHighlighted(sender.tab.windowId);
        activateTab(toBeActivated);
    }
});