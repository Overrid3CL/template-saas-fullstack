import { createError } from 'h3'
import { errorData } from './api-response'

function isDemoEnabled() {
  if (process.env.ENABLE_DEMO_ENDPOINTS === 'true') {
    return true
  }

  return process.env.NODE_ENV !== 'production'
}

export function assertDemoEndpointEnabled() {
  if (isDemoEnabled()) {
    return
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
    data: errorData('ENDPOINT_NOT_AVAILABLE')
  })
}
