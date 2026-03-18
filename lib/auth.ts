import { prismaAdapter } from 'better-auth/adapters/prisma'
import { betterAuth } from 'better-auth'
import { organization } from 'better-auth/plugins'
import { prisma } from '~~/server/utils/prisma'

const githubClientId = process.env.GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET
const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  ?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [organization()],
  trustedOrigins,
  socialProviders: githubClientId && githubClientSecret
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret
        }
      }
    : {}
})
