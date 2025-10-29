import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useNavigationStore } from '@/pages/stores/navigation'
import { computed } from 'vue'

export function useVerticalNav() {
  const navigationStore = useNavigationStore()

  const verticalNavItems = computed(() => {
    console.log('=== DEBUG VERTICAL NAV (BYPASS FILTER) ===')
    console.log('Navigation Store:', navigationStore.navigation)
    console.log('Raw Menu Store:', JSON.stringify(navigationStore.navigation, null, 2))

    // 🔹 Langsung convert menu store tanpa filter
    const nav = convertTreeToNav(navigationStore.navigation)
    console.log('Converted Vertical Nav Items:', nav)
    console.log('==========================')

    return nav
  })

  return { verticalNavItems }
}
