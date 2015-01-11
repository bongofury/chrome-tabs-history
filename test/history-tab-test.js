var test = require('tape');
var history = require('../app/scripts/history-tab.js');

var win1 = {
	id: 1
},
win2 = {
	id: 2
},
tab1 = {
	tabId: 111,
	windowId: win1.id
},
tab2 = {
	tabId: 112,
	windowId: win1.id
},
tab3 = {
	tabId: 121,
	windowId: win2.id
};

test('exists', function(t) {
	t.ok(history, 'history object ok');
	t.end();
});

test('clear', function(t) {
	t.plan(3);

	t.deepEquals(history.clear(), {}, 'whole history cleared');

	history.push(tab1);
	history.push(tab2);
	history.push(tab3);
	var expected = {};
	expected[tab3.windowId] = {tabs: [tab3.tabId]}; 

	t.deepEquals(history.clear(win1.id), expected, 'history window cleared');
	t.deepEquals(history.clear(win2.id), {}, 'last history window cleared');

});


test('push', function(t){
	t.plan(10);

	history.clear();
	var win = history.push(tab1);

	t.ok(win, 'window created');
	t.ok(win.tabs, 'tabs created');
	t.equal(win.tabs.length, 1, 'tabs length is correct');
	t.equal(win.tabs[0], tab1.tabId, 'tabs contains the correct tab');
	
	win = history.push(tab2);

	t.equal(win.tabs.length, 2, 'pushed another, tabs length is correct');
	t.equal(win.tabs[0], tab1.tabId, 'tabs contains the correct tab');
	t.equal(win.tabs[1], tab2.tabId, 'tabs contains the correct tab');
	
	win = history.push(tab1);

	t.equal(win.tabs.length, 2, 'pushed tabs already contained, tabs length is correct');
	t.equal(win.tabs[0], tab2.tabId, 'tabs contains the correct tab');
	t.equal(win.tabs[1], tab1.tabId, 'tabs contains the correct tab');
});

test('back', function(t) {
	t.plan(6);

	history.clear();
	history.push(tab1);
	history.push(tab2);
	history.push(tab1);
	var win = history.back(win1.id);

	t.equal(win.tabs.length, 2, 'go back, tabs length is correct');
	t.equal(win.highlighted, 1, 'prev tab is highlighted');
	
	win = history.back(win1.id);

	t.equal(win.tabs.length, 2, 'back again, tabs length is correct');
	t.equal(win.highlighted, 0, 'prev tab is highlighted');

	win = history.back(win1.id);

	t.equal(win.tabs.length, 2, 'back again, tabs length is correct');
	t.equal(win.highlighted, 1, 'prev tab is highlighted');
});

test('activate', function(t) {
	t.plan(2);

	history.clear();
	history.push(tab1);
	history.push(tab2);
	history.push(tab1);
	history.back(win1.id);
	var toBeActivated = history.activateHighlighted(win1.id);

	t.equal(toBeActivated, tab1.tabId, 'back once then activate, correct tab activated');
	t.throws(history.activateHighlighted(win1.id), 'call activate without calling back first, throws an error \'cause highlighted pointer is not set');
});