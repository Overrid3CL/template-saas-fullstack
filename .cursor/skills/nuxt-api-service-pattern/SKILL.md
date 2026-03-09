---
name: nuxt-api-service-pattern
description: Enforce backend layering in Nuxt server routes. Use when creating or modifying endpoints in server/api so handlers stay thin and business logic lives in server/services.
---

# Nuxt API + Service Pattern

## Objetivo

Estandarizar backend en 3 capas:
- `server/api/**` para transporte HTTP
- `server/services/**` para logica de negocio
- `server/repositories/**` para acceso a datos

## Cuando usar esta skill

Usar cuando:
- Se crea/modifica un endpoint en `server/api/**`.
- Se agrega logica de negocio reutilizable.
- Se refactoriza codigo que hoy mezcla HTTP + negocio + datos.

## Flujo obligatorio

1. Endpoint valida input y obtiene contexto (auth/tenant).
2. Endpoint instancia service y llama un metodo de caso de uso.
3. Service orquesta reglas de negocio, repositorios y dependencias.
4. Repositorio ejecuta persistencia y consultas.
5. Endpoint traduce errores conocidos a respuestas HTTP.

## Reglas de implementacion

- **API handlers (`server/api/**`)**
  - Deben ser delgados: parseo, validacion, auth, response.
  - No deben contener reglas complejas ni queries directas.
- **Services (`server/services/**`)**
  - Son la capa principal de negocio.
  - Deben ser testeables y desacoplados de `H3Event`.
  - Pueden lanzar errores de dominio tipados (ej: `CUSTOMER_NOT_FOUND`).
- **Repositories (`server/repositories/**`)**
  - Encapsulan queries y persistencia.
  - No deben conocer detalles HTTP.
- **Prohibido**
  - Importar `server/utils/prisma` desde `server/api/**`.
  - Duplicar reglas de negocio en varios handlers.

## Convenciones de archivos

- Endpoint: `server/api/customers.ts`
- Service: `server/services/customer.service.ts`
- Repository: `server/repositories/customer.repository.ts`

Metodo recomendado:
- `list`, `getById`, `create`, `update`, `remove`

## Plantilla de endpoint

```ts
import { requireTenantContext } from '../utils/tenant-context'
import { CustomerService } from '../services/customer.service'

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const service = new CustomerService(tenant.organizationId)
  return service.list()
})
```

## Plantilla de service

```ts
import { CustomerRepository } from '../repositories/customer.repository'

export class CustomerService {
  constructor(private readonly organizationId: string) {}

  async list() {
    const repo = new CustomerRepository(this.organizationId)
    return repo.list()
  }
}
```

## Checklist de PR

- [ ] `server/api/**` queda sin logica de negocio compleja.
- [ ] Existe `server/services/**` para nuevos casos de uso.
- [ ] Repositorios concentran acceso a datos.
- [ ] Errores de dominio se traducen correctamente a HTTP.
