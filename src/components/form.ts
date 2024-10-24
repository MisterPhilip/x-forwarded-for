import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import headers from "../headers";

@customElement('profile-form')
export class ProfileFormElement extends LitElement {
    static override styles = css`
        :host {
            position: fixed;
            z-index: 999;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            box-sizing: border-box;
            
            background: rgba(0, 0, 0, 0.75);
            
            display: flex;
            padding: 1rem;
            justify-content: center;
            align-items: center;
        }
        section {
            width: 100%;
            max-width: calc(1000px - 4rem);
            margin: 0 auto;
            background: var(--color-surface-mixed-200);
            padding: 1rem;
            border-radius: 1rem;
            color: var(--color-primary-text);
        }
        label {
            font-size: 1rem;
        }
        input, select {
            border: 1px solid #ddd;
            background: var(--color-surface-mixed-300);
            border-radius: 4px;
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
            color: var(--color-primary-text);
            margin-bottom: 0.25rem;
        }
        input + select,
        select + input,
        select + select,
        input + input {
            margin-top: 0.5rem;
        }
        ::placeholder {
            color: var(--color-primary-text-muted);
        }
        .form-row {
            display: flex;
            flex-direction: column;
            margin-bottom: 1rem;            
        }
        .help-text,
        .error-text {
            color: var(--color-primary-text-muted);
            font-size: 0.8rem;
        }
        input.form-error,
        select.form-error {
            border: 1px solid var(--color-error-dark);
        }
        .error-text {
            color: var(--color-error);
        }
        footer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
    `;

    @property()
    profileId: null|number = null;

    @property()
    name: string = "";

    @property()
    value: string = "";

    protected _headers: string[] = [];
    @property()
    set headers(headers: string|string[]) {
        if(!Array.isArray(headers)) {
            headers = headers.split(/[\s,]+/)
        }
        this._headers = headers;
    }
    get headers(): string[] {
        return this._headers;
    }

    @property()
    includeDomains: boolean = true;

    protected _domains: string[] = [];
    @property()
    set domains(domains: string|string[]) {
        if(!Array.isArray(domains)) {
            domains = domains.split(/[\s,]+/)
        }
        this._domains = domains;
        if(this._domains.length && this.allDomains) {
            this.allDomains = false;
        }
    }
    get domains(): string[] {
        return this._domains;
    }

    protected _allDomains: boolean = true;

    @state()
    set allDomains(config: boolean) {
        this._allDomains = config;
        if(config) { this._domains = []; }
    }
    get allDomains(): boolean {
        return this._allDomains;
    }

    @state()
    protected _errors: { [key: string]: string } = {};

