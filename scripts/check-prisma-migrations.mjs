import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const migrationsDir = join(process.cwd(), 'prisma', 'migrations')

if (!existsSync(migrationsDir)) {
  console.error('Missing prisma/migrations directory')
  process.exit(1)
}

const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

if (migrationDirs.length === 0) {
  console.error('No migration folders found in prisma/migrations')
  process.exit(1)
}

console.log(`Prisma migrations detected: ${migrationDirs.length}`)
