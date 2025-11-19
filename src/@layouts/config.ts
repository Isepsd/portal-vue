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
  // dashboard: { class: 'fa-solid fa-gauge' },
  chevronDown: { class: 'fa-solid fa-chevron-down' },
  chevronRight: { class: 'fa-solid fa-chevron-right' },
  close: { class: 'fa-solid fa-xmark' },
  verticalNavPinned: { class: 'fa-solid fa-thumbtack' },
  verticalNavUnPinned: { class: 'fa-regular fa-bookmark' },
  sectionTitlePlaceholder: { class: 'fa-solid fa-minus' },
},

}
