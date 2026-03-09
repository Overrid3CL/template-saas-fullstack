export type DashboardNavItem = {
  label: string
  to: string
  description?: string
  exact?: boolean
}

export type DashboardNavSection = {
  label: string
  items: DashboardNavItem[]
}

export const dashboardNavSections: DashboardNavSection[] = [
  {
    label: 'General',
    items: [
      {
        label: 'Inicio',
        to: '/dashboard',
        description: 'Resumen general del sistema',
        exact: true
      },
      {
        label: 'Bandeja de entrada',
        to: '/inbox',
        description: 'Mensajes y notificaciones'
      },
      {
        label: 'Clientes',
        to: '/customers',
        description: 'Listado y actividad de clientes'
      }
    ]
  },
  {
    label: 'Configuracion',
    items: [
      {
        label: 'General',
        to: '/settings',
        description: 'Preferencias generales del tenant'
      },
      {
        label: 'Miembros',
        to: '/settings/members',
        description: 'Usuarios y permisos de acceso'
      },
      {
        label: 'Notificaciones',
        to: '/settings/notifications',
        description: 'Canales y reglas de alertas'
      },
      {
        label: 'Seguridad',
        to: '/settings/security',
        description: 'Politicas de seguridad y acceso'
      }
    ]
  },
  {
    label: 'Soporte',
    items: [
      {
        label: 'Comentarios',
        to: '/feedback',
        description: 'Comentarios y solicitudes del equipo'
      },
      {
        label: 'Ayuda y soporte',
        to: '/help-support',
        description: 'Documentacion y soporte tecnico'
      }
    ]
  }
]

export const dashboardNavItems = dashboardNavSections.flatMap(section => section.items)

export function findDashboardNavItemByPath(path: string) {
  const exactMatch = dashboardNavItems.find(item => item.exact && item.to === path)
  if (exactMatch) {
    return exactMatch
  }

  const startsWithMatches = dashboardNavItems
    .filter(item => path === item.to || path.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)

  return startsWithMatches[0]
}
