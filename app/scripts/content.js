/*TODO

	- remove jquery and handlebars, too heavy

*/

var listInPage = false;

function tabsList(tabs) {
	console.log('show tablist!');

	var $container = $('body > ul.history-tabs');

	if (!$container.length) {
		var $container = $('<ul />').addClass('history-tabs');
		$('body').append($container);
	}

	$container.html(templateList(tabs));
	listInPage = true;
};

function removeTabsList() {
	$('body > ul.history-tabs').remove();
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