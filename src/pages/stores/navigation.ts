import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    navigation: [],
  }),
  actions: {
    setNavigation(menuItems: any) {
      this.navigation = menuItems
    },
  },
})
