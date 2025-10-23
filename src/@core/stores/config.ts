// src/@core/stores/config.ts
import { createAgGridTheme, setGlobalAgGridTheme } from '@core/index'; // 🟢 Tambahkan ini
import { cookieRef, useLayoutConfigStore } from '@layouts/stores/config';
import { themeConfig } from '@themeConfig';
import { storeToRefs } from 'pinia';
import { onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';

// SECTION Store
export const useConfigStore = defineStore('config', () => {
  // 👉 Theme
  const userPreferredColorScheme = usePreferredColorScheme()
  const cookieColorScheme = cookieRef<'light' | 'dark'>('color-scheme', 'light')

  watch(
    userPreferredColorScheme,
    val => {
      if (val !== 'no-preference')
        cookieColorScheme.value = val
    },
    { immediate: true },
  )

  const theme = cookieRef('theme', themeConfig.app.theme)

  // 👉 isVerticalNavSemiDark
  const isVerticalNavSemiDark = cookieRef('isVerticalNavSemiDark', themeConfig.verticalNav.isVerticalNavSemiDark)

  // 👉 skin
  const skin = cookieRef('skin', themeConfig.app.skin)

  // ℹ️ Forward state dari layout config
  const {
    isLessThanOverlayNavBreakpoint,
    appContentWidth,
    navbarType,
    isNavbarBlurEnabled,
    appContentLayoutNav,
    isVerticalNavCollapsed,
    footerType,
    isAppRTL,
  } = storeToRefs(useLayoutConfigStore())

  return {
    theme,
    isVerticalNavSemiDark,
    skin,

    // layout exports
    isLessThanOverlayNavBreakpoint,
    appContentWidth,
    navbarType,
    isNavbarBlurEnabled,
    appContentLayoutNav,
    isVerticalNavCollapsed,
    footerType,
    isAppRTL,
  }
})
// !SECTION

// SECTION Init
export const initConfigStore = () => {
  const userPreferredColorScheme = usePreferredColorScheme()
  const vuetifyTheme = useTheme()
  const configStore = useConfigStore()

  watch(
    [() => configStore.theme, userPreferredColorScheme],
    () => {
      const themeMode:any =
        configStore.theme === 'system'
          ? userPreferredColorScheme.value === 'dark'
            ? 'dark'
            : 'light'
          : configStore.theme

      // 🟢 Sinkronkan ke Vuetify
      vuetifyTheme.global.name.value = themeMode

      // 🟢 Sinkronkan juga ke AG Grid
      const newAgTheme = createAgGridTheme(themeMode)
      setGlobalAgGridTheme(newAgTheme)

      // Optional: update global CSS var untuk bantu AG Grid re-render
      document.documentElement.style.setProperty('--ag-active-theme', themeMode)
    },
    { immediate: true },
  )

  onMounted(() => {
    if (configStore.theme === 'system')
      vuetifyTheme.global.name.value = userPreferredColorScheme.value
  })
}
// !SECTION
