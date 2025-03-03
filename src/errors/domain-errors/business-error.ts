import { ApiError } from "../api-error"

export class BusinessError extends ApiError {
  static businessNumberInvalid(businessNumber: string) {
    return ApiError.validationError({
      message: `유효하지 않은 사업자 등록번호입니다: ${businessNumber}`,
      details: { businessNumber },
    })
  }

  static businessNumberExists(businessNumber: string) {
    return ApiError.conflict({
      message: `이미 등록된 사업자 등록번호입니다: ${businessNumber}`,
      details: { businessNumber },
    })
  }

  static invalidBusinessStatus(businessNumber: string, status: string) {
    return ApiError.businessRuleViolation({
      message: `사업자 등록번호 ${businessNumber}의 상태가 유효하지 않습니다: ${status}`,
      details: {
        businessNumber,
        status,
      },
    })
  }
}
