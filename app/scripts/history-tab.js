(function() {
    var History = {};

    function _getWindow(winId) {
        if (!History.hasOwnProperty(winId)) {
            History[winId] = {
                tabs: []
            };
            /*-- remove for production --*/
            // listenDev(History[winId]);
            /*-- end remove for production --*/
        }
        return History[winId];
    }

    function _removeWindow(winId) {
        if (History[winId]) {
            delete History[winId];
        }
    }

    function _pointPrevious(win) {
        if (!win.hasOwnProperty('highlighted')) {
            win.highlighted = win.tabs.length - 1;
        } else {
            win.highlighted = (win.tabs.length - 1 + win.highlighted) % win.tabs.length;
        }
        return win;
    }
    
    function _pushToTop(win, tab) {
        var tabs = win.tabs;
        if (tabs.indexOf(tab) >= 0) {
            tabs.splice(tabs.indexOf(tab), 1);
        }
        tabs.push(tab);
    }

    /*-- remove for production --*/
    // function listenDev(array) {
    //     Array.observe(array, function() {
    //         console.log(array, ' -- len: ', array.length);
    //     });
    // }
    /*-- end remove for production --*/

    module.exports = {
        push: function(tab) {
            var win = _getWindow(tab.windowId);
            // avoid re-add to history the tab restored just now
            if (win[win.length - 1] !== tab.tabId) {
                _pushToTop(win, tab.tabId);
            }
            return win;
        },
        back: function(winId) {
            var win = _getWindow(winId);
            return _pointPrevious(win);
        },
        activateHighlighted: function(winId) {
            var win = _getWindow(winId);
            var toBeActivated = win.tabs[win.highlighted];
            delete win.highlighted;
            return toBeActivated;
        },
        clear: function(winId) {
            if (winId) {
                _removeWindow(winId);
            } else {
                History = {};
            }
            return History;
        }    
    };

})();