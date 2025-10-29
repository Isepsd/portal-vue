import moment from 'moment'
import { defineStore } from 'pinia'
import { useNavigationStore } from './navigation'

// Helper aman untuk parsing localStorage
function safeParse(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw || raw === 'undefined') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!safeParse('credentials'),
    credentials: safeParse('credentials'),
    currentUser: safeParse('me'),
    isUpdk: !!safeParse('me')?.id_unit_pembangkit,
    roleAccess: safeParse('access'),
    activeMenu: safeParse('activeMenu'),
    power: safeParse('power'),
    roleUser: safeParse('me')?.user_role_id?.role_id_app,
    sessionLifetime: safeParse('accepted') || {
      rememberMe: false,
      time: null,
    },
  }),

  actions: {
    loginUser(payload: any) {
      this.isLoggedIn = true
      this.credentials = payload
      localStorage.setItem('credentials', JSON.stringify(payload))
    },

    refreshToken(payload: any) {
      this.isLoggedIn = true
      this.credentials = payload
      localStorage.setItem('credentials', JSON.stringify(payload))
    },

    setLoggedInUserDetail(user: any) {
      this.currentUser = user
      this.isUpdk = !!user?.id_unit_pembangkit
      this.roleUser = user?.user_role_id?.role_id_app
      localStorage.setItem('me', JSON.stringify(user))
    },

    setRoleAccess(access: any) {
      this.roleAccess = access
      localStorage.setItem('access', JSON.stringify(access))
    },

    setActiveMenu(menu: any) {
      this.activeMenu = menu
      localStorage.setItem('activeMenu', JSON.stringify(menu))
    },

    setUnitPembangkit(power: any) {
      this.power = power
      localStorage.setItem('power', JSON.stringify(power))
    },

    setSessionLifetime(payload: { rememberMe: boolean }) {
      this.sessionLifetime = {
        rememberMe: payload.rememberMe,
        time: moment().valueOf(),
      }
      localStorage.setItem('accepted', JSON.stringify(this.sessionLifetime))
    },

    logoutUser() {
      localStorage.removeItem('credentials')
      localStorage.removeItem('me')
      localStorage.removeItem('access')
      localStorage.removeItem('power')
      localStorage.removeItem('activeMenu')
      localStorage.removeItem('accepted')
      localStorage.removeItem('rgroup')
      localStorage.removeItem('layout')
      localStorage.removeItem('navigation')
      localStorage.removeItem('g-refresh')
      localStorage.removeItem('themeMode')

      this.isLoggedIn = false
      this.credentials = null
      this.currentUser = null
      this.roleAccess = null
      this.isUpdk = false
      this.power = null
      this.roleUser = null
      this.activeMenu = null
      this.sessionLifetime = { rememberMe: false, time: null }

      // 🔹 Clear navigation store on logout
      const navigationStore = useNavigationStore()
      navigationStore.clearNavigation()
    },

    loadUser(payload: any) {
      this.currentUser = payload
    },
  },
})
