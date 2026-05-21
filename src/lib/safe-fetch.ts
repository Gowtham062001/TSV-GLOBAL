export async function safeFetch<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  label = 'query'
): Promise<T> {
  try {
    return await fetcher()
  } catch (error) {
    console.error(`[DB Error] ${label}:`, error)
    return fallback
  }
}
