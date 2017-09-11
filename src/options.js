function save_options()
{
    let ipElement = document.getElementById('ip'),
        status = document.getElementById('status'),
        ip = ipElement.value;

    const CLASS_ERROR = 'error';

    if(ip === '' || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip))
    {
        browser.storage.sync.set({
            spoofIp: ip
        }).then(() => {
            ipElement.classList.remove(CLASS_ERROR);
            status.classList.remove(CLASS_ERROR);
            if(ip !== window.lastSavedIp)
            {
                status.textContent = 'IP Address ' + (ip ? 'Updated to ' + ip : 'Cleared');
                window.lastSavedIp = ip;
                setTimeout(() => status.textContent = '', 1000);
            }
            else
            {
                status.textContent = '';
            }
        });
    }
    else
    {
        status.textContent = 'Invalid IP Address.';
        status.classList.add(CLASS_ERROR);
        ipElement.classList.add(CLASS_ERROR);
    }
}

function restore_options()
{
    browser.storage.sync.get({
        spoofIp: ''
    }).then((items) => {
        window.lastSavedIp = items.spoofIp;
        document.getElementById('ip').value = items.spoofIp
    });
}
window.lastSavedIp = '';
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('ip').addEventListener('keyup', save_options);
document.getElementById('ip').addEventListener('blur', save_options);