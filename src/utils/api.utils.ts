import { Response } from "express"
import { ApiResponseDTO, PaginatedApiResponseDTO } from "../dtos/base.dto"

interface SuccessResponseOptions<T> {
  res: Response
  data: T
  statusCode?: number
  message?: string
}

interface ErrorResponseOptions {
  res: Response
  error: string | string[]
  statusCode: number
}

/**
 * API 응답 유틸리티
 */
export class ApiUtils {
  /**
   * 성공 응답 생성
   */
  static success<T>({ res, data, statusCode = 200, message }: SuccessResponseOptions<T>): Response {
    const response: ApiResponseDTO<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }

    return res.status(statusCode).json(response)
  }

  /**
   * 페이징된 성공 응답 생성
   */
  static paginatedSuccess<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    statusCode = 200,
    message?: string
  ): Response {
    const pages = Math.ceil(total / limit)

    const response: PaginatedApiResponseDTO<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    }

    return res.status(statusCode).json(response)
  }

  /**
   * 오류 응답 생성
   */
  // static error(res: Response, error: string | string[], statusCode = 400): Response {
  static error({ res, error, statusCode }: ErrorResponseOptions): Response {
    const errorMessage = Array.isArray(error) ? error.join(", ") : error

    const response: ApiResponseDTO<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }

    return res.status(statusCode).json(response)
  }
}
