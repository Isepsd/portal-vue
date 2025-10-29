// src/@core/utils/convertTreeToNav.ts
import type { NavGroup, NavLink, VerticalNavItems } from "@layouts/types"

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
  if (!path) return undefined;

  let clean = path.startsWith('/') ? path.slice(1) : path;

  clean = clean.replace(/-/g, '')      // hapus semua -
               .replace(/\//g, '-')    // ubah / menjadi -
               .replace(/_/g, '');     // hapus semua _

  return clean.trim();
}

// 🔹 FUNGSI UTAMA: Convert tree menu dari API ke format VerticalNavItems
export function convertTreeToNav(tree: MenuTree[] = []): VerticalNavItems {
  if (!Array.isArray(tree)) return []

  const result: VerticalNavItems = tree.map((item): NavGroup | NavLink | null => {
    const title = item.display || item.name || item.title || 'Untitled'

    const iconClass =
      item.icon && typeof item.icon === 'string' && item.icon.trim()
        ? item.icon
        : 'fa-regular fa-circle' // default kalau kosong

    if (item.children && item.children.length > 0) {
      return {
        title,
        icon: { class: iconClass },
        children: convertTreeToNav(item.children),
      } as NavGroup
    }

    return {
      title,
      icon: { class: iconClass },
      to: convertPathFormat(item.path || item.url || undefined),
    } as NavLink
  }).filter((i): i is NavLink | NavGroup => i !== null)

  return result
}


