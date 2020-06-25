(function () {
    let settings = {
        spoofIp: '',
        previous: [],
        headers: ['X-Forwarded-For']
    };
    browser.storage.sync.get(settings).then((loadedSettings) => {
        settings = loadedSettings;
        setBadge(settings.spoofIp);
    });
    browser.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            if (settings.spoofIp) {
                console.log("browser settings", settings);
                settings.headers.forEach(headerName => {
                    let index = details.requestHeaders.findIndex((el) => {
                        return (el.name === headerName)
                    });
                    if (index > -1) {
                        details.requestHeaders[index].value = settings.spoofIp;
                    } else {
                        details.requestHeaders.push({
                            'name': headerName,
                            'value': settings.spoofIp
                        });
                    }
                });
            }
            return { requestHeaders: details.requestHeaders };
        },
        { urls: ['<all_urls>'] },
        ['blocking', 'requestHeaders', 'extraHeaders']
    );
    browser.storage.onChanged.addListener((changes, namespace) => {
        console.log("storage changed", changes);
        Object.entries(changes).forEach(([key, { newValue }]) => {
            settings[key] = newValue;
            if (key === 'spoofIp') {
                spoofIp = changes['spoofIp'].newValue;
                setBadge(spoofIp);
            }
        })
    });
    function setBadge(spoofIp) {
        if (spoofIp) {
            browser.browserAction.setIcon({ path: 'assets/logo-38.png' });
            browser.browserAction.setTitle({ title: 'Spoofing ' + spoofIp });
        } else {
            browser.browserAction.setIcon({ path: 'assets/logo-38-bw.png' });
            browser.browserAction.setTitle({ title: 'Currently not spoofing any IP Address. Click to set IP.' });
        }
    }
})();
