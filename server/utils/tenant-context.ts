import { createError, type H3Event } from 'h3'
import { auth } from '~~/lib/auth'

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>

export type TenantContext = {
  userId: string
  organizationId: string
  sessionId: string
}

export async function getSessionOrThrow(event: H3Event): Promise<NonNullable<AuthSession>> {
  const session = await auth.api.getSession({
    headers: event.headers
  })

  if (!session?.session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: {
        ok: false,
        error: 'AUTH_REQUIRED'
      }
    })
  }

  return session
}

export async function requireTenantContext(event: H3Event): Promise<TenantContext> {
  const session = await getSessionOrThrow(event)
  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Active organization is required',
      data: {
        ok: false,
        error: 'ACTIVE_ORGANIZATION_REQUIRED'
      }
    })
  }

  return {
    userId: session.user.id,
    organizationId,
    sessionId: session.session.id
  }
}
