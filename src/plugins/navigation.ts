import { useNavigationStore } from '@/pages/stores/navigation'
import type { App } from 'vue'

export default function (app: App) {
  // 🔹 Initialize navigation store after Pinia is ready
  // This ensures getActivePinia() is available
  const navigationStore = useNavigationStore()
  navigationStore.loadFromStorage()
  console.log('🚀 Navigation store initialized via plugin')
}
