<script lang="ts" setup>
import { useVerticalNav } from "@/navigation/vertical"
import { themeConfig } from '@themeConfig'
import { watchEffect } from 'vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavbarShortcuts from '@/layouts/components/NavbarShortcuts.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

// 🔹 Reactive navigation state
const { verticalNavItems, isLoading, isNavigationReady } = useVerticalNav()

// 🔹 Debug watcher (dengan error guard)
watchEffect(() => {
  try {
    console.log('Vertical Nav Items updated:', verticalNavItems.value)
    console.log('Is Loading:', isLoading.value)
    console.log('Is Navigation Ready:', isNavigationReady.value)
  } catch (err) {
    console.warn('⚠️ Navigation not ready yet:', err)
  }
})
</script>

<template>
  <!-- 🔹 Safe conditional rendering -->
  <VerticalNavLayout
    v-if="isNavigationReady && verticalNavItems?.length"
    :nav-items="verticalNavItems"
  >
    <!-- 👉 Navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon size="26" icon="tabler-menu-2" />
        </IconBtn>

        <!-- <NavSearchBar class="ms-lg-n3" /> -->
        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <NavbarThemeSwitcher />
        <NavbarShortcuts />
        <NavBarNotifications class="me-1" />
        
        <!-- 🔹 User Profile (Logout Menu) -->
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
    <!-- 👉 Customizer -->
    <TheCustomizer />
    <!-- 👉 Customizer (optional, jaga-jaga biar gak error kalau belum diimport) -->
    <!-- <TheCustomizer v-if="typeof TheCustomizer !== 'undefined'" /> -->
  </VerticalNavLayout>

  <!-- 🔹 Loading state -->
  <div
    v-else-if="isLoading"
    class="d-flex justify-center align-center"
    style="height: 100vh;"
  >
    <div class="text-center">
      <VProgressCircular indeterminate color="primary" size="48" class="mb-4" />
      <div class="text-h6 mb-2">Loading Navigation...</div>
      <div class="text-body-2 text-medium-emphasis">
        Please wait while we prepare your menu
      </div>
    </div>
  </div>

  <!-- 🔹 Fallback jika navigation kosong -->
  <div
    v-else
    class="d-flex justify-center align-center"
    style="height: 100vh;"
  >
    <div class="text-center">
      <VIcon size="64" icon="tabler-menu-2" color="primary" class="mb-4" />
      <div class="text-h6 mb-2">Navigation Not Available</div>
      <div class="text-body-2 text-medium-emphasis">
        Unable to load navigation menu
      </div>
    </div>
  </div>
</template>
