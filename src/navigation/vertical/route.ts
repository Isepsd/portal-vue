// src/@core/routes/route.ts
import { convertTreeToNav } from '@/@core/utils/convertTreeToNav'
import { useNavigationStore } from '@/pages/stores/navigation'
import { toRaw } from 'vue'

// 🔹 Ambil navigationStore langsung (misal data sudah ada)
const navigationStore = useNavigationStore()

// 🔹 Konversi tree dari store sekali saja di route
const convertedNavigation = convertTreeToNav(toRaw(navigationStore.navigation))

export default [
  {
    title: 'DASHBOARD',
    children: [
      {
        title: 'FASOP',
        children: [
          { title: 'Kinerja SCADA', to: 'dashboard-dashfasop-kinerjascada' },
          { title: 'Monitoring RTU', to: 'dashboards-dashfasop-monitoringrtu' },
          { title: 'Monitoring Gangguan', to: 'dashboards-dashfasop-monitoringgangguanscada' },
        ],
      },
      // Tambahkan hasil konversi store jika ada
     
    ],
  },
  {
    title: 'Administrator',
    children: [
      { title: 'Roles', to: 'admin-role' },
      { title: 'User Management', to: 'admin-users' },
      { title: 'Menu', to: 'admin-menu' },
    ],
  },
  //  ...convertedNavigation,
]
