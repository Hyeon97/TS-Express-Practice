import { ErrorCode } from "./error-codes"

export interface ErrorIOptions {
  message: string
  details?: any
}

export interface ApiErrorOptions {
  statusCode: number
  message: string
  errorCode: ErrorCode
  details?: any
}

export interface ErrorResponse {
  success: boolean
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
  timestamp: string
}

export interface RequestInfo {
  method: string
  url: string
  ip: string
  userId: string
}
