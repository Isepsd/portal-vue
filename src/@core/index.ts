// src/path/to/defineThemeConfig.ts
import type { LayoutConfig } from '@layouts/types'
import { colorSchemeDarkBlue, colorSchemeLightCold, themeQuartz } from 'ag-grid-community'
import type { UserThemeConfig } from './types'

/**
 * Buat AG Grid theme instance
 */
export const createAgGridTheme = (themeMode: 'light' | 'dark' | 'system'): any => {
  if (themeMode === 'light') return themeQuartz.withPart(colorSchemeLightCold)
  if (themeMode === 'dark') return themeQuartz.withPart(colorSchemeDarkBlue)

  // system: deteksi preferensi OS
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz.withPart(colorSchemeLightCold)
}

/**
 * Set theme AG Grid global
 */
export const setGlobalAgGridTheme = (themeInstance: any) => {
  if (typeof window !== 'undefined') {
    ;(window as any).__AG_GRID_THEME__ = themeInstance
  }
}

/**
 * Ambil theme AG Grid global
 */
export const getGlobalAgGridTheme = (): any => {
  return typeof window !== 'undefined' ? (window as any).__AG_GRID_THEME__ : undefined
}

/**
 * defineThemeConfig (dengan integrasi AG Grid theme global)
 */
export const defineThemeConfig = (
  userConfig: UserThemeConfig
): { themeConfig: UserThemeConfig; layoutConfig: LayoutConfig } => {
  // Buat AG Grid theme sesuai konfigurasi awal
  const agGridTheme = createAgGridTheme(userConfig.app.theme as 'light' | 'dark' | 'system')

  // Simpan secara global
  setGlobalAgGridTheme(agGridTheme)

  // Return tanpa menyentuh struktur app
  return {
    themeConfig: userConfig,
    layoutConfig: {
      app: {
        title: userConfig.app.title,
        logo: userConfig.app.logo,
        contentWidth: userConfig.app.contentWidth,
        contentLayoutNav: userConfig.app.contentLayoutNav,
        overlayNavFromBreakpoint: userConfig.app.overlayNavFromBreakpoint,
        i18n: {
          enable: userConfig.app.i18n.enable,
        },
        iconRenderer: userConfig.app.iconRenderer,
      },
      navbar: {
        type: userConfig.navbar.type,
        navbarBlur: userConfig.navbar.navbarBlur,
      },
      footer: { type: userConfig.footer.type },
      verticalNav: {
        isVerticalNavCollapsed: userConfig.verticalNav.isVerticalNavCollapsed,
        defaultNavItemIconProps: userConfig.verticalNav.defaultNavItemIconProps,
      },
      horizontalNav: {
        type: userConfig.horizontalNav.type,
        transition: userConfig.horizontalNav.transition,
        popoverOffset: userConfig.horizontalNav.popoverOffset,
      },
      icons: {
        chevronDown: userConfig.icons.chevronDown,
        chevronRight: userConfig.icons.chevronRight,
        close: userConfig.icons.close,
        verticalNavPinned: userConfig.icons.verticalNavPinned,
        verticalNavUnPinned: userConfig.icons.verticalNavUnPinned,
        sectionTitlePlaceholder: userConfig.icons.sectionTitlePlaceholder,
      },
    },
  }
}
