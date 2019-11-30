'use strict';
// Modified https://github.com/sindresorhus/ip-regex
const v4 = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}';
const v6seg = '[a-fA-F\\d]{1,4}';
const v6 = `
(
(?:${v6seg}:){7}(?:${v6seg}|:)|                                // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
(?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)|                         // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
(?:${v6seg}:){5}(?::${v4}|(:${v6seg}){1,2}|:)|                 // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
(?:${v6seg}:){4}(?:(:${v6seg}){0,1}:${v4}|(:${v6seg}){1,3}|:)| // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
(?:${v6seg}:){3}(?:(:${v6seg}){0,2}:${v4}|(:${v6seg}){1,4}|:)| // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
(?:${v6seg}:){2}(?:(:${v6seg}){0,3}:${v4}|(:${v6seg}){1,5}|:)| // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
(?:${v6seg}:){1}(?:(:${v6seg}){0,4}:${v4}|(:${v6seg}){1,6}|:)| // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
(?::((?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))           // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
)(%[0-9a-zA-Z]{1,})?                                           // %eth0            %1
`.replace(/\s*\/\/.*$/gm, '').replace(/\n/g, '').trim();

function checkIp(ip) { let regex = new RegExp(`(?:^${v4}$)|(?:^${v6}$)`); return regex.test(ip); }
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
                return (
                    ipVal === ''
                    || /^(null|unset)$/i.test(ipVal)
                    || checkIp(ipVal)
                );
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
                newSettings = {
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
