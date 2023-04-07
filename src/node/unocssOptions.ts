import { VitePluginConfig } from 'unocss/vite';
import { presetAttributify, presetWind, presetIcons } from 'unocss';

const options: VitePluginConfig = {
  presets: [presetAttributify(), presetWind({}), presetIcons()],
  rules: [
    [
      /^divider-(\w+)$/,
      ([, w]) => ({
        [`border-${w}`]: '1px solid var(--repress-c-divider-light)'
      })
    ],
    [
      'menu-item-before',
      {
        'margin-right': '12px',
        'margin-left': '12px',
        width: '1px',
        height: '24px',
        'background-color': 'var(--repress-c-divider-light)',
        content: '" "'
      }
    ]
  ],
  shortcuts: {
    'flex-center': 'flex justify-center items-center'
  },
  theme: {
    colors: {
      brandLight: 'var(--repress-c-brand-light)',
      brandDark: 'var(--repress-c-brand-dark)',
      brand: 'var(--repress-c-brand)',
      text: {
        1: 'var(--repress-c-text-1)',
        2: 'var(--repress-c-text-2)',
        3: 'var(--repress-c-text-3)',
        4: 'var(--repress-c-text-4)'
      },
      divider: {
        default: 'var(--repress-c-divider)',
        light: 'var(--repress-c-divider-light)',
        dark: 'var(--repress-c-divider-dark)'
      },
      gray: {
        light: {
          1: 'var(--repress-c-gray-light-1)',
          2: 'var(--repress-c-gray-light-2)',
          3: 'var(--repress-c-gray-light-3)',
          4: 'var(--repress-c-gray-light-4)'
        }
      },
      bg: {
        default: 'var(--repress-c-bg)',
        soft: 'var(--repress-c-bg-soft)',
        mute: 'var(--repress-c-bg-mute)'
      }
    }
  }
};

export default options;
