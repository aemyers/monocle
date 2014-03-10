// chrome.tabs.onUpdated.addListener(function(id, info, tab){
//     chrome.pageAction.show(tab.id);
// });

function loadScript(script, callback) {
    var el = document.createElement('script');
    el.src = chrome.extension.getURL(script);
    el.addEventListener('load', callback, false);
    document.head.appendChild(el);
}
loadScript('common/user_settings.js', function () {
    loadSettings(function () {
        toggleAuto();
    });
});

// ---------------------------------------------------------------------
function toggleAuto() {
    window.USER_SETTINGS['last_auto_status'] =
        window.USER_SETTINGS['last_auto_status']
        ? false : true;
    updateAuto();
}
function updateAuto() {
    if (window.USER_SETTINGS['last_auto_status']) {
        turnAutoOn();
        trackEvent({'name': 'option', 'detail': 'auto_status.on'});
    } else {
        turnAutoOff();
        trackEvent({'name': 'option', 'detail': 'auto_status.off'});
    }
}
function turnAutoOn() {
    chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 0]});
    chrome.browserAction.setBadgeText({text:"on"});
    updateSetting('last_auto_status', true);
}
function turnAutoOff() {
    chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
    chrome.browserAction.setBadgeText({text:"off"});
    updateSetting('last_auto_status', false);
}

// ---------------------------------------------------------------------

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    switch(request.msg) {
        case "snapshot":
            cbSnapshot(callback);
        case "track":
            trackEvent(request);
        break;
    }
    return true;
});

function cbSnapshot(callback) {
    chrome.tabs.captureVisibleTab(null, function(dataUrl) {
        callback(dataUrl);
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    if (window.USER_SETTINGS['button_functionality'] === 'advanced') {
        toggleAuto();
    } else {
        chrome.tabs.sendMessage(tab.id, {msg: 'basic'});
    }
    trackEvent({'name': 'input', 'detail': 'mouse'});

});

chrome.commands.onCommand.addListener(function(command) {
    switch(command) {
        case "basic-snapshot":
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {msg: 'basic'});
            });
            break;
        case "refined-snapshot":
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {msg: 'refined'});
            });
            break;
    }
    trackEvent({'name': 'input', 'detail': 'keyboard'});
});

// ---------------------------------------------------------------------

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-1108382-9']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

/**
 * Track a click on a button using the asynchronous tracking API.
 *
 * See http://code.google.com/apis/analytics/docs/tracking/asyncTracking.html
 * for information on how to use the asynchronous tracking API.
 */
function trackEvent(eventMeta) {
    console.log(eventMeta);
    if (eventMeta.detail) {
        _gaq.push(['_trackEvent', eventMeta.name, eventMeta.detail, '']);
    } else {
        _gaq.push(['_trackEvent', eventMeta.name, '', '']);
    }
}
