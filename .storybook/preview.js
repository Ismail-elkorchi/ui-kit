import '@ismail-elkorchi/ui-primitives/register';
import '@ismail-elkorchi/ui-shell/register';

/** @type {import('@storybook/web-components').Preview} */
const preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {expanded: true},
    backgrounds: {
      options: {
        "app-surface": {name: 'app-surface', value: '#0f172a'},
        neutral: {name: 'neutral', value: '#ffffff'}
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'app-surface'
    }
  }
};

export default preview;
