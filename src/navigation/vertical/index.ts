import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useNavigationStore } from '@/pages/stores/navigation'
import { computed, onMounted, ref, toRaw } from 'vue'
// 🔹 Static navigation fallback

export function useVerticalNav() {
  const navigationStore = useNavigationStore()

  const isLoading = ref(true)
  const isInitialized = ref(false)

  onMounted(() => {
    isLoading.value = false
    isInitialized.value = true
  })

  const verticalNavItems = computed(() => {
    console.log('=== DEBUG useVerticalNav ===')
    console.log('Navigation Store:', navigationStore.verticalNav)

    // 🔹 Convert navigation dari store, jika ada
    const convertedNavigation = convertTreeToNav(toRaw(navigationStore.navigation)) || []

    // 🔹 Spread array murni, bukan ComputedRef
    const navItems = [...convertedNavigation]

    console.log('✅ Final Vertical Nav Items:', navItems)
    console.log('===========================')
    return navItems
  })

  const isNavigationReady = computed(() => verticalNavItems.value.length > 0)

  return {
    verticalNavItems,
    isLoading: computed(() => isLoading.value),
    isNavigationReady,
  }
}
