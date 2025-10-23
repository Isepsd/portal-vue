import { defineThemeConfig } from '@core';
import { Skins } from '@core/enums';
import { breakpointsVuetifyV3 } from '@vueuse/core';
import { h } from 'vue'; // 🟢 ini penting untuk pakai h()!
import { VIcon } from 'vuetify/components/VIcon';

// 🖼️ Import logo (JPG/PNG)
import logo from './logo.jpg';

import {
  AppContentLayoutNav,
  ContentWidth,
  FooterType,
  NavbarType,
} from '@layouts/enums';

export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: '',
    logo: h(
      'div',
      {
        style: `
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.2;
        `,
      },
      [
        h('img', {
          src: logo,
          alt: 'Logo',
          style: 'height: 40px;',
        }),
        h('div', { style: 'display: flex; flex-direction: column;' }, [
          h(
            'span',
            { style: 'font-weight: 600; font-size: 16px;' },
            'Portal'
          ),
          h(
            'span',
            { style: 'font-size: 12px; opacity: 0.7;' },
            'UP2D BANTEN'
          ),
        ]),
      ]
    ),
    contentWidth: ContentWidth.Boxed,
    contentLayoutNav: AppContentLayoutNav.Vertical,
    overlayNavFromBreakpoint: breakpointsVuetifyV3.lg - 1,
    i18n: {
      enable: true,
      defaultLocale: 'en',
      langConfig: [
        { label: 'English', i18nLang: 'en', isRTL: false },
        { label: 'French', i18nLang: 'fr', isRTL: false },
        { label: 'Arabic', i18nLang: 'ar', isRTL: true },
      ],
    },
    theme: 'system',
    skin: Skins.Default,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
  },
  footer: { type: FooterType.Static },
  verticalNav: {
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'tabler-circle' },
    isVerticalNavSemiDark: false,
  },
  horizontalNav: {
    type: 'sticky',
    transition: 'slide-y-reverse-transition',
    popoverOffset: 6,
  },
  icons: {
    chevronDown: { icon: 'tabler-chevron-down' },
    chevronRight: { icon: 'tabler-chevron-right', size: 20 },
    close: { icon: 'tabler-x', size: 20 },
    verticalNavPinned: { icon: 'tabler-circle-dot', size: 20 },
    verticalNavUnPinned: { icon: 'tabler-circle', size: 20 },
    sectionTitlePlaceholder: { icon: 'tabler-minus' },
  },
})
