import { useAuthStore } from '@/pages/stores/auth'
import type { NavGroup, NavLink, VerticalNavItems } from "@layouts/types"
import { toRaw } from 'vue'
import type { Router } from 'vue-router'

type MenuTree = {
  id?: string
  name?: string
  display?: string
  title?: string
  path?: string | null
  url?: string | null
  icon?: string | null
  children?: MenuTree[]
}

// 🔹 Format path agar cocok untuk router "to"
function convertPathFormat(path?: string | null): string | undefined {
  if (!path) return undefined

  let clean = path.startsWith('/') ? path.slice(1) : path
  clean = clean.replace(/-/g, '')      // hapus semua -
               .replace(/\//g, '-')    // ubah / menjadi -
               .replace(/_/g, '')      // hapus semua _
  return clean.trim()
}

// 🔹 FUNGSI UTAMA: Convert tree menu dari API ke format VerticalNavItems
export function convertTreeToNav(
  tree: MenuTree[] = [], 
  router?: Router | null,
  auth?: any
): VerticalNavItems {
  if (!Array.isArray(tree)) return []

  // 🔹 Gunakan auth yang di-pass atau fallback ke store
  const authStore = auth || useAuthStore()

  // 🔹 Buat getter privileges reactive
  const getPrivileges = () => toRaw(authStore.roleAccess?.privileges) || {}

  const mapTree:any = (nodes: MenuTree[]): VerticalNavItems => {
    return nodes.map((item): NavGroup | NavLink | null => {
      const title = item.display || item.name || item.title || 'Untitled'
      const iconClass =
        item.icon && typeof item.icon === 'string' && item.icon.trim()
          ? item.icon
          : 'fa-regular fa-circle'

      const privileges = getPrivileges()[item.name || ''] || []
      if (privileges.length === 0) return null

      if (item.children && item.children.length > 0) {
        const children = mapTree(item.children)
        if (children.length === 0) return null

        return {
          title,
          icon: { class: iconClass },
          privileges,
          children,
        } as NavGroup
      }

      let pathTo = convertPathFormat(item.path || item.url || undefined)
      
      // 🔹 Validasi route dengan safe check
      if (pathTo && router && typeof router.getRoutes === 'function') {
        try {
          const routes = router.getRoutes()
          if (!routes.some(r => r.name === pathTo)) {
            pathTo = 'notfound-notfound'
          }
        } catch (error) {
          console.warn('⚠️ Error checking routes:', error)
          pathTo = 'notfound-notfound'
        }
      } else if (pathTo && !router) {
        // 🔹 Fallback jika router tidak tersedia
        console.warn('⚠️ Router not available for route validation, using fallback')
        pathTo = 'notfound-notfound'
      }

      return {
        title,
        icon: { class: iconClass },
        to: pathTo,
        privileges,
      } as NavLink
    }).filter((i): i is NavLink | NavGroup => i !== null)
  }

  return mapTree(tree)
}
