# Implementacion de RLS para multi-tenant

## Objetivo

Agregar una segunda barrera de seguridad en PostgreSQL para que las filas de un tenant nunca sean visibles para otro tenant, incluso si una query de aplicacion olvida filtrar por `organizationId`.

## Que protege RLS y que no protege

- Protege lecturas y escrituras por fila (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) en tablas con politicas.
- Reduce impacto de errores humanos en handlers o repositorios.
- No reemplaza validaciones de negocio ni autorizacion por roles.
- Requiere que toda tabla de negocio tenga `organization_id`.

## Estrategia recomendada

Usar una variable de sesion por request con `SET LOCAL` y politicas que comparen contra esa variable:

```sql
SET LOCAL app.current_organization_id = 'org_123';
```

Luego, cada policy usa:

```sql
organization_id = current_setting('app.current_organization_id', true)
```

## SQL base para habilitar RLS

Ejemplo sobre una tabla `customers`:

```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

CREATE POLICY customers_select_policy
ON public.customers
FOR SELECT
USING (
  organization_id = current_setting('app.current_organization_id', true)
);

CREATE POLICY customers_insert_policy
ON public.customers
FOR INSERT
WITH CHECK (
  organization_id = current_setting('app.current_organization_id', true)
);

CREATE POLICY customers_update_policy
ON public.customers
FOR UPDATE
USING (
  organization_id = current_setting('app.current_organization_id', true)
)
WITH CHECK (
  organization_id = current_setting('app.current_organization_id', true)
);

CREATE POLICY customers_delete_policy
ON public.customers
FOR DELETE
USING (
  organization_id = current_setting('app.current_organization_id', true)
);
```

## Integracion con Prisma

Prisma no expone una API de RLS directamente, pero puedes establecer la variable dentro de una transaccion:

```ts
await prisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe(
    `SET LOCAL app.current_organization_id = '${organizationId}'`,
  )

  return tx.customer.findMany()
})
```

Recomendaciones:

- Preferir `$executeRaw` parametrizado cuando sea posible.
- Evitar concatenar strings con input de usuario.
- Encapsular este patron en una utilidad (por ejemplo `withTenantRls(tx, organizationId)`).
- Verificar comportamiento con pooling; `SET LOCAL` vive en el contexto de transaccion.

## Rollout seguro

1. Identificar tablas tenantizadas (ya con `organization_id`).
2. Habilitar RLS primero en una tabla de bajo riesgo.
3. Ejecutar pruebas A/B (org A no debe ver org B).
4. Monitorear errores de acceso.
5. Repetir tabla por tabla.

## Rollback

Si detectas impacto operativo:

```sql
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customers_select_policy ON public.customers;
DROP POLICY IF EXISTS customers_insert_policy ON public.customers;
DROP POLICY IF EXISTS customers_update_policy ON public.customers;
DROP POLICY IF EXISTS customers_delete_policy ON public.customers;
```

Rollback recomendado solo temporal, con incidente registrado y plan de correccion.
