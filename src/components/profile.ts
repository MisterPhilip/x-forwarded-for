import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


@customElement('profile-entry')
export class ProfileElement extends LitElement {
    static override styles = css`
        :host {
            border-radius: 1rem;
            margin: 0.5rem 0;
            background: var(--color-surface-mixed-200);
        }

        h1, h2, h3, h4 {
            font-weight: 500;
            margin: 0;
        }

        header {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 1rem 1rem 0.5rem;
            border-bottom: 1px solid var(--color-surface-mixed-300);
        }

        header h1 {
            flex: 1;
            font-size: 1.25rem;
        }
        h4 {
            font-size: .9rem;
            color: #C91D1D;
        }
        .enabled h4 {
            color: #73B234;
        }

        main {
            padding: 0.5rem 1rem;
        }

        h3 {
            margin: 0.75rem 0 0;
            font-size: 1rem;
        }
        h3:first-of-type {
            margin-top: 0;
        }

        ul {
            display: flex;
            margin: 0;
            padding: 0.25rem 0;
            flex-wrap: wrap;
            gap: 0.25rem;
        }

        ul li {
            list-style-type: none;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.8rem;
            background: var(--color-surface-mixed-300);
            color: var(--color-primary-text);
        }
        p {
            margin: 0;
            font-size: 1rem;
        }

        footer {
            margin-top: 0.75rem;
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--color-surface-mixed-300);
        }

        footer ext-button:not(:first-of-type) {
            margin-left: 0.5rem;
        }

        footer span {
            flex: 1;
        }`;

    @property()
    profile?: Profile;

    @property()
    index: number = 0;

    @property()
    totalProfiles: number = 0;

    @state()
    editing: boolean = false;

    // Render the UI as a function of component state
    override render() {
        if(!this.profile) return nothing;

        const enabled = this.profile?.enabled ? "enabled" : "disabled";

        return html`
            <section class="${enabled}">
                <header>
                    <h1>${this.profile.name}</h1>
                    <h4>${chrome.i18n.getMessage(`status_${enabled}`)}</h4>
                </header>
                <main>
                    <h3>${chrome.i18n.getMessage(`profile_set_headers`)}</h3>
                    <ul>
                        ${this.profile.headers.map((header) => html`<li>${header}</li>`)}
                    </ul>
                    <h3>${chrome.i18n.getMessage(`profile_to_value`)}</h3>
                    <p>${this.profile.value}</p>
                    ${this.profile.domains.length ?
                        html`
                            <h3>${chrome.i18n.getMessage(`profile_for_domains_${this.profile.includeDomains ? "included" : "excluded"}`)}</h3>
                            <ul>${this.profile.domains.map((domain) => html`<li>${domain}</li></ul>`)}
                        ` :
                        html`<h3>${chrome.i18n.getMessage("profile_for_all_domains")}</h3>`
                    }
                </main>
                <footer>
                    <ext-button @click=${this._toggleEnabledStatus} class="btn-outline ${this.profile.enabled ? "btn-danger" : "btn-success"}">
                        ${chrome.i18n.getMessage(this.profile.enabled ? "btn_disable" : "btn_enable")}
                    </ext-button>
                    <ext-button title="${chrome.i18n.getMessage("btn_edit")}" @click=${this._toggleModal} class="btn-outline">
                        ${chrome.i18n.getMessage("btn_edit")}
                    </ext-button>
                    <ext-button title="${chrome.i18n.getMessage("btn_delete")}" @click=${this._deleteProfile} class="btn-outline btn-danger">
                        ${chrome.i18n.getMessage("btn_delete")}
                    </ext-button>
                    <span></span>
                    ${this.index === 0 ? nothing : html`
                        <ext-button @click=${this._moveProfileUp} class="btn-outline" title="${chrome.i18n.getMessage("btn_up")}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                        </ext-button>
                    `}
                    ${this.index === (this.totalProfiles-1) ? nothing : html`
                        <ext-button @click=${this._moveProfileDown} class="btn-outline" title="${chrome.i18n.getMessage("btn_down")}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                        </ext-button>
                    `}
                </footer>
            </section>
            ${this.editing ? html`<profile-form .profileId=${this.profile.id} .name=${this.profile.name} .value=${this.profile.value} .headers=${this.profile.headers} .domains=${this.profile.domains} .includeDomains=${this.profile.includeDomains} @closeModal=${this._toggleModal}></profile-form>` : nothing }
        `
    }

    protected _toggleEnabledStatus() {
        const options = {
            detail: {
                id: this.profile?.id,
                enabled: !this.profile?.enabled
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("editProfile", options));
    }

    protected _toggleModal() {
        this.editing = !this.editing;
    }

    protected _editProfile() {
        if(this.editing) {
            const options = {
                detail: this.profile,
                bubbles: true,
                composed: true,
            };
            this.dispatchEvent(new CustomEvent("editProfile", options));
        }
    }

    protected _deleteProfile() {
        const options = {
            detail: {
                id: this.profile?.id,
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("deleteProfile", options));
    }

    protected _moveProfileUp() {
        this._moveProfile(-1);
    }

    protected _moveProfileDown() {
        this._moveProfile(1);
    }

    protected _moveProfile(amount: number) {
        const options = {
            detail: {
                id: this.profile?.id,
                amount
            },
            bubbles: true,
            composed: true,
        };
        this.dispatchEvent(new CustomEvent("moveProfile", options));
    }
}
