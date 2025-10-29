import '@fortawesome/fontawesome-free/css/all.min.css'
import { AppContentLayoutNav, ContentWidth, FooterType, HorizontalNavType, NavbarType } from '@layouts/enums'
import type { LayoutConfig } from '@layouts/types'
import { breakpointsVuetify } from '@vueuse/core'


export const layoutConfig: LayoutConfig = {
  app: {
    title: 'my-layout',
    logo: h('img', { src: '/src/assets/logo.svg' }),
    contentWidth: ContentWidth.Boxed,
    contentLayoutNav: AppContentLayoutNav.Vertical,
    overlayNavFromBreakpoint: breakpointsVuetify.md,

    // isRTL: false,
    i18n: {
      enable: true,
    },
iconRenderer: defineComponent({
  name: 'IconRenderer',
  inheritAttrs: true, // wajib biar class ikut ke <i>
  render() {
    return h('i')
  },
}),


  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
  },
  footer: {
    type: FooterType.Static,
  },
  verticalNav: {
  isVerticalNavCollapsed: false,
  defaultNavItemIconProps: { class: 'fa-regular fa-circle' }, // ✅ Bootstrap default
},
  horizontalNav: {
    type: HorizontalNavType.Sticky,
    transition: 'none',
    popoverOffset: 0,
  },
icons: {
  chevronDown: { class: 'bi bi-chevron-down' },
  chevronRight: { class: 'bi bi-chevron-right' },
  close: { class: 'bi bi-x' },
  verticalNavPinned: { class: 'bi bi-pin-angle-fill' },
  verticalNavUnPinned: { class: 'bi bi-pin' },
  sectionTitlePlaceholder: { class: 'bi bi-dash' },
},
}
