import {LitElement, html, nothing, svg} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {styleMap} from 'lit/directives/style-map.js';

import '@ismail-elkorchi/ui-primitives/uik-checkbox';
import '@ismail-elkorchi/ui-primitives/uik-visually-hidden';

import type {
  UikShellFileTreeNode,
  UikShellFileTreeOpenDetail,
  UikShellFileTreeSelectDetail,
  UikShellFileTreeToggleDetail,
} from './uik-shell-file-tree-contract';
import {ensureLightDomRoot} from '../internal/light-dom-slot-controller';

export type {
  UikShellFileTreeNode,
  UikShellFileTreeOpenDetail,
  UikShellFileTreeSelectDetail,
  UikShellFileTreeToggleDetail,
} from './uik-shell-file-tree-contract';

const fileTreeStyles = `
  .uik-file-tree {
    display: flex;
    flex-direction: column;
    gap: var(--uik-space-0);
    width: 100%;
    box-sizing: border-box;
  }

  .uik-file-tree__row {
    display: flex;
    align-items: center;
    gap: var(--uik-component-shell-file-tree-row-gap);
    min-height: var(--uik-component-shell-file-tree-row-height);
    width: 100%;
    box-sizing: border-box;
  }

  .uik-file-tree__button {
    appearance: none;
    border: var(--uik-border-width-0) solid oklch(var(--uik-component-shell-file-tree-row-bg));
    border-radius: var(--uik-component-shell-file-tree-row-radius);
    background-color: oklch(var(--uik-component-shell-file-tree-row-bg));
    font-family: var(--uik-typography-font-family-sans);
    font-size: var(--uik-typography-font-size-2);
    font-weight: var(--uik-typography-font-weight-medium);
    line-height: var(--uik-typography-line-height-2);
    color: oklch(var(--uik-component-shell-file-tree-text-file));
    cursor: pointer;
  }

  .uik-file-tree__button:hover {
    background-color: oklch(var(--uik-component-shell-file-tree-row-hover-bg));
    color: oklch(var(--uik-component-shell-file-tree-text-hover));
  }

  .uik-file-tree__button:active {
    background-color: oklch(var(--uik-component-shell-file-tree-row-active-bg));
  }

  .uik-file-tree__button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 var(--uik-focus-ring-offset-default) oklch(var(--uik-focus-ring-offset-bg)),
      0 0 0 calc(var(--uik-focus-ring-offset-default) + var(--uik-focus-ring-width))
        oklch(var(--uik-focus-ring-default) / var(--uik-focus-ring-opacity));
  }

  .uik-file-tree__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--uik-space-0);
    width: var(--uik-component-shell-file-tree-row-height);
    height: var(--uik-component-shell-file-tree-row-height);
    color: oklch(var(--uik-component-shell-file-tree-toggle-fg));
  }

  .uik-file-tree__toggle:hover {
    color: oklch(var(--uik-component-shell-file-tree-text-hover));
  }

  .uik-file-tree__label {
    flex: 1 1 auto;
    min-width: var(--uik-space-0);
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    padding-inline: var(--uik-component-shell-file-tree-row-padding-x);
    padding-block: var(--uik-space-0);
    text-align: start;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .uik-file-tree__label[data-kind='folder'] {
    color: oklch(var(--uik-component-shell-file-tree-text-folder));
    font-weight: var(--uik-typography-font-weight-semibold);
  }

  .uik-file-tree__label[data-kind='folder']:hover {
    color: oklch(var(--uik-component-shell-file-tree-text-hover));
  }

  .uik-file-tree__checkbox {
    flex: 0 0 auto;
  }

  @media (forced-colors: active) {
    .uik-file-tree__button:focus-visible {
      outline: var(--uik-border-width-1) solid currentcolor;
      outline-offset: var(--uik-space-1);
      box-shadow: none;
    }
  }
`;

@customElement('uik-shell-file-tree')
export class UikShellFileTree extends LitElement {
  @property({attribute: false}) accessor items: UikShellFileTreeNode[] = [];
  @property({attribute: false}) accessor selectedPaths: string[] = [];
  @property({attribute: false}) accessor openPaths: string[] = [];

