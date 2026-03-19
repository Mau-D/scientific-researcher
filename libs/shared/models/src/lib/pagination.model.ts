export interface PaginationState {
  cursor: string | null
  nextCursor: string | null
  perPage: number
  total?: number
}
