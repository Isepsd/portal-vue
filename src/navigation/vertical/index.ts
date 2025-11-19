import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useAuthStore } from '@/pages/stores/auth'
import { useNavigationStore } from '@/pages/stores/navigation'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import { useRouter } from 'vue-router'

export function useVerticalNav() {
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

  const verticalNavItems = computed(() => {
    const convertedNavigation =
      convertTreeToNav(toRaw(navigationStore.navigation), router, authStore) || []

    return [...convertedNavigation]
  })

  // 🔹 Pantau jika navigation kosong → logout otomatis
  watch(
    () => verticalNavItems.value,
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

  const isNavigationReady = computed(() => verticalNavItems.value.length > 0)

  return {
    verticalNavItems,
    isLoading: computed(() => isLoading.value),
    isNavigationReady,
  }
}
