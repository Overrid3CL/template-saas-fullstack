---
name: multi-tenant-guardrails
description: Enforces Better Auth + Prisma multi-tenant isolation with activeOrganizationId. Use when creating or changing server endpoints, repositories, Prisma queries, or tenant security rules to prevent cross-tenant data leaks.
---

# Multi-Tenant Guardrails

## Objetivo

Aplicar aislamiento por tenant en backend usando `activeOrganizationId` como contexto obligatorio y evitando acceso directo a Prisma desde handlers o servicios.

## Cuándo usar esta skill

Usar cuando:
- Se crean/modifican endpoints en `server/api/**`.
- Se agregan queries con Prisma.
- Se implementan repositorios de datos.
- Se revisa seguridad multi-tenant o RLS.

## Flujo obligatorio

1. Obtener contexto tenant desde sesión server-side:
   - `requireTenantContext(event)` de `server/utils/tenant-context.ts`.
   - Si no hay sesión: `401`.
   - Si no hay organización activa: `403`.
2. En handlers (`server/api/**`), NO importar `server/utils/prisma`.
3. Delegar logica de negocio a `server/services/**`.
4. En servicios, usar repositorios tenant-aware en `server/repositories/**`.
5. En repositorios, inyectar siempre `organizationId` en `where`/`data`.
5. Verificar lint de archivos tocados y confirmar que no haya bypass.

## Reglas de implementación

- **Source of truth**: `session.activeOrganizationId`.
- **Arquitectura**:
  - `server/api/**` = capa HTTP (validacion/request/response).
  - `server/services/**` = reglas de negocio y orquestacion.
  - `server/repositories/**` = queries y persistencia.
- **Prohibido**:
  - `prisma.model.findMany()` directo en handlers o services.
  - aceptar `organizationId` desde frontend para aislamiento principal.
- **Permitido**:
  - filtros adicionales de negocio, siempre sumados al filtro tenant.

## Plantilla rápida para endpoint

```ts
import { requireTenantContext } from '../utils/tenant-context'
import { CustomerService } from '../services/customer.service'

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const service = new CustomerService(tenant.organizationId)
  return service.list()
})
```

## Plantilla rapida para service

```ts
import { CustomerRepository } from '../repositories/customer.repository'

export class CustomerService {
  constructor(private readonly organizationId: string) {}

  async list() {
    const repository = new CustomerRepository(this.organizationId)
    return repository.list()
  }
}
```

## Checklist de PR

- [ ] Handler usa `requireTenantContext`.
- [ ] No hay import directo de Prisma en `server/api/**`.
- [ ] El endpoint delega en `server/services/**`.
- [ ] Repositorio aplica `organizationId` en operaciones.
- [ ] Se validó `401` sin sesión y `403` sin org activa.
- [ ] Si aplica, se documentó estrategia RLS.

## Recursos

- Guía RLS: [../../../docs/prisma/rls-implementation.md](../../../docs/prisma/rls-implementation.md)
- Pruebas A/B: [../../../docs/testing/tenant-isolation-tests.md](../../../docs/testing/tenant-isolation-tests.md)
- Base repo: [../../../server/repositories/base/base-tenant-repository.ts](../../../server/repositories/base/base-tenant-repository.ts)
