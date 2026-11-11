export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const getPaginationParams = (
  pageParam: unknown,
  limitParam: unknown,
): PaginationParams => {
  const page = Math.max(
    Number(pageParam) || 1,
    1,
  )

  const limit = Math.min(
    Math.max(Number(limitParam) || 10, 1),
    100,
  )

  const offset = (page - 1) * limit

  return {
    page,
    limit,
    offset,
  }
}

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
})