/* global chrome: false, Handlebars: false */

/*TODO

	- remove handlebars, too heavy
	- style tab list

*/

var listInPage = false;
var containerProps = {
	tag: 'ul',
	id: 'chrome-ext-history-tabs'
};

function tabsList(tabs) {
	console.log('show tablist!');

	var container = document.getElementById(containerProps.id);

	if (!container) {
		container = document.createElement(containerProps.tag);
		container.id = containerProps.id;
		document.body.appendChild(container);
	}

	container.innerHTML = templateList(tabs);
	listInPage = true;
}

function removeTabsList() {
	var container = document.getElementById(containerProps.id);
	if (!!container) {
		container.parentNode.removeChild(container);
	}
	listInPage = false;
}

function templateList(tabs) {
	var source   = '{{#each this}}<li class="tab {{#if _highlighted}}highlighted{{/if}}">{{title}}</li>{{/each}}';
	var template = Handlebars.compile(source);
	console.log(tabs);
	var html = template(tabs);

	return html;
}

(function listenForCtrlRelease() {
    window.addEventListener('keyup', function(e) {
        if (e.keyCode === 17 && listInPage) {
            console.log('remove list');
            removeTabsList();
            chrome.runtime.sendMessage({type: 'activateTab'}, function(response) {
            	console.log(response.farewell);
            });
        }
    });
})();

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.type && (msg.type === 'showTabList')) {
        tabsList(msg.tabs);
    }
});