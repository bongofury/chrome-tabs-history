/*global chrome: false */

/* TODO
    
    - review code
    - tests
    - optimize

*/

var historyTab = (function() {
    var History = {};

    function getWindow(winId) {
        if (!History.hasOwnProperty(winId)) {
            History[winId] = {
                tabs: []
            };
            /*-------*/
            listenDev(History[winId]);
            /*-------*/
        }
        return History[winId];
    }

    function pointerBack(win) {
        if (!win.hasOwnProperty('highlighted')) {
            win.highlighted = win.tabs.length - 1;
        } else {
            win.highlighted = (win.tabs.length - 1 + win.highlighted) % win.tabs.length;
        }
        return win;
    }


    /*-----------------*/
    function listenDev(array) {
        Array.observe(array, function() {
            console.log(array, ' -- len: ', array.length);
        });
    }
    /*-----------------*/

    return {
        pushToTop: function(win, tab) {
            var tabs = win.tabs;
            if (tabs.indexOf(tab) >= 0) {
                tabs.splice(tabs.indexOf(tab), 1);
            }
            tabs.push(tab);
        },
        push: function(tab) {
            var win = getWindow(tab.windowId);
            // avoid re-add to history the tab restored just now
            if (win[win.length - 1] !== tab.tabId) {
                this.pushToTop(win, tab.tabId);
            }
        },
        back: function(winId) {
            var win = getWindow(winId);
            return pointerBack(win);
        },
        onActivateRequest: function(winId) {
            var win = getWindow(winId);
            var toBeActivated = win.tabs[win.highlighted];
            delete win.highlighted;
            return toBeActivated;
        },
        clear: function() {
            History = {};
        },
        getWindow: getWindow
    };

})();

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
            type: "showTabList",
            tabs: inHistoryTabs
        });
    });
}

// when a new tab is selected, the history is updated
chrome.tabs.onActivated.addListener(function(active) {
    historyTab.push(active);
    console.info('adding to the tab stack: ' + active.windowId + ' -- ' + active.tabId);
});

// listen for command Ctrl+Tab
chrome.commands.onCommand.addListener(function(command) {
    chrome.windows.getCurrent(function(win) {
        if (win && win.id) {
            if (command === 'switch_tab_history') {
                var historyWin = historyTab.back(win.id);
                showTabList(historyWin);
            }
        }
    });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'activateTab') {
        console.log('activate from win ' + sender.tab.windowId);
        var toBeActivated = historyTab.onActivateRequest(sender.tab.windowId);
        activateTab(toBeActivated);
    }
});