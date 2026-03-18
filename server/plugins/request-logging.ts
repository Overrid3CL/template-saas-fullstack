import { randomUUID } from 'node:crypto'
import { getRequestIP } from 'h3'
import { logger } from '../utils/logger'

type EventContextWithRequestMeta = {
  requestId?: string
  requestStartAt?: number
}

export default defineNitroPlugin((nitroApp) => {
  const enabled = process.env.REQUEST_LOGS_ENABLED !== 'false'
  if (!enabled) {
    return
  }

  nitroApp.hooks.hook('request', (event) => {
    const context = event.context as EventContextWithRequestMeta
    context.requestId = randomUUID()
    context.requestStartAt = Date.now()

    logger.info('http.request.received', {
      requestId: context.requestId,
      method: event.method,
      path: event.path,
      ip: getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    })
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const context = event.context as EventContextWithRequestMeta
    const durationMs = context.requestStartAt ? Date.now() - context.requestStartAt : undefined

    logger.info('http.request.completed', {
      requestId: context.requestId,
      method: event.method,
      path: event.path,
      statusCode: event.node.res.statusCode,
      durationMs
    })
  })

  nitroApp.hooks.hook('error', (error, { event }) => {
    const context = (event?.context || {}) as EventContextWithRequestMeta

    logger.error('http.request.failed', {
      requestId: context.requestId,
      method: event?.method,
      path: event?.path,
      errorName: error.name,
      errorMessage: error.message
    })
  })
})
