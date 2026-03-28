export function buildQueryParams(params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return ''

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}
