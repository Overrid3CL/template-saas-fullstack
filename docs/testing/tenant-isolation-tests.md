# Tenant isolation test plan (A/B)

## Precondiciones

- Existen dos usuarios autenticados:
  - `userA` con `activeOrganizationId = orgA`
  - `userB` con `activeOrganizationId = orgB`
- Cada org tiene datos propios en los recursos a evaluar.
- Endpoints protegidos usan `requireTenantContext`.

## Casos A/B minimos

### 1) Lectura aislada por tenant

- `userA` solicita `GET /api/customers`.
- Validar: todas las filas corresponden a `orgA`.
- `userB` solicita `GET /api/customers`.
- Validar: todas las filas corresponden a `orgB`.
- Validar cruzado: respuesta de `userA` no coincide con `userB`.

### 2) Escritura aislada por tenant

- `userA` crea un registro en endpoint de escritura de customers.
- `userB` no puede ver ni modificar ese registro.
- `userB` crea otro registro y `userA` no puede accederlo.

### 3) Request autenticada sin organizacion activa

- Forzar sesion sin `activeOrganizationId`.
- Solicitar endpoint protegido.
- Validar respuesta `403` y error `ACTIVE_ORGANIZATION_REQUIRED`.

### 4) Request sin sesion

- Solicitar endpoint protegido sin cookie/token.
- Validar respuesta `401` y error `AUTH_REQUIRED`.

### 5) Bypass guardrail (arquitectura)

- Ejecutar `pnpm lint`.
- Validar que no haya imports directos de `server/utils/prisma` en `server/api/**`.

## Script de verificacion manual sugerido

```bash
# 1) Login userA en navegador o cliente API, luego:
curl -i http://localhost:3000/api/customers

# 2) Login userB y repetir:
curl -i http://localhost:3000/api/customers

# 3) Comparar payloads y status codes.
```

## Criterio de salida

- Todos los casos anteriores pasan.
- No hay endpoint protegido que responda datos cross-tenant.
- Lint sin violaciones de guardrail de Prisma directo en handlers.
