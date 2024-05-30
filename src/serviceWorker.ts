interface Profile {
    id: number;
    name: string;
    headers: string[];
    value: string;
    domains: string[];
    includeDomains: boolean;
    enabled: boolean;
}
interface NewOrExistingProfile {
    id: number | null;
    name: string;
    headers: string[];
    value: string;
    domains: string[];
    includeDomains: boolean;
    enabled: boolean;
}

interface LegacyV0Settings {
    spoofIp: string,
    previous: string[],
    headers: string[],
}

const convertProfileToRule = (profile: Profile): chrome.declarativeNetRequest.Rule => {
    const rule: chrome.declarativeNetRequest.Rule = {
        id: profile.id,
        priority: profile.id,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: profile.headers.map((header) => {
                return {
                    header: header.toLowerCase(),
                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                    value: profile.value,
                }
            }),
        },
        condition: {
            resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"],
        },
    };

    if (profile.domains.length) {
        if (profile.includeDomains) {
            rule.condition.requestDomains = profile.domains;
        } else {
            rule.condition.excludedRequestDomains = profile.domains;
        }
    }
    return rule;
}

const updateDeclarativeRules = ({ addRules = [], removeRules = [] }: { addRules?: chrome.declarativeNetRequest.Rule[], removeRules?: chrome.declarativeNetRequest.Rule[] }) => {
    const removeRuleIds = removeRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules,
    }).then(() => {
        console.log("updateDynamicRules successful", {
            removeRuleIds,
            addRules,
        });
    }).catch((e) => {
        console.error("updateDynamicRules failed", e);
    });
}

const updateFromSettings = async () => {
    const storedSettings = await chrome.storage.sync.get(["enabled", "profiles"]) as { enabled?: boolean, profiles?: Profile[] };
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();

    console.log("updateFromSettings", storedSettings, oldRules);

    if(!storedSettings || !storedSettings.enabled || !storedSettings.profiles) {
        if(oldRules.length) {
            updateDeclarativeRules({ removeRules: oldRules });
        }

        await chrome.action.setIcon({
            path: {
                16: 'assets/logo-16-bw.png',
                32: 'assets/logo-32-bw.png',
                38: 'assets/logo-38-bw.png',
            }});
        return;
    }

    // Rebuild the dynamic rule set
    const rules: chrome.declarativeNetRequest.Rule[] = storedSettings.profiles
        .filter((profile) => profile.enabled)
        .map(convertProfileToRule);

    updateDeclarativeRules({addRules: rules, removeRules: oldRules});

    await chrome.action.setIcon({
        path: {
            16: 'assets/logo-16.png',
            32: 'assets/logo-32.png',
            38: 'assets/logo-38.png',
        }
    });
};

chrome.storage.sync.onChanged.addListener(updateFromSettings);

chrome.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
    if(reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await chrome.storage.sync.set({
            "profiles": [],
            "enabled": true,
        });
    }

    if(reason === chrome.runtime.OnInstalledReason.UPDATE) {
        // Migrate from < v1 (manifest v2 -> v3)
        if(previousVersion?.startsWith("0.")) {
            const previousSettings = await chrome.storage.sync.get() as LegacyV0Settings;
            const newProfiles: Profile[] = [];

            if(previousSettings.spoofIp) {
                newProfiles.push({
                    id: 1,
                    name: "Default (Migrated)",
                    headers: previousSettings.headers,
                    value: previousSettings.spoofIp,
                    domains: [],
                    includeDomains: true,
                    enabled: true,
                });
            }

            if(Array.isArray(previousSettings.previous)) {
                previousSettings.previous.forEach((previousIp, index) => {
                    newProfiles.push({
                        id: index+2,
                        name: `${previousIp} (Migrated)`,
                        headers: previousSettings.headers,
                        value: previousIp,
                        domains: [],
                        includeDomains: true,
                        enabled: false,
                    });
                });
            }

            await chrome.storage.sync.set({
                "profiles": newProfiles,
                "enabled": true,
            });
            await chrome.storage.sync.remove(["spoofIp", "previous", "headers"]);
        }
    }

    await updateFromSettings();
});
