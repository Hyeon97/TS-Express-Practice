import "reflect-metadata"
import { Request, Response, NextFunction } from "express"
import { validationResult, ValidationChain } from "express-validator"
import Joi from "joi"
import { plainToInstance } from "class-transformer"
import { validate as classValidate } from "class-validator"
import { ApiError } from "../../errors/api-error"
import { logger } from "../../utils/logger"

/**
 * Express-validator 결과 처리 미들웨어
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg)
    logger.warn(`[express-validator] 요청 유효성 검사 실패: ${errorMessages.join(", ")}`)
    throw ApiError.validationError({ message: "요청 데이터 유효성 검사 실패", details: errorMessages })
  }

  next()
}

/**
 * Express-validator 미들웨어 체인 생성 함수
 */
export const validate = (validations: ValidationChain[]) => {
  return [...validations, handleValidationErrors]
}

/**
 * Joi 스키마 기반 미들웨어 생성 함수
 */
export const validateWithJoi = (schema: Joi.ObjectSchema, options: { source?: "body" | "query" | "params" } = {}) => {
  const { source = "body" } = options

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source]

      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message)
        logger.warn(`[Joi] 요청 유효성 검사 실패: ${errorMessages.join(", ")}`)
        throw ApiError.validationError({ message: "요청 데이터 유효성 검사 실패", details: errorMessages })
      }

      // 유효성 검사를 통과한 데이터로 요청 객체 업데이트
      req[source] = value
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * DTO 클래스 기반 유효성 검사 미들웨어
 * class-validator와 class-transformer 라이브러리 사용
 */
export const validateDTO = <T extends object>(
  dtoClass: new () => T,
  options: { source?: "body" | "query" | "params"; whitelist?: boolean } = {}
) => {
  const { source = "body", whitelist = true } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source]

      // 요청 데이터를 DTO 클래스의 인스턴스로 변환
      const dtoInstance = plainToInstance(dtoClass, data)

      // class-validator를 사용한 유효성 검사
      const errors = await classValidate(dtoInstance, {
        whitelist,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
      })

      if (errors.length > 0) {
        // 검증 오류 메시지 추출
        const errorMessages = errors.map((error) => {
          const constraints = error.constraints || {}
          return Object.values(constraints).join(", ")
        })

        logger.warn(`[class-validator] 요청 유효성 검사 실패: ${errorMessages.join(", ")}`)
        throw ApiError.validationError({ message: "요청 데이터 유효성 검사 실패", details: errorMessages })
      }

      // 유효성 검사를 통과한 DTO 인스턴스로 요청 객체 업데이트
      req[source] = dtoInstance
      next()
    } catch (error) {
      if (error instanceof ApiError) {
        next(error)
      } else {
        logger.error("DTO 유효성 검사 중 오류 발생", error)
        next(ApiError.internal({ message: "서버 내부 오류가 발생했습니다" }))
      }
    }
  }
}

/**
 * 커스텀 검증 미들웨어 생성 함수
 */
export const validateCustom = (validationFn: (req: Request) => string[] | Promise<string[]>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = await validationFn(req)

      if (errors.length > 0) {
        logger.warn(`[Custom] 요청 유효성 검사 실패: ${errors.join(", ")}`)
        throw ApiError.validationError({ message: "요청 데이터 유효성 검사 실패", details: errors })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
