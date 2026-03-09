// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['server/api/**/*.{ts,tsx,js,mjs,cjs}'],
    ignores: ['server/api/health/**', 'server/api/auth/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: [
            '~~/server/utils/prisma',
            '~/server/utils/prisma',
            './utils/prisma',
            '../utils/prisma',
            '../../utils/prisma',
            '../../../utils/prisma'
          ],
          message: 'Importa Prisma desde repositorios/servicios tenant-aware, no directamente en handlers de server/api.'
        }]
      }]
    }
  }
)
