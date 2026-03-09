---
name: nuxt-frontend-layering
description: Frontend architecture guardrails for Nuxt SSR=false apps. Use when building pages/components/composables to keep responsibilities clear and avoid logic duplication.
---

# Nuxt Frontend Layering

## Objetivo

Mantener una arquitectura frontend clara para Nuxt (`ssr: false`) separando:
- UI (`app/components/**`)
- Pantallas (`app/pages/**`)
- Estado y casos de uso cliente (`app/composables/**`)
- Tipos y utilidades (`app/types/**`, `app/utils/**`)

## Cuando usar esta skill

Usar cuando:
- Se crean nuevas paginas o componentes.
- Se mueve logica repetida fuera de vistas.
- Se conecta UI con APIs de `server/api/**`.

## Flujo recomendado

1. Definir tipos de datos para la feature.
2. Crear/actualizar composable con fetch + estado + acciones.
3. Consumir composable desde pagina.
4. Mantener componentes como presentacionales cuando sea posible.
5. Mostrar feedback de carga/error de forma consistente.

## Reglas de implementacion

- **Pages (`app/pages/**`)**
  - Componen layout y flujos de pantalla.
  - Evitan concentrar logica de datos extensa.
- **Composables (`app/composables/**`)**
  - Source of truth para estado de feature.
  - Encapsulan llamadas a API y transformaciones.
  - Exponen API minima: `data`, `loading`, `error`, `actions`.
- **Components (`app/components/**`)**
  - Priorizan props + emits.
  - No deben hacer fetch directo salvo excepcion justificada.
- **Validacion**
  - Formularios con esquema (`zod`) y mensajes consistentes.

## Convenciones sugeridas

- Composable por feature:
  - `useCustomers()`
  - `useOrganizationMembers()`
  - `useCurrentUser()`
- Estado estandar:
  - `loading`, `error`, `refresh`, `mutations`

## Checklist de PR

- [ ] No hay fetch duplicado entre paginas/components.
- [ ] La logica de datos vive en composables reutilizables.
- [ ] Paginas quedan enfocadas en estructura y UX.
- [ ] Formularios usan validacion consistente.
- [ ] Estados loading/error/success estan cubiertos.
