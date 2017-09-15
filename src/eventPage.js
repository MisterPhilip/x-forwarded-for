(function() {
    let spoofIp = '';
    browser.storage.sync.get({
        spoofIp: ''
    }).then((settings) => {
        spoofIp = settings.spoofIp;
        setBadge(spoofIp);
    });
    browser.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            if (spoofIp)
            {
                let index = details.requestHeaders.findIndex((el) => {
                    return (el.name === 'X-Forwarded-For')
                });
                if(index > -1)
                {
                    details.requestHeaders[index].value = spoofIp;
                }
                else
                {
                    details.requestHeaders.push({
                        'name': 'X-Forwarded-For',
                        'value': spoofIp
                    });
                }
            }
            return {requestHeaders: details.requestHeaders};
        },
        {urls: ['<all_urls>']},
        ['blocking', 'requestHeaders']
    );
    browser.storage.onChanged.addListener((changes, namespace) => {
        if (typeof changes['spoofIp'] === 'object')
        {
            spoofIp = changes['spoofIp'].newValue;
            setBadge(spoofIp);
        }
    });
    function setBadge(spoofIp)
    {
        if(spoofIp) {
            browser.browserAction.setBadgeBackgroundColor({color: [0, 136, 0, 150]});
            browser.browserAction.setBadgeText({text: 'IP'});
            browser.browserAction.setTitle({title: 'Spoofing ' + spoofIp});
        } else {
            browser.browserAction.setBadgeText({text: ''});
            browser.browserAction.setTitle({title: 'Currently not spoofing any IP Address. Click to set IP.'});
        }
    }
})();