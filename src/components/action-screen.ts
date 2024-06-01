import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import "./button";

@customElement('ext-action-screen')
export class ActionScreenElement extends LitElement {
    static override styles = css`
        * {
            box-sizing: border-box;
            text-align: center;
        }
        h1 {
            margin: 0 0 0.5rem 0;
        }
        h3 {
            margin: 0.5rem 0 1rem 0;
        }
        p.disabled {
            color: var(--color-error);
            font-size: 0.85rem;
            font-weight: bold;
            margin-bottom: 0;
        }
        ext-button {
            display: block;
            margin: 0.5rem 0;
        }
        ext-button:last-of-type {
            margin-bottom: 0;
        }
    `;

    override connectedCallback() {
        super.connectedCallback();

        chrome.storage.sync.get(["enabled", "profiles"], ((settings) => {
            this._enabled = settings.enabled;
            this._profiles = settings.profiles;
        }));
    }

    @state()
    private _enabled: boolean = false;

    @state()
    private _profiles: Profile[] = [];

    // Render the UI as a function of component state
    override render() {
        return html`
            <h1>${chrome.i18n.getMessage("ext_name")}</h1>
            <p>
                ${chrome.i18n.getMessage("action_profiles_enabled_count", [
                    String(this._enabled ? this._profiles.filter((profile) => profile.enabled).length : 0),
                    String(this._profiles.length)
                ])}
            </p>
            <ext-button @click=${this._openProfilePage} class="btn-outline">${chrome.i18n.getMessage("btn_edit_profiles")}</ext-button>
            ${this._enabled ?
                html`
                    <ext-button @click=${this._toggleEnabled} class="btn-outline btn-danger">
                        ${chrome.i18n.getMessage(`btn_disable_extension`)}
                    </ext-button>` :
                html`
                    <ext-button @click=${this._toggleEnabled} class="btn-outline btn-success">
                        ${chrome.i18n.getMessage(`btn_enable_extension`)}
                    </ext-button>
                    <p class="disabled">
                        ${chrome.i18n.getMessage("action_profiles_extension_disabled")}
                    </p>`
                }
        `
    }

    protected _toggleEnabled() {
        this._enabled = !this._enabled;
        chrome.storage.sync.set({
            enabled: this._enabled
        }).then(() => {
            // @TODO: Show success message
        }).catch(() => {
            // @TODO: Show error message
        })
    }
    protected async _openProfilePage() {
        const url = chrome.runtime.getURL("profiles.html");
        // @TODO: Check if profile page is already open?
        await chrome.tabs.create({url:url, active:true});
    }

}
