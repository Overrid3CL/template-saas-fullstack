# Template SaaS: Nuxt + Better Auth Organizations + Prisma

[![Nuxt UI](https://img.shields.io/badge/Hecho%20con-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Template base para crear aplicaciones SaaS con [Nuxt](https://nuxt.com), autenticacion con [Better Auth](https://www.better-auth.com), soporte multi-tenant con organizaciones y persistencia de datos con [Prisma](https://www.prisma.io).

- Enfoque SaaS listo para extender: auth, organizaciones y base de datos.
- Interfaz construida con Nuxt UI para acelerar dashboards y paneles administrativos.
- Configuracion preparada para PostgreSQL y flujo de migraciones con Prisma.

<a href="https://nuxt.com/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png">
    <img alt="Template SaaS con Nuxt" src="https://ui.nuxt.com/assets/templates/nuxt/starter-light.png" width="830" height="466">
  </picture>
</a>

## Stack principal

- **Nuxt** para la aplicacion full-stack y renderizado.
- **Better Auth + Organizations** para autenticacion y gestion por organizaciones.
- **Prisma** para modelado de datos, cliente tipado y migraciones.
- **PostgreSQL** como motor de base de datos recomendado.

## Que incluye este template

- Base de autenticacion y estructura para organizaciones (multi-tenant).
- Configuracion de Prisma lista para conectar con PostgreSQL.
- Estructura inicial de app SaaS sobre Nuxt UI.
- Scripts de desarrollo, build, tests y flujo de migraciones.

## Inicio rapido

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/starter
```

## Despliega tu propia version

[![Deploy con Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

## Instalacion

Asegurate de instalar las dependencias:

```bash
pnpm install
```

## Prisma + PostgreSQL

Este proyecto incluye Prisma ORM v7 configurado para PostgreSQL mediante una `DATABASE_URL` externa.

1. Crea `.env` a partir de `.env.example` (copiando el archivo manualmente o con tu shell).

2. Actualiza `DATABASE_URL` en `.env` para apuntar a tu instancia de PostgreSQL.

3. Cambio en Prisma v7: la URL de conexion se define en `prisma.config.ts` (no en `prisma/schema.prisma`).

4. Genera el cliente de Prisma:

```bash
pnpm prisma:generate
```

5. El proyecto incluye una migracion base versionada en `prisma/migrations/0001_init`.

6. Para cambios de esquema posteriores, crea una nueva migracion:

```bash
pnpm prisma:migrate:dev --name <descripcion-del-cambio>
```

7. En despliegues productivos aplica migraciones pendientes:

```bash
pnpm prisma:migrate:deploy
```

8. Opcional: abre Prisma Studio:

```bash
pnpm prisma:studio
```

### Endpoint de salud de base de datos

Hay un endpoint de health check disponible en:

`GET /api/health/db`

Ejecuta una consulta simple `SELECT 1` usando Prisma y devuelve si la conexion a la base de datos esta saludable.

Para Prisma v7, el cliente runtime tambien utiliza un adaptador PostgreSQL (`@prisma/adapter-pg`) con `pg`.

## Servidor de desarrollo

Inicia el servidor de desarrollo en `http://localhost:3000`:

```bash
pnpm dev
```

## Pruebas y quality gates

Ejecuta validaciones locales antes de abrir PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm prisma:migrations:check
```

## Produccion

Compila la aplicacion para produccion:

```bash
pnpm build
```

Previsualiza localmente el build de produccion:

```bash
pnpm preview
```

### Variables de entorno de produccion

Revisa y completa `.env.example`. Variables claves para salida a produccion:

- `BETTER_AUTH_TRUSTED_ORIGINS` para limitar orígenes permitidos en auth.
- `ENABLE_DEMO_ENDPOINTS=false` para desactivar endpoints demo (`/api/mails`, `/api/notifications`, `/api/example`).
- `OBJECT_STORAGE_*` para carga de avatar en S3/R2 compatible.
- `LOG_LEVEL` y `REQUEST_LOGS_ENABLED` para logging estructurado.

### Runbooks operativos

- [Runbook de producción](./docs/operations/production-runbook.md)
- [Runbook de backup y restore](./docs/operations/backup-restore.md)

Consulta la [documentacion de despliegue](https://nuxt.com/docs/getting-started/deployment) para mas informacion.
