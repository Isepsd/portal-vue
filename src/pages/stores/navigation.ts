// ✅ src/pages/stores/navigation.ts
import { stringToJSON } from "@/components/helper/data.helper"
import { initFlatMenu, initNestedMenu } from "@/components/helper/menu.helper"
import { getAllByPath } from "@/composables/main.service"
import axios from "axios"
import { defineStore } from "pinia"

const source = axios.CancelToken.source()

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    navigation: [] as any[],
    verticalNav: [] as any[],
    parentMenuOptions: [] as any[],
    isLoading: false,
    isInitialized: false,
  }),

  actions: {
    // ✅ Simpan menu
    setNavigation(menuItems: any[]) {
      this.navigation = menuItems
      localStorage.setItem("navigation", JSON.stringify(menuItems))
    },

    // ✅ Simpan vertical nav
    setVerticalNav(navItems: any[]) {
      this.verticalNav = navItems
      localStorage.setItem("verticalNav", JSON.stringify(navItems))
    },

    // ✅ Ambil menu dari API
    async fetchNavigation() {
      this.isLoading = true
      try {
        const req: any = await getAllByPath("menu", { page: -1, limit: -1 }, source.token)
        const menus = req.results.map((m: any) => ({
          ...m,
          idParent: m.idParent || "",
          privileges: stringToJSON(m.privileges),
        }))
        const nested = initNestedMenu("", menus, null)
        this.navigation = nested
        this.verticalNav = nested
        this.parentMenuOptions = initFlatMenu(nested).map((item: any) => ({
          value: item.id,
          label: `${"--".repeat(item.index)} ${item.display}`,
        }))
        localStorage.setItem("navigation", JSON.stringify(this.navigation))
        localStorage.setItem("verticalNav", JSON.stringify(this.verticalNav))
        this.isInitialized = true
        console.log("✅ Navigation fetched & saved")
      } catch (err) {
        console.error("❌ Failed to fetch navigation:", err)
      } finally {
        this.isLoading = false
      }
    },

    // ✅ Muat dari localStorage
    loadFromStorage() {
      try {
        const nav = localStorage.getItem("navigation")
        const vertical = localStorage.getItem("verticalNav")
        if (nav) this.navigation = JSON.parse(nav)
        if (vertical) this.verticalNav = JSON.parse(vertical)
        this.isInitialized = true
        console.log("✅ Navigation loaded from storage")
      } catch (e) {
        console.warn("⚠️ Failed to load navigation:", e)
      }
    },

    // ✅ Hapus navigation saat logout
    clearNavigation() {
      this.navigation = []
      this.verticalNav = []
      this.parentMenuOptions = []
      this.isInitialized = false
      this.isLoading = false
      localStorage.removeItem("navigation")
      localStorage.removeItem("verticalNav")
      console.log("🧹 Navigation cleared")
    },
  },
})
