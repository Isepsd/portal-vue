export function buildTree(flat:any) {
  const map = new Map()
  const roots:any = []

  flat.forEach((item:any) => {
    map.set(item.id, { 
      title: item.display,   // 👈 gunakan display sebagai title UI
      icon: item.icon,
      to: item.path || null,
      idParent: item.idParent,
      children: []
    })
  })

  flat.forEach((item:any) => {
    const node = map.get(item.id)
    if (item.idParent && map.has(item.idParent)) {
      map.get(item.idParent).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}
