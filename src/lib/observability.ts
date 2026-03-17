type LogLevel = 'info' | 'warn' | 'error'

export function logEvent(level: LogLevel, event: string, context?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    context: context || {},
  }

  if (level === 'error') {
    console.error(JSON.stringify(payload))
    return
  }
  if (level === 'warn') {
    console.warn(JSON.stringify(payload))
    return
  }
  console.log(JSON.stringify(payload))
}

