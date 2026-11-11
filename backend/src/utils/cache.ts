const TTL_MS = 10 * 60 * 1000

const store = new Map<string, { expires: number; value: Promise<unknown> }>()

export const cached = <T>(key: string, load: () => Promise<T>): Promise<T> => {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>

  const value = load()
  store.set(key, { expires: Date.now() + TTL_MS, value })
  value.catch(() => store.delete(key))
  return value
}

export const clearCache = (prefix: string) => {
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key)
}
