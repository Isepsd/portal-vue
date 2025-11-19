import type { HorizontalNavItems } from '@layouts/types'
import apps from './apps'
import charts from './charts'
import dashboard from './dashboard'
import forms from './forms'
import misc from './misc'
import pages from './pages'
import tables from './tables'
import uiElements from './ui-elements'

// Export default static navigation
export default [...dashboard, ...apps, ...pages, ...uiElements, ...forms, ...tables, ...charts, ...misc] as HorizontalNavItems

// Dynamic navigation function similar to useVerticalNav
import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useAuthStore } from '@/pages/stores/auth'
import { useNavigationStore } from '@/pages/stores/navigation'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'

export function useHorizontalNav() {
  const navigationStore = useNavigationStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const userData = useCookie<any>('userData')

  const isLoading = ref(true)
  const isInitialized = ref(false)

  // 🔹 Fungsi logout otomatis
  const autoLogout = async () => {
    console.warn('⚠️ Navigation kosong — logout otomatis dilakukan.')
    try {
      // Hapus token dan data user
      useCookie('accessToken').value = null
      useCookie('userAbilityRules').value = null
      userData.value = null

      // Redirect ke halaman login
      await router.push('/login')
    } catch (err) {
      console.error('Gagal logout otomatis:', err)
    }
  }

  onMounted(() => {
    isLoading.value = false
    isInitialized.value = true
  })

  const horizontalNavItems = computed((): HorizontalNavItems => {
    const convertedNavigation =
      convertTreeToNav(toRaw(navigationStore.navigation), router, authStore) || []

    // Filter out NavSectionTitle as HorizontalNavItems doesn't support it
    return [...convertedNavigation].filter(item => !('heading' in item)) as HorizontalNavItems
  })

  // 🔹 Pantau jika navigation kosong → logout otomatis
  watch(
    () => horizontalNavItems.value,
    async (newNav) => {
      if (
        isInitialized.value &&
        !isLoading.value &&
        (!newNav || newNav.length === 0)
      ) {
        await autoLogout()
      }
    },
    { immediate: true }
  )

  const isNavigationReady = computed(() => horizontalNavItems.value.length > 0)

  return {
    horizontalNavItems,
    isLoading: computed(() => isLoading.value),
    isNavigationReady,
  }
}