    // Render the UI as a function of component state
    override render() {
        return html`
            <section>
                <main>
                    <div class="form-row">
                        <label for="name">${chrome.i18n.getMessage("form_name_label")}</label>
                        <input .value="${this.name}" @change=${this._handleInput} id="name" placeholder="${chrome.i18n.getMessage("form_name_placeholder")}" type="text" class="${this._errors.name ? "form-error" : ""}" required>
                        ${this._errors.name ? html`<span class="error-text">${this._errors.name}</span>` : nothing }
                        <span class="help-text">${chrome.i18n.getMessage("form_help_value")}</span>
                    </div>
                    <div class="form-row ${this._errors.value ? "form-error" : ""}">
                        <label for="value">${chrome.i18n.getMessage("form_value_label")}</label>
                        <input .value="${this.value}" @change=${this._handleInput} id="value" placeholder="127.0.0.1" type="text" class="${this._errors.value ? "form-error" : ""}" required>
                        ${this._errors.value ? html`<span class="error-text">${this._errors.value}</span>` : nothing }
                        <span class="help-text">${chrome.i18n.getMessage("form_value_help")}</span>
                    </div>
                    <div class="form-row ${this._errors.headers ? "form-error" : ""}">
                        <label for="headers">${chrome.i18n.getMessage("form_headers_label")}</label>
                        <select @change=${this._handleInput} id="headers" class="${this._errors.headers ? "form-error" : ""}" multiple required>
                            ${headers.map((header) => {
                                return html`<option value="${header}" ?selected=${this.headers.includes(header)}>${header}</option>`
                            })}
                        </select>
                        ${this._errors.headers ? html`<span class="error-text">${this._errors.headers}</span>` : nothing }
                        <span class="help-text">${chrome.i18n.getMessage("form_headers_help")}</span>
                    </div>
                    <div class="form-row">
                        <label for="allDomains">${chrome.i18n.getMessage("form_domains_label")}</label>
                        <select .value="${this.allDomains}" @change=${this._handleInput} id="allDomains">
                            <option value="true">${chrome.i18n.getMessage("form_domains_value_all")}</option>
                            <option value="false">${chrome.i18n.getMessage("form_domains_value_some")}</option>
                        </select>
                        ${!this.allDomains ? html`
                            <select .value="${this.includeDomains}" @change=${this._handleInput} id="includeDomains">
                                <option value="true">${chrome.i18n.getMessage("form_domains_value_include")}</option>
                                <option value="false">${chrome.i18n.getMessage("form_domains_value_exclude")}</option>
                            </select>
                            <input .value="${this.domains}" @change=${this._handleInput} id="domains" placeholder="github.com" type="text" class="${this._errors.domains ? "form-error" : ""}" required>
                            ${this._errors.domains ? html`<span class="error-text">${this._errors.domains}</span>` : nothing }
                            <span class="help-text">${chrome.i18n.getMessage("form_domains_help")}</span>
                        ` : nothing }
                    </div>
                </main>
                <footer>
                    <ext-button @click=${this._cancel} class="btn-outline btn-danger">Cancel</ext-button>
                    <ext-button @click=${this._save} class="btn-success" type="submit">Save</ext-button>
                </footer>
            </section>
        `
    }
    protected _handleInput(event: InputEvent) {
        let { id , value , required} = event.target as HTMLInputElement;
        if(id === "headers") {
            this.headers = Array.from((event.target as HTMLSelectElement).selectedOptions, option => option.value);
        } else if(["name", "value", "domains"].includes(id)) {
            this[id] = value.trim();
        } else if(id === "allDomains") {
            this.allDomains = (value === "true");
        } else if (id === "includeDomains") {
            this.includeDomains = (value === "true");
        }

        if(required) {
            const errors = Object.assign({}, this._errors);
            if(value) {
                if(errors[id]) { delete errors[id] }
            } else {
                if(!errors[id]) { errors[id] = chrome.i18n.getMessage(`error_${id}_required`); }
            }
            this._errors = errors;
        }
    }

    protected _cancel(event: Event) {
        event.preventDefault();
        // @TODO: Show close confirmation when model is dirty
        this._closeModal();
    }

    protected _save(event: Event) {
        event.preventDefault();

        const profile : Partial<Profile> = {
            name: this.name,
            value: this.value,
            headers: this.headers,
            // @ts-ignore
            includeDomains: this.includeDomains,
            domains: this.domains,
        }

        let errors: { [key: string]: string } = {};

        const required = ["name", "value", "headers"];
        required.forEach((field) => {
            if(!profile[field] || !profile[field].length) {
                errors[field] = chrome.i18n.getMessage(`error_${field}_required`);
            }
        });

        if(!this.allDomains && (!profile.domains || !profile.domains.length)) {
            errors.domains = chrome.i18n.getMessage(`error_domains_required`);
        }

        if(Object.keys(errors).length) {
            this._errors = errors;
            return;
        }

        if(this.profileId) {
            profile.id = this.profileId;
        }

        this.dispatchEvent(new CustomEvent("editProfile", {
            bubbles: true,
            composed: true,
            detail: profile
        }));

        this._closeModal();
    }

    protected _closeModal() {
        this.dispatchEvent(new CustomEvent("closeModal", {
            bubbles: true,
            composed: true,
        }));
    }
}
