import { ErrorCode } from "./error-codes"
import { ApiErrorOptions, ErrorIOptions } from "./interfaces"

export class ApiError extends Error {
  statusCode: number
  errorCode: ErrorCode
  details?: any

  constructor({ statusCode, message, errorCode, details }: ApiErrorOptions) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  // 일반적인 에러 팩토리 메서드
  static badRequest(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 400,
      message: options.message,
      errorCode: ErrorCode.BAD_REQUEST,
      details: options.details,
    })
  }

  static unauthorized(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 401,
      message: options.message,
      errorCode: ErrorCode.UNAUTHORIZED,
      details: options.details,
    })
  }

  static forbidden(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 403,
      message: options.message,
      errorCode: ErrorCode.FORBIDDEN,
      details: options.details,
    })
  }

  static notFound(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 404,
      message: options.message,
      errorCode: ErrorCode.NOT_FOUND,
      details: options.details,
    })
  }

  static conflict(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 409,
      message: options.message,
      errorCode: ErrorCode.CONFLICT,
      details: options.details,
    })
  }

  static internal(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 500,
      message: options.message,
      errorCode: ErrorCode.INTERNAL_ERROR,
      details: options.details,
    })
  }

  // 서비스 이용 불가 오류
  static serviceUnavailable(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 503,
      message: options.message,
      errorCode: ErrorCode.SERVICE_UNAVAILABLE,
      details: options.details,
    })
  }

  // 비즈니스 도메인 에러 팩토리 메서드
  static validationError(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 400,
      message: options.message,
      errorCode: ErrorCode.VALIDATION_ERROR,
      details: options.details,
    })
  }

  static businessRuleViolation(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 422,
      message: options.message,
      errorCode: ErrorCode.BUSINESS_RULE_VIOLATION,
      details: options.details,
    })
  }

  static resourceExists(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 409,
      message: options.message,
      errorCode: ErrorCode.RESOURCE_EXISTS,
      details: options.details,
    })
  }

  static databaseError(options: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 500,
      message: options.message,
      errorCode: ErrorCode.DATABASE_ERROR,
      details: options.details,
    })
  }
}
