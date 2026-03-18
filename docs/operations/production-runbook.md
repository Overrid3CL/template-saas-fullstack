# Runbook de Producción

## Checklist previo a release

1. Variables de entorno completas y validadas contra `.env.example`.
2. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` en verde.
3. Migraciones pendientes verificadas con `pnpm prisma:migrations:check`.
4. Endpoints demo desactivados en producción:
   - `ENABLE_DEMO_ENDPOINTS=false`
5. Better Auth con orígenes explícitos:
   - `BETTER_AUTH_TRUSTED_ORIGINS=https://tu-dominio.com`

## Despliegue recomendado

1. Desplegar aplicación con artefacto generado por `pnpm build`.
2. Ejecutar migraciones:
   - `pnpm prisma:migrate:deploy`
3. Levantar servicio y comprobar:
   - `GET /api/health/db`
4. Validar login, cambio de perfil y operación tenant crítica (miembros).

## Observabilidad mínima

- Logging estructurado JSON activo (`REQUEST_LOGS_ENABLED=true`).
- Nivel de logs por entorno:
  - `LOG_LEVEL=info` en producción.
  - `LOG_LEVEL=debug` en incidentes puntuales.
- Métricas mínimas a revisar (si tu plataforma las provee):
  - tasa de error 5xx,
  - latencia p95 de endpoints API,
  - reinicios del proceso.

## Manejo de incidentes

1. Confirmar impacto (usuarios/tenants afectados).
2. Revisar logs por `requestId` y endpoint.
3. Si hay regresión de release:
   - rollback de aplicación al build anterior.
4. Si la regresión depende de esquema:
   - evaluar rollback de DB según runbook de backup/restore.
5. Abrir postmortem con causa raíz y acciones preventivas.
