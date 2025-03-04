import { ApiError } from "../api-error"

export class UserError extends ApiError {
  static emailAlreadyExists(email: string) {
    return ApiError.conflict({
      message: `이미 사용 중인 이메일입니다: ${email}`,
      details: { email },
    })
  }

  static invalidCredentials() {
    return ApiError.unauthorized({
      message: "이메일 또는 비밀번호가 올바르지 않습니다",
      details: {
        hint: "이메일과 비밀번호를 다시 확인해 주세요",
      },
    })
  }

  static passwordComplexityFailed(rules: string[]) {
    return ApiError.validationError({
      message: "비밀번호가 복잡성 요구사항을 충족하지 않습니다",
      details: { rules },
    })
  }

  static businessNumberInvalid(businessNumber: string) {
    return ApiError.validationError({
      message: `유효하지 않은 사업자 등록번호입니다: ${businessNumber}`,
      details: { businessNumber },
    })
  }

  static accountLocked(message: string, lockUntil: Date) {
    return ApiError.forbidden({
      message,
      details: {
        lockUntil: lockUntil.toISOString(),
        remainingTime: Math.ceil((lockUntil.getTime() - Date.now()) / 1000 / 60) + "분",
      },
    })
  }
}
