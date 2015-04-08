'use strict';
/*global chrome: false */

/* TODO

    - review code
    - optimize
    - at first ctrl-tab, back should be called
    - what is happening if I have only 1 tab?
    - deal with remove window action

*/

var h = require('./history-tab.js');

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
    h.push(active);
});

chrome.tabs.onRemoved.addListener(function(tabId, infos) {
    var removedTab = {
        tabId: tabId,
        windowId: infos.windowId
    };
    h.remove(removedTab);
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
	chrome.windows.getCurrent(function(win) {
		h.remove({
			tabId: removedTabId,
			windowId: win.id
		});
	});
});

// listen for command Ctrl+Tab
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'switch_tab_history') {
        chrome.windows.getCurrent({
            populate: true
        }, function(win) {
            var hystoryWin = h.back(win.id);
            if (win && win.id && hystoryWin) {
                showTabList(win, hystoryWin);
            }
        });
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type === 'activateTab') {
        var toBeActivated = h.activateHighlighted(sender.tab.windowId);
        activateTab(toBeActivated);
    }
});