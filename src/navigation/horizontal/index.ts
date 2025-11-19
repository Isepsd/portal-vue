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
export default [
  ...dashboard,
  ...apps,
  ...pages,
  ...uiElements,
  ...forms,
  ...tables,
  ...charts,
  ...misc,
] as HorizontalNavItems

// Dynamic navigation
import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useAuthStore } from '@/pages/stores/auth'
import { useNavigationStore } from '@/pages/stores/navigation'
import { computed, onMounted, ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'

export function useHorizontalNav() {
  const navigationStore = useNavigationStore()
  const authStore = useAuthStore()
  const router = useRouter()

  const isLoading = ref(true)
  const isInitialized = ref(false)

  onMounted(() => {
    isLoading.value = false
    isInitialized.value = true
  })

  const horizontalNavItems = computed((): HorizontalNavItems => {
    const convertedNavigation =
      convertTreeToNav(toRaw(navigationStore.navigation), router, authStore) || []

    // HorizontalNavItems tidak support heading (NavSectionTitle)
    return [...convertedNavigation].filter(item => !('heading' in item)) as HorizontalNavItems
  })

  const isNavigationReady = computed(() => horizontalNavItems.value.length > 0)

  return {
    horizontalNavItems,
    isLoading: computed(() => isLoading.value),
    isNavigationReady,
  }
}
