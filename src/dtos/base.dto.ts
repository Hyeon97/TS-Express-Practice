/**
 * 모든 DTO의 기본 인터페이스
 */
export interface BaseDTO {
  /**
   * DTO 유효성 검사
   * @returns 유효성 검사 오류 메시지 배열 (유효한 경우 빈 배열)
   */
  validate?(): string[]
}

/**
 * API 응답에 대한 기본 DTO 인터페이스
 */
export interface ApiResponseDTO<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

/**
 * 페이징된 API 응답을 위한 DTO 인터페이스
 */
export interface PaginatedApiResponseDTO<T> extends ApiResponseDTO<T[]> {
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}
