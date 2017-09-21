(() => {
    let lastSavedIp = '',
        timeout = null,
        el = {
            'ip': document.getElementById('ip'),
            'clear': document.getElementById('clear'),
            'status': document.getElementById('status'),
            'app': document.getElementById('app'),
        },
        methods = {
            'saveOptions': () => {
                console.log('save options called');
                let ip = el.ip.value;
                if(methods.checkIp(ip) && ip !== lastSavedIp)
                {
                    let message = 'IP Address ' + ((ip === '') ? 'Cleared' : 'Updated');
                    methods.setSettings(ip, () => {
                        methods.setStatus(message, true);
                        lastSavedIp = ip;
                    });
                }
                else if(ip === lastSavedIp)
                {
                    methods.setStatus();
                }
                else
                {
                    let message = 'Invalid IP Address' + (lastSavedIp ? ', defaulting to ' + lastSavedIp : '');
                    methods.setStatus(message, false, false);
                }
            },
            'checkIp': (ipVal) => {
                return (ipVal === '' || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipVal));
            },
            'loadOptions': () => {
                methods.getSettings((items) => {
                    lastSavedIp = items.spoofIp;
                    el.ip.value = items.spoofIp
                });
            },
            'clearOptions': () => {
                el.ip.value = '';
                methods.saveOptions();
                return false;
            },
            'clearMessage': () => {
                el.status.textContent = '';
            },
            'setClass': (success = null) => {
                let classList = el.app.classList;
                const CLASS_ERROR = 'error',
                    CLASS_SUCCESS = 'success';

                classList.remove(CLASS_SUCCESS, CLASS_ERROR);
                if(success === true)
                {
                    classList.add(CLASS_SUCCESS);
                }
                else if(success === false)
                {
                    classList.add(CLASS_ERROR);
                }
            },
            'setStatus': (msg = '', success = null, duration = 2500) => {
                el.status.textContent = msg;
                methods.setClass(success);
                clearTimeout(timeout);
                if(duration) {
                    timeout = setTimeout(() => {
                        methods.clearMessage();
                        methods.setClass();
                    }, duration);
                }
            },
            'getSettings': (cb) => {
                browser.storage.sync.get({
                    spoofIp: ''
                }).then(cb);
            },
            'setSettings': (value, cb) => {
                browser.storage.sync.set({
                    spoofIp: value
                }).then(cb);
            }
        };

    // Default event listeners
    document.addEventListener('DOMContentLoaded', methods.loadOptions);
    el.ip.addEventListener('keyup', methods.saveOptions);
    el.ip.addEventListener('blur', methods.saveOptions);
    el.clear.addEventListener('click', methods.clearOptions);
})();