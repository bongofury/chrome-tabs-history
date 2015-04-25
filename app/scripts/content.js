'use strict';
/* global chrome: false, Handlebars: false */

/*TODO

	- remove handlebars, too heavy

	*/

(function() {

	var _listInPage = false;
	var _CONTAINER = {
		tag: 'ul',
		id: 'chrome-ext-history-tabs',
		childClass: 'tab',
		highlightedChildClass: 'highlighted'
	};

	function tabsList(tabs) {
		console.log('show tablist!');

		var container = document.getElementById(_CONTAINER.id);

		if (!container) {
			container = document.createElement(_CONTAINER.tag);
			container.id = _CONTAINER.id;
			document.body.appendChild(container);
		}

		container.innerHTML = templateList(tabs);
		_listInPage = true;
	}

	function removeTabsList() {
		var container = document.getElementById(_CONTAINER.id);
		if (!!container) {
			container.parentNode.removeChild(container);
		}
		_listInPage = false;
	}

	function templateList(tabs) {
		var source = '{{#each this}}<li class="' + _CONTAINER.childClass + '  {{#if _highlighted}}' + _CONTAINER.highlightedChildClass + '{{/if}}">{{title}}</li>{{/each}}';
		var template = Handlebars.compile(source);
		console.log(tabs);
		var html = template(tabs);

		return html;
	}

	(function listenForCtrlRelease() {
		window.addEventListener('keyup', function(e) {
			if (e.keyCode === 17 && _listInPage) {
				console.log('remove list');
				removeTabsList();
				chrome.runtime.sendMessage({
					type: 'activateTab'
				});
			}
		});
	})();

	// listen for messages
	chrome.runtime.onMessage.addListener(function(msg) {
		// if the received message has the expected format...
		if (msg.type && (msg.type === 'showTabList')) {
			tabsList(msg.tabs);
		}
	});
})();