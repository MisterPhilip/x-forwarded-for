(() => {
    let defaultSettings = {
            spoofIp: '',
            previous: [],
            headers: ['X-Forwarded-For']
        },
        settings = Object.assign({}, defaultSettings),
        allowedHeaders = ['X-Forwarded-For', 'X-Originating-IP', 'X-Remote-IP', 'X-Remote-Addr'],
        timeout = null,
        el = {
            'ip': document.getElementById('ip'),
            'clear': document.getElementById('clear'),
            'status': document.getElementById('status'),
            'form': document.getElementById('form'),
            'app': document.getElementById('app'),
            'prev': document.getElementById('prev'),
            'headers': [...document.querySelectorAll(`[name="headers[]"]`)]
        },
        methods = {
            'saveOptions': () => {
                console.log('save options called');
                let ip = (el.ip.value || "").trim();
                if (methods.checkIp(ip) && ip !== settings.spoofIp) {
                    let message = 'IP Address ' + ((ip === '') ? 'Cleared' : 'Updated'),
                        newSettings = {
                            spoofIp: ip,
                            previous: settings.previous || [],
                            headers: settings.headers
                        };
                    if (settings.spoofIp && !/^(null|unset)$/i.test(settings.spoofIp) && !newSettings.previous.includes(settings.spoofIp)) {
                        newSettings.previous.unshift(settings.spoofIp);
                    }
                    newSettings.previous = newSettings.previous.slice(0, 3);
                    methods.setSettings(newSettings, () => {
                        methods.setStatus(message, true);
                        methods.setPrevious(newSettings.previous);
                    });
                }
                else if (ip === settings.spoofIp) {
                    methods.setStatus();
                }
                else {
                    let message = 'Invalid IP Address' + (settings.spoofIp ? ', defaulting to ' + settings.spoofIp : '');
                    methods.setStatus(message, false, false);
                }
            },
            'checkIp': (ipVal) => {
                return ipVal === '' ||
                        /^(null|unset)$/i.test(ipVal) ||
                        ipVal.split(/[ ,]+/).every((ipAddress) => {
                            return checkIp(ipAddress);
                        });
            },
            'loadOptions': () => {
                methods.getSettings((items) => {
                    console.log("loadOptions", items);
                    settings = Object.assign(settings, items);

                    el.ip.value = items.spoofIp;

                    settings.headers.forEach(header => {
                        let el = document.querySelector(`[name="headers[]"][value=${header}]`);
                        el.checked = true;
                        el.readOnly = (settings.headers.length === 1);
                    });

                    methods.setPrevious(settings.previous);
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
            'submitForm': (ev) => {
                ev.preventDefault();
                this.saveOptions();
            },
            'setClass': (success = null) => {
                let classList = el.app.classList;
                const CLASS_ERROR = 'error',
                    CLASS_SUCCESS = 'success';

                classList.remove(CLASS_SUCCESS, CLASS_ERROR);
                if (success === true) {
                    classList.add(CLASS_SUCCESS);
                }
                else if (success === false) {
                    classList.add(CLASS_ERROR);
                }
            },
            'setStatus': (msg = '', success = null, duration = 2500) => {
                el.status.textContent = msg;
                methods.setClass(success);
                clearTimeout(timeout);
                if (duration) {
                    timeout = setTimeout(() => {
                        methods.clearMessage();
                        methods.setClass();
                    }, duration);
                }
            },
            'setPrevious': (previous = []) => {
                while (el.prev.firstChild) {
                    el.prev.removeChild(el.prev.firstChild);
                }
                previous.forEach((prev) => {
                    let li = document.createElement('li'),
                        a = document.createElement('a');
                    a.innerText = prev;
                    li.appendChild(a);
                    el.prev.appendChild(li);
                });
            },
            'loadPreviousIp': (ev) => {
                ev.preventDefault();
                if (ev.target.tagName !== 'A') {
                    return;
                }
                let newIp = ev.target.innerText;
                if (methods.checkIp(newIp)) {
                    el.ip.value = newIp;
                    methods.saveOptions();
                }
            },
            'getSettings': (cb) => {
                browser.storage.sync.get(defaultSettings).then(cb);
            },
            'setSettings': (values, cb) => {
                browser.storage.sync.set(values).then(cb);
                settings = values;
            },
            'saveHeaders': () => {
                console.log("save headers");
                let newSettings = {
                    spoofIp: settings.spoofIp,
                    previous: settings.previous || [],
                    headers: el.headers.filter(checkbox => checkbox.checked && allowedHeaders.includes(checkbox.value)).map(checkbox => checkbox.value)
                };
                methods.setSettings(newSettings);
            }
        };

    // Default event listeners
    document.addEventListener('DOMContentLoaded', methods.loadOptions);
    el.ip.addEventListener('keyup', methods.saveOptions);
    el.ip.addEventListener('blur', methods.saveOptions);
    el.prev.addEventListener('click', methods.loadPreviousIp);
    el.clear.addEventListener('click', methods.clearOptions);
    el.form.addEventListener('submit', methods.submitForm);
    el.headers.forEach(el => { el.addEventListener('change', methods.saveHeaders) });
})();
