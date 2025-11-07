import type { RouteRecordRaw } from 'vue-router/auto'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend


      return { name: 'dashboards-dashfasop-kinerjascada', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]

export const routes: RouteRecordRaw[] = [
  // Email filter
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  // Email label
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      // contentClass: 'email-application',
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: () => import('@/pages/apps/logistics/dashboard.vue'),
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: () => import('@/pages/apps/academy/dashboard.vue'),
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
  {
    path: '/notfound/notfound',
    name: 'notfound-notfound',
    component: () => import('@/pages/notfound/notfound.vue'),
  },

   // ✅ Tambahan route untuk menu administrator → roles menu
//   {
//   path: '/administrator/rolesettings',
//   name: 'administrator-rolesettings',
//   component: () => import('@/pages/administrator/rolesettings.vue'),
//   meta: {
//     requiresAuth: true,
//     navActiveLink: 'administrator-rolesettings',
//   },
// },
//  {
//     path: '/dashboards/kinerjascada',
//     name: 'dashboards-kinerjascada',
//     component: () => import('@/pages/dashboards/kinerjascada.vue'),
//     meta: {
//       requiresAuth: true,
//       navActiveLink: 'dashboard',
//     },
//   },


  // {
  //   path: '/administrator/roles',
  //   name: 'administrator-roles', 
  //   component: () => import('@/pages/administrator/roles.vue'),
  //   // meta: {
  //   //   requiresAuth: true,
  //   //   navActiveLink: 'settings',
  //   // },
  // },

  // ✅ Route untuk Kinerja Scada Dashboard
  // {
  //   path: '/dashboards/dashfasop/kinerjascada',
  //   name: 'dashboards-dashfasop-kinerjascada',
  //   component: () => import('@/pages/dashboards/dashfasop/kinerjascada.vue'),
  //   // meta: {
  //   //   requiresAuth: true,
  //   //   navActiveLink: 'dashboards-dashfasop-kinerjascada',
  //   },
  // },

  // ✅ Routes untuk Pembangkit Form
  {
    path: '/jaringan/pembangkit/tambah',
    name: 'jaringan-pembangkit-tambah',
    component: () => import('@/pages/jaringan/component/form/FormPembangkit/pembangkit-form-page.vue'),
    
  },
  {
    path: '/jaringan/pembangkit/edit/:id',
    name: 'jaringan-pembangkit-edit',
    component: () => import('@/pages/jaringan/component/form/FormPembangkit/pembangkit-form-page.vue'),
   
  },
  {
    path: '/jaringan/unitpembangkit/tambah',
    name: 'jaringan-unitpembangkit-tambah',
    component: () => import('@/pages/jaringan/component/form/FormUnitPembangkit/unit-pembangkit-form-page.vue'),
    
  },
  {
    path: '/jaringan/unitpembangkit/edit/:id',
    name: 'jaringan-unitpembangkit-edit',
    component: () => import('@/pages/jaringan/component/form/FormUnitPembangkit/unit-pembangkit-form-page.vue'),
   
  },
  {
    path: '/jaringan/jenispembangkit/tambah',
    name: 'jaringan-jenispembangkit-tambah',
    component: () => import('@/pages/jaringan/component/form/FormJenisPembangkit/jenis-pembangkit-form-page.vue'),
    
  },
  {
    path: '/jaringan/jenispembangkit/edit/:id',
    name: 'jaringan-jenispembangkit-edit',
    component: () => import('@/pages/jaringan/component/form/FormJenisPembangkit/jenis-pembangkit-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/kelompokgangguan/tambah',
    name: 'masteropsisdis-kelompokgangguan-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/FormKelompokGangguan/kelompok-gangguan-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/kelompokgangguan/edit/:id',
    name: 'masteropsisdis-kelompokgangguan-edit',
    component: () => import('@/pages/masteropsisdis/component/form/FormKelompokGangguan/kelompok-gangguan-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/dampakkerusakan/tambah',
    name: 'masteropsisdis-dampakkerusakan-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formdampakkerusakan/dampak-kerusakan-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/dampakkerusakan/edit/:id',
    name: 'masteropsisdis-dampakkerusakan-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formdampakkerusakan/dampak-kerusakan-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/equipment/tambah',
    name: 'masteropsisdis-equipment-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formequipment/equipment-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/equipment/edit/:id',
    name: 'masteropsisdis-equipment-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formequipment/equipment-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/subfasilitas/tambah',
    name: 'masteropsisdis-subfasilitas-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formsubfasilitas/subfasilitas-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/subfasilitas/edit/:id',
    name: 'masteropsisdis-subfasilitas-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formsubfasilitas/subfasilitas-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/fasilitas/tambah',
    name: 'masteropsisdis-fasilitas-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formfasilitas/fasilitas-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/fasilitas/edit/:id',
    name: 'masteropsisdis-fasilitas-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formfasilitas/fasilitas-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/penyebabgangguan/tambah',
    name: 'masteropsisdis-penyebabgangguan-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formpenyebabgangguan/penyebabgangguan-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/penyebabgangguan/edit/:id',
    name: 'masteropsisdis-penyebabgangguan-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formpenyebabgangguan/penyebabgangguan-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/cuaca/tambah',
    name: 'masteropsisdis-cuaca-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formcuaca/cuaca-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/cuaca/edit/:id',
    name: 'masteropsisdis-cuaca-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formcuaca/cuaca-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/indikasi/tambah',
    name: 'masteropsisdis-indikasi-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formindikasi/indikasi-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/indikasi/edit/:id',
    name: 'masteropsisdis-indikasi-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formindikasi/indikasi-form-page.vue'),
   
  },
  {
    path: '/masteropsisdis/dispatcher/tambah',
    name: 'masteropsisdis-dispatcher-tambah',
    component: () => import('@/pages/masteropsisdis/component/form/Formdispatcher/dispatcher-form-page.vue'),
    
  },
  {
    path: '/masteropsisdis/dispatcher/edit/:id',
    name: 'masteropsisdis-dispatcher-edit',
    component: () => import('@/pages/masteropsisdis/component/form/Formdispatcher/dispatcher-form-page.vue'),
   
  },
]
