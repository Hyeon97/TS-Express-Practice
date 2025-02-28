import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

// 사용자 정의 에러 클래스
export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// 에러 처리 미들웨어
export const errorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500
  const message = err.message || "서버 내부 오류가 발생했습니다"

  // 오류 심각도에 따른 로깅 레벨 조정
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message} - ${err.stack}`)
  } else if (statusCode >= 400) {
    logger.warn(`[${statusCode}] ${message} - ${req.method} ${req.originalUrl}`)
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}

// 404 Not Found 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
  logger.warn(`[404] ${message} - ${req.method}`)

  const error = new ApiError(404, message)
  next(error)
}
