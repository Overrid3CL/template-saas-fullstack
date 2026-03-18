# Runbook de Backup y Restore

## Objetivo

Definir una estrategia mínima de respaldo y recuperación para PostgreSQL en producción.

## Política sugerida

- Backup completo diario.
- Backup incremental o WAL continuo (según proveedor).
- Retención mínima: 14 días.
- Al menos una copia en región/almacenamiento distinto.

## Comandos de referencia (PostgreSQL autogestionado)

### Backup lógico

```bash
pg_dump "$DATABASE_URL" --format=custom --file="backup-$(date +%F).dump"
```

### Restore en base destino

```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "backup-YYYY-MM-DD.dump"
```

## Verificación de backup

1. Restaurar en entorno temporal (staging o DB efímera).
2. Ejecutar smoke checks:
   - `GET /api/health/db`
   - login y lectura tenant básica.
3. Registrar tiempo de recuperación real (RTO) y punto de recuperación (RPO).

## Procedimiento de emergencia

1. Congelar escrituras de aplicación si hay corrupción activa.
2. Seleccionar último backup válido.
3. Restaurar en instancia nueva.
4. Redirigir aplicación a la instancia restaurada.
5. Ejecutar validación funcional crítica post-restore.
6. Comunicar ventana e impacto a stakeholders.
