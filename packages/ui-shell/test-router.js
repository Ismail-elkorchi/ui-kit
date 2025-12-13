import {AppShellRouter, APP_SHELL_NAV_EVENT} from './dist/router.js';

// ---- Polyfills for Node Environment ----
class CustomEvent extends Event {
  constructor(message, data) {
    super(message, data);
    this.detail = data.detail;
  }
}

class EventTargetMock extends EventTarget {}
global.EventTarget = EventTargetMock;
global.CustomEvent = CustomEvent;
global.Event = Event;

// Mock window
global.window = new EventTarget();

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
  console.log('🧪 Starting Router Tests...');

  const routes = [
    {id: 'page1', label: 'Page 1'},
    {id: 'page2', label: 'Page 2'}
  ];

  const router = new AppShellRouter({routes, initialView: 'page1'});

  // Test 1: Initial state
  assert(router.current.view === 'page1', 'Initial view should be page1');

  // Test 2: Router instance subscription
  let routerEventFired = false;
  router.subscribe(location => {
    if (location.view === 'page1') return; // Ignore initial state call
    routerEventFired = true;
    assert(location.view === 'page2', 'Router subscriber should receive new location');
  });

  // Test 3: Window event listener
  let windowEventFired = false;
  const windowHandler = event => {
    windowEventFired = true;
    console.log('   Received event on window:', event.detail);
    assert(event.detail.from.view === 'page1', 'Event from view should be page1');
    assert(event.detail.to.view === 'page2', 'Event to view should be page2');
    assert(event.detail.route.id === 'page2', 'Event route id should be page2');
  };
  window.addEventListener(APP_SHELL_NAV_EVENT, windowHandler);

  // Perform navigation
  console.log('🔄 Navigating to page2...');
  router.navigate('page2');

  // Verify
  assert(routerEventFired, 'Router subscription should have fired');
  assert(windowEventFired, 'Window event listener should have fired');

  console.log('🎉 All tests passed!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
