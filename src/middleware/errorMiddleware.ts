import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

// 세부 에러 코드 정의
export enum ErrorCode {
  // 클라이언트 에러 (400-499)
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CONFLICT = "CONFLICT",

  // 서버 에러 (500-599)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",

  // 비즈니스 로직 에러 (커스텀)
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  DOMAIN_VALIDATION_ERROR = "DOMAIN_VALIDATION_ERROR",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",
  RESOURCE_EXPIRED = "RESOURCE_EXPIRED",
}

// 사용자 정의 에러 클래스
export class ApiError extends Error {
  statusCode: number
  errorCode: ErrorCode
  details?: any

  constructor(statusCode: number, message: string, errorCode: ErrorCode, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  // 일반적인 에러 팩토리 메서드
  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(400, message, ErrorCode.BAD_REQUEST, details)
  }

  static unauthorized(message: string, details?: any): ApiError {
    return new ApiError(401, message, ErrorCode.UNAUTHORIZED, details)
  }

  static forbidden(message: string, details?: any): ApiError {
    return new ApiError(403, message, ErrorCode.FORBIDDEN, details)
  }

  static notFound(message: string, details?: any): ApiError {
    return new ApiError(404, message, ErrorCode.NOT_FOUND, details)
  }

  static conflict(message: string, details?: any): ApiError {
    return new ApiError(409, message, ErrorCode.CONFLICT, details)
  }

  static internal(message: string, details?: any): ApiError {
    return new ApiError(500, message, ErrorCode.INTERNAL_ERROR, details)
  }

  // 비즈니스 도메인 에러 팩토리 메서드
  static validationError(message: string, details?: any): ApiError {
    return new ApiError(400, message, ErrorCode.VALIDATION_ERROR, details)
  }

  static businessRuleViolation(message: string, details?: any): ApiError {
    return new ApiError(422, message, ErrorCode.BUSINESS_RULE_VIOLATION, details)
  }

  static resourceExists(message: string, details?: any): ApiError {
    return new ApiError(409, message, ErrorCode.RESOURCE_EXISTS, details)
  }

  static databaseError(message: string, details?: any): ApiError {
    return new ApiError(500, message, ErrorCode.DATABASE_ERROR, details)
  }
}

// 에러 응답 형식
interface ErrorResponse {
  success: boolean
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

// 에러 처리 미들웨어
export const errorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let errorCode = ErrorCode.INTERNAL_ERROR
  let message = "서버 내부 오류가 발생했습니다"
  let details = undefined

  // ApiError 인스턴스인 경우 정보 추출
  if (err instanceof ApiError) {
    statusCode = err.statusCode
    errorCode = err.errorCode
    message = err.message
    details = err.details
  } else {
    // 일반 Error 객체인 경우
    message = err.message || message
  }

  // 요청 정보 준비
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: (req as any).user?.id || "anonymous",
  }

  // 오류 심각도에 따른 로깅 레벨 조정
  if (statusCode >= 500) {
    logger.error(`[${errorCode}] ${message}`, {
      error: err.stack,
      request: requestInfo,
      details,
    })
  } else if (statusCode >= 400) {
    logger.warn(`[${errorCode}] ${message}`, {
      request: requestInfo,
      details,
    })
  }

  // 응답 생성
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details: process.env.NODE_ENV === "production" ? undefined : details,
    },
    timestamp: new Date().toISOString(),
  }

  // 개발 환경에서만 스택 트레이스 추가
  if (process.env.NODE_ENV !== "production") {
    errorResponse.error["stack"] = err.stack
  }

  res.status(statusCode).json(errorResponse)
}

// 404 Not Found 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
  logger.warn(`[404] ${message} - ${req.method}`)

  const error = ApiError.notFound(message, { url: req.originalUrl })
  next(error)
}

// 사용자 도메인 관련 에러
export class UserError extends ApiError {
  static emailAlreadyExists(email: string): ApiError {
    return ApiError.conflict(`이미 사용 중인 이메일입니다: ${email}`, { email })
  }

  static invalidCredentials(): ApiError {
    return ApiError.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다", {
      hint: "이메일과 비밀번호를 다시 확인해 주세요",
    })
  }

  static passwordComplexityFailed(rules: string[]): ApiError {
    return ApiError.validationError("비밀번호가 복잡성 요구사항을 충족하지 않습니다", { rules })
  }
}
