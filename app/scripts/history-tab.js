(function() {
    var History = {};

    function _getWindow(winId) {
        if (!History.hasOwnProperty(winId)) {
            History[winId] = {
                tabs: []
            };
        }
        return History[winId];
    }

    function _removeWindow(winId) {
        if (History[winId]) {
            delete History[winId];
        }
    }

    function _pointPrevious(hWin) {
        if (!hWin.hasOwnProperty('highlighted')) {
            hWin.highlighted = (hWin.tabs.length === 1) ? 0 : hWin.tabs.length - 2;
        } else {
            hWin.highlighted = (hWin.tabs.length - 1 + hWin.highlighted) % hWin.tabs.length;
        }
        return hWin;
    }

    function _pushToTop(hWin, tabId) {
        _removeTab(hWin, tabId);
        hWin.tabs.push(tabId);
        return hWin;
    }

    function _removeTab(hWin, tabId) {
        var tabs = hWin.tabs;
        if (tabs.indexOf(tabId) >= 0) {
            tabs.splice(tabs.indexOf(tabId), 1);
        }
        return hWin;
    }

    module.exports = {
        push: function(tab) {
            var hWin = _getWindow(tab.windowId);
            // avoid re-adding to history the tab restored just now
            if (hWin[hWin.length - 1] !== tab.tabId) {
                _pushToTop(hWin, tab.tabId);
            }
            return hWin;
        },
        back: function(winId) {
            var hWin = _getWindow(winId);
            return _pointPrevious(hWin);
        },
        activateHighlighted: function(winId) {
            var hWin = _getWindow(winId);
            var toBeActivated = hWin.tabs[hWin.highlighted];
            delete hWin.highlighted;
            return toBeActivated;
        },
        clear: function(winId) {
            if (winId) {
                _removeWindow(winId);
            } else {
                History = {};
            }
            return History;
        },
        remove: function(tab) {
            if (tab) {
                var hWin = _getWindow(tab.windowId);
                _removeTab(hWin, tab.tabId, true);
                if (hWin.tabs.length === 0) {
                    _removeWindow(tab.windowId);
                }
                return History[tab.windowId];
            }
        }
    };
})();