import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';


@customElement('ext-button')
export class ExtButtonElement extends LitElement {
    static override styles = css`
        button {
            font-family: "Inter", sans-serif;
            color: var(--color-primary-text-inverse);
            
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            text-align: center;

            background: var(--color-primary-500);
            border: 1px solid var(--color-primary-300);
            border-radius: 1rem;
        }
        button:hover {
            background: var(--color-primary-100);
            color: var(--color-primary-text);
        }
        :host(.btn-outline) button,
        :host(.btn-outline.btn-danger) button,
        :host(.btn-outline.btn-success) button,
        :host(.btn-outline.btn-warning) button {
            background: rgba(255, 255, 255, 0.05);
            color: var(--color-primary-text);
            border-color: var(--color-primary-text-muted);
        }
        :host(.btn-outline) button:hover {
            background: rgba(255, 255, 255, 0.15);
            color: var(--color-primary-text);
            border-color: var(--color-primary-text);
        }
        :host(.btn-danger) button {
            background: var(--color-error);
            color: var(--color-primary-text);
            border-color: var(--color-error-dark);
        }
        :host(.btn-danger) button:hover {
            background: var(--color-error-dark);
            color: var(--color-primary-text);
            border-color: var(--color-error-dark);
        }
        :host(.btn-success) button {
            background: var(--color-success);
            color: var(--color-primary-text);
            border-color: var(--color-success-dark);
        }
        :host(.btn-success) button:hover {
            background: var(--color-success-dark);
            color: var(--color-primary-text);
            border-color: var(--color-success-dark);
        }
        ::slotted(svg) {
            width: 1rem;
            height: 1rem;
        }`;

    override render() {
        return html`<button><slot></slot></button>`
    }
}
