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
    const convertedNavigation =
      convertTreeToNav(toRaw(navigationStore.navigation), router, authStore) || []

    return [...convertedNavigation]
  })

  const isNavigationReady = computed(() => verticalNavItems.value.length > 0)

  return {
    verticalNavItems,
    isLoading: computed(() => isLoading.value),
    isNavigationReady,
  }
}
