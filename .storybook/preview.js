import './tailwind.css';
import '@ismail-elkorchi/ui-tokens/index.css';
import '@ismail-elkorchi/ui-primitives/register';
import '@ismail-elkorchi/ui-shell/register';

/** @type {import('@storybook/web-components').Preview} */
const preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {expanded: true},
    backgrounds: {
      options: {
        'uik-surface': {name: 'uik-surface', value: 'oklch(var(--uik-surface-bg))'},
        'uik-card': {name: 'uik-card', value: 'oklch(var(--uik-surface-card))'},
        neutral: {name: 'neutral', value: '#ffffff'},
      }
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'uik-surface'
    },
    theme: 'light',
    density: 'comfortable',
  },

  globalTypes: {
    theme: {
      description: 'UIK theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          {value: 'light', title: 'Light'},
          {value: 'dark', title: 'Dark'},
        ],
        showName: true,
      },
    },
    density: {
      description: 'UIK density',
      defaultValue: 'comfortable',
      toolbar: {
        icon: 'contrast',
        items: [
          {value: 'comfortable', title: 'Comfortable'},
          {value: 'compact', title: 'Compact'},
        ],
        showName: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const root = document.documentElement;
      const theme = context.globals.theme ?? 'light';
      const density = context.globals.density ?? 'comfortable';
      root.setAttribute('data-uik-theme', theme);
      root.setAttribute('data-uik-density', density);
      return Story();
    },
  ],
};

export default preview;
