---
name: nuxt-api-contracts-and-errors
description: Standardize request validation, response envelopes, and error mapping in Nuxt server/api endpoints for predictable frontend integration.
---

# Nuxt API Contracts and Errors

## Objetivo

Definir contratos API consistentes entre frontend y backend:
- validacion de entrada
- estructura de respuesta
- manejo uniforme de errores

## Cuando usar esta skill

Usar cuando:
- Se crea/modifica cualquier endpoint en `server/api/**`.
- Se expone una nueva operacion consumida por frontend.
- Se corrigen bugs por respuestas inconsistentes.

## Reglas de implementacion

- Validar `params`, `query` y `body` antes de ejecutar negocio.
- Mapear errores de dominio a HTTP:
  - `*_NOT_FOUND` -> `404`
  - `*_CONFLICT` -> `409`
  - `VALIDATION_*` -> `400`
  - `AUTH_REQUIRED` -> `401`
  - `ACTIVE_ORGANIZATION_REQUIRED` -> `403`
- Evitar lanzar errores opacos al cliente.
- Mantener mensajes de error estables y codigos de error claros.

## Envelope recomendado

Respuesta exitosa:
```ts
{
  ok: true,
  data: ...
}
```

Respuesta de error:
```ts
{
  ok: false,
  error: 'CUSTOMER_NOT_FOUND',
  message: 'Customer not found'
}
```

## Plantilla de handler

```ts
import { createError } from 'h3'

export default eventHandler(async (event) => {
  try {
    // validate + call service
    return { ok: true, data: {} }
  } catch (error: any) {
    if (error?.message === 'CUSTOMER_NOT_FOUND') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not found',
        data: { ok: false, error: 'CUSTOMER_NOT_FOUND' }
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { ok: false, error: 'UNEXPECTED_ERROR' }
    })
  }
})
```

## Checklist de PR

- [ ] Input validado antes de ejecutar negocio.
- [ ] Errores de dominio mapeados a codigos HTTP correctos.
- [ ] Contrato de respuesta estable para frontend.
- [ ] Sin excepciones sin capturar en paths esperados.
