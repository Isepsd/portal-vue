import { setupWorker } from 'msw/browser'

// Handlers
import { handlerAppBarSearch } from '@db/app-bar-search/index'
import { handlerAppsAcademy } from '@db/apps/academy/index'
import { handlerAppsCalendar } from '@db/apps/calendar/index'
import { handlerAppsChat } from '@db/apps/chat/index'
import { handlerAppsEcommerce } from '@db/apps/ecommerce/index'
import { handlerAppsEmail } from '@db/apps/email/index'
import { handlerAppsInvoice } from '@db/apps/invoice/index'
import { handlerAppsKanban } from '@db/apps/kanban/index'
import { handlerAppLogistics } from '@db/apps/logistics/index'
import { handlerAppsPermission } from '@db/apps/permission/index'
import { handlerAppsUsers } from '@db/apps/users/index'
import { handlerAuth } from '@db/auth/index'
import { handlerDashboard } from '@db/dashboard/index'
import { handlerPagesDatatable } from '@db/pages/datatable/index'
import { handlerPagesFaq } from '@db/pages/faq/index'
import { handlerPagesHelpCenter } from '@db/pages/help-center/index'
import { handlerPagesProfile } from '@db/pages/profile/index'

const worker = setupWorker(
  ...handlerAppsEcommerce,
  ...handlerAppsAcademy,
  ...handlerAppsInvoice,
  ...handlerAppsUsers,
  ...handlerAppsEmail,
  ...handlerAppsCalendar,
  ...handlerAppsChat,
  ...handlerAppsPermission,
  ...handlerPagesHelpCenter,
  ...handlerPagesProfile,
  ...handlerPagesFaq,
  ...handlerPagesDatatable,
  ...handlerAppBarSearch,
  ...handlerAppLogistics,
  ...handlerAuth,
  ...handlerAppsKanban,
  ...handlerDashboard,
)

// Jalankan worker hanya jika mode Vite adalah "mock"
export default function () {
  if (import.meta.env.MODE === 'mock') {
    const workerUrl = `${import.meta.env.BASE_URL ?? '/'}mockServiceWorker.js`

    worker
      .start({
        serviceWorker: {
          url: workerUrl,
        },
        // Ubah dari 'bypass' jadi 'warn' agar tidak kirim ulang request
        onUnhandledRequest: 'warn',
      })
      .then(() => {
        console.info('[MSW] Mock Service Worker aktif (mode: mock)')
      })
      .catch((err) => {
        console.error('[MSW] Gagal memulai Mock Service Worker:', err)
      })
  } else {
    console.info('[MSW] Tidak aktif (mode:', import.meta.env.MODE, ')')
  }
}
