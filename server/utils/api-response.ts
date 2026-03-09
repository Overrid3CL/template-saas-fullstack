export function ok<T>(data: T) {
  return {
    ok: true as const,
    data
  }
}

export function errorData(error: string, message?: string) {
  return {
    ok: false as const,
    error,
    message
  }
}
