import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useAuthStore } from '@/pages/stores/auth'
import { useNavigationStore } from '@/pages/stores/navigation'
import { computed, onMounted, ref, toRaw } from 'vue'
import { useRouter } from 'vue-router'

export function useVerticalNav() {
  const navigationStore = useNavigationStore()
  const authStore = useAuthStore()
  const router = useRouter()

  const isLoading = ref(true)
  const isInitialized = ref(false)

  onMounted(() => {
    isLoading.value = false
    isInitialized.value = true
  })

  const verticalNavItems = computed(() => {
    // console.log('=== DEBUG useVerticalNav ===')
    // console.log('Navigation Store:', navigationStore.navigation)
    // console.log('Router available:', !!router)

    // 🔹 Convert navigation dari store, dengan router dan auth
    const convertedNavigation = convertTreeToNav(
      toRaw(navigationStore.navigation),
      router,
      authStore
    ) || []

    // 🔹 Spread array murni, bukan ComputedRef
    const navItems = [...convertedNavigation]

    // console.log('✅ Final Vertical Nav Items:', navItems)
    // console.log('===========================')
    return navItems
  })

  const isNavigationReady = computed(() => verticalNavItems.value.length > 0)

  return {
    verticalNavItems,
    isLoading: computed(() => isLoading.value),
    isNavigationReady,
  }
}
