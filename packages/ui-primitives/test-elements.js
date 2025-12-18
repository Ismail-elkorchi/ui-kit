/* eslint-disable no-undef */
import { UikButton } from './dist/uik-button.js';
import { UikBadge } from './dist/uik-badge.js';
import { UikInput } from './dist/uik-input.js';
import { UikSeparator } from './dist/uik-separator.js';

// ---- Polyfills for Node Environment ----
class EventTargetMock extends EventTarget { }
global.EventTarget = EventTargetMock;
global.Node = class { };
global.HTMLElement = class extends EventTargetMock { };
global.customElements = {
    define: () => { },
    get: () => { },
};

// -----------------------------------------

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ Assertion Failed: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ ${message}`);
    }
}

async function runTests() {
    console.log('🧪 Starting UI Primitives Basic Tests...');

    // Test Button
    const button = new UikButton();
    assert(button.variant === 'default', 'Button default variant should be "default"');
    button.variant = 'destructive';
    assert(button.variant === 'destructive', 'Button variant should be updatable to "destructive"');

    // Test Badge
    const badge = new UikBadge();
    assert(badge.variant === 'default', 'Badge default variant should be "default"');

    // Test Input
    const input = new UikInput();
    assert(input.type === 'text', 'Input default type should be "text"');
    input.value = 'hello';
    assert(input.value === 'hello', 'Input value should be updatable');

    // Test Separator
    const separator = new UikSeparator();
    assert(separator.orientation === 'horizontal', 'Separator default orientation should be "horizontal"');

    console.log('🎉 All Primitives tests passed!');
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
