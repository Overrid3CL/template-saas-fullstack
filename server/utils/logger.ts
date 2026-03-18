type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
}

function getConfiguredLevel(): LogLevel {
  const level = process.env.LOG_LEVEL
  if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
    return level
  }

  return 'info'
}

function canLog(level: LogLevel) {
  return levelOrder[level] >= levelOrder[getConfiguredLevel()]
}

function write(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  if (!canLog(level)) {
    return
  }

  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context
  }

  console.log(JSON.stringify(payload))
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    write('debug', message, context)
  },
  info(message: string, context?: Record<string, unknown>) {
    write('info', message, context)
  },
  warn(message: string, context?: Record<string, unknown>) {
    write('warn', message, context)
  },
  error(message: string, context?: Record<string, unknown>) {
    write('error', message, context)
  }
}
