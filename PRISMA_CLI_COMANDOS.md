# Prisma CLI - Comandos utiles

Esta guia resume los comandos mas usados de Prisma CLI para instalar, ejecutar y mantener tu esquema/base de datos.

## Instalacion

Instala Prisma CLI como dependencia de desarrollo:

```bash
# npm
npm install prisma --save-dev

# pnpm
pnpm add prisma --save-dev

# yarn
yarn add prisma --dev

# bun
bun add prisma --dev
```

## Ejecutar Prisma CLI

Si Prisma esta instalado localmente, ejecútalo con el runner de tu gestor de paquetes:

```bash
# npm
npx prisma

# pnpm
pnpm dlx prisma

# yarn
yarn dlx prisma

# bun (forzar runtime Bun)
bunx --bun prisma
```

> Nota: En Bun, usa `--bun` para evitar que Prisma se ejecute con Node.js por el shebang del CLI.

## Comandos principales

```bash
# Inicializar Prisma en el proyecto
prisma init

# Generar artefactos (por ejemplo Prisma Client)
prisma generate

# Flujo de migracion en desarrollo (crea + aplica + genera client)
prisma migrate dev

# Crear migracion con nombre
prisma migrate dev --name init

# Aplicar migraciones existentes en entornos no interactivos (CI/prod)
prisma migrate deploy

# Sincronizar esquema con DB sin crear migraciones
prisma db push

# Hacer introspection desde una DB existente
prisma db pull

# Validar esquema
prisma validate

# Formatear esquema
prisma format

# Abrir Prisma Studio
prisma studio

# Ver version
prisma version

# Debug del CLI
prisma debug
```

## Ayuda por comando

```bash
prisma --help
prisma migrate --help
prisma db --help
```

## Códigos de salida

- `0`: ejecucion exitosa
- `1`: error en la ejecucion
- `130`: interrupcion por SIGINT o cancelacion de prompt

## Telemetria y privacidad

Para desactivar envio de datos de uso:

```bash
# Linux/macOS
export CHECKPOINT_DISABLE=1

# Windows PowerShell (sesion actual)
$env:CHECKPOINT_DISABLE = "1"
```

## Referencia oficial

- Documentacion Prisma CLI: [https://www.prisma.io/docs/orm/tools/prisma-cli](https://www.prisma.io/docs/orm/tools/prisma-cli)
- Referencia de comandos: [https://www.prisma.io/docs/orm/reference/prisma-cli-reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