  override connectedCallback() {
    super.connectedCallback();
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.boxSizing) this.style.boxSizing = 'border-box';
    if (!this.style.width) this.style.width = '100%';
  }

  override createRenderRoot() {
    return ensureLightDomRoot(this);
  }

  private isPathSelected(path: string): boolean {
    return Array.isArray(this.selectedPaths) && this.selectedPaths.includes(path);
  }

  private isPathOpen(path: string): boolean {
    return Array.isArray(this.openPaths) && this.openPaths.includes(path);
  }

  private emitSelect(node: UikShellFileTreeNode, checked: boolean) {
    const detail: UikShellFileTreeSelectDetail = {path: node.path, checked, node};
    this.dispatchEvent(new CustomEvent('file-tree-select', {detail, bubbles: true, composed: true}));
  }

  private emitOpen(node: UikShellFileTreeNode) {
    const detail: UikShellFileTreeOpenDetail = {path: node.path, node};
    this.dispatchEvent(new CustomEvent('file-tree-open', {detail, bubbles: true, composed: true}));
  }

  private emitToggle(node: UikShellFileTreeNode, open: boolean) {
    const detail: UikShellFileTreeToggleDetail = {path: node.path, open, node};
    this.dispatchEvent(new CustomEvent('file-tree-toggle', {detail, bubbles: true, composed: true}));
  }

  private toggleFolder(node: UikShellFileTreeNode) {
    const isOpen = this.isPathOpen(node.path);
    const next = isOpen
      ? this.openPaths.filter(path => path !== node.path)
      : [...this.openPaths, node.path];
    this.openPaths = next;
    this.emitToggle(node, !isOpen);
  }

  private onCheckboxClick = (node: UikShellFileTreeNode, event: Event) => {
    const checkbox = event.currentTarget as HTMLElement & {checked?: boolean};
    queueMicrotask(() => {
      this.emitSelect(node, Boolean(checkbox.checked));
    });
  };

  private onLabelClick = (node: UikShellFileTreeNode) => {
    if (node.isDirectory) {
      this.toggleFolder(node);
      return;
    }
    this.emitOpen(node);
  };

  private renderToggleIcon(isOpen: boolean) {
    const path = isOpen ? 'M5 9l7 7 7-7' : 'M9 5l7 7-7 7';
    return svg`<svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style=${styleMap({
        width: 'var(--uik-size-icon-sm)',
        height: 'var(--uik-size-icon-sm)',
      })}>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="var(--uik-border-width-1)"
        d=${path}></path>
    </svg>`;
  }

  private renderToggle(node: UikShellFileTreeNode, isOpen: boolean) {
    if (!node.isDirectory) return nothing;
    const label = isOpen ? `Collapse ${node.name}` : `Expand ${node.name}`;
    return html`
      <button
        part="toggle"
        class="uik-file-tree__button uik-file-tree__toggle"
        type="button"
        data-role="toggle"
        data-node-path=${node.path}
        aria-expanded=${isOpen ? 'true' : 'false'}
        aria-label=${label}
        @click=${() => this.toggleFolder(node)}>
        ${this.renderToggleIcon(isOpen)}
      </button>
    `;
  }

  private renderCheckbox(node: UikShellFileTreeNode) {
    const labelPrefix = node.isDirectory ? 'Select folder' : 'Select file';
    return html`
      <uik-checkbox
        part="checkbox"
        class="uik-file-tree__checkbox"
        data-role="checkbox"
        data-node-path=${node.path}
        .checked=${this.isPathSelected(node.path)}
        @click=${(event: Event) => this.onCheckboxClick(node, event)}>
        <uik-visually-hidden slot="label">${labelPrefix} ${node.name}</uik-visually-hidden>
      </uik-checkbox>
    `;
  }

  private renderLabel(node: UikShellFileTreeNode, isOpen: boolean) {
    return html`
      <button
        part="label"
        class="uik-file-tree__button uik-file-tree__label"
        data-kind=${node.isDirectory ? 'folder' : 'file'}
        data-role="label"
        data-node-path=${node.path}
        type="button"
        aria-expanded=${ifDefined(node.isDirectory ? (isOpen ? 'true' : 'false') : undefined)}
        @click=${() => this.onLabelClick(node)}>
        ${node.name}
      </button>
    `;
  }

  private renderNode(node: UikShellFileTreeNode, depth: number): unknown {
    const isOpen = node.isDirectory ? this.isPathOpen(node.path) : false;
    const depthValue = String(depth);
    const rowStyles = {
      paddingInlineStart: `calc(var(--uik-component-shell-file-tree-row-padding-x) + (var(--uik-component-shell-file-tree-indent) * ${depthValue}))`,
      paddingInlineEnd: 'var(--uik-component-shell-file-tree-row-padding-x)',
    };
    return html`
      <div
        part="row"
        class="uik-file-tree__row"
        style=${styleMap(rowStyles)}
        data-node-path=${node.path}
        data-node-depth=${String(depth)}>
        ${this.renderToggle(node, isOpen)} ${this.renderCheckbox(node)} ${this.renderLabel(node, isOpen)}
      </div>
      ${node.isDirectory && isOpen && node.children?.length
        ? html`<div part="children">${node.children.map(child => this.renderNode(child, depth + 1))}</div>`
        : nothing}
    `;
  }

  override render() {
    return html`
      <style>
        ${fileTreeStyles}
      </style>
      <div part="tree" class="uik-file-tree">
        ${this.items.map(node => this.renderNode(node, 0))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uik-shell-file-tree': UikShellFileTree;
  }
}
