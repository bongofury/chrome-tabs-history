'use strict';
/*global chrome: false */

/* TODO

    - review code
    - optimize
    - at first ctrl-tab, back should be called
    - what is happening if I have only 1 tab?
    - deal with remove window action


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

function showTabList(currentWin, historyWin) {
    var activeTab = currentWin.tabs.filter(function(tab) {
        return tab.active;
    });
    var inHistoryTabs = currentWin.tabs.filter(function(tab) {
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
}

// when a new tab is selected, the history is updated
chrome.tabs.onActivated.addListener(function(active) {
    history.push(active);
    console.info('adding to the tab stack: ' + active.windowId + ' -- ' + active.tabId);
});

chrome.tabs.onRemoved.addListener(function(tabId, infos) {
    var removedTab = {
        tabId: tabId,
        windowId: infos.windowId
    };
    history.remove(removedTab);
});

// listen for command Ctrl+Tab
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'switch_tab_history') {
        chrome.windows.getCurrent({
            populate: true
        }, function(win) {
            var hystoryWin = history.back(win.id);
            if (win && win.id && hystoryWin) {
                showTabList(win, hystoryWin);
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type === 'activateTab') {
        var toBeActivated = history.activateHighlighted(sender.tab.windowId);
        activateTab(toBeActivated);
    }
});