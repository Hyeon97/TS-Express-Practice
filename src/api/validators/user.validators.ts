import { body, param, query } from "express-validator"
import { createUserSchema, updateUserSchema, loginSchema, validateBusinessNumberSchema } from "../../joi-schemas/user.schema"
import { CreateUserDto, UpdateUserDto, LoginUserDto, CreateAdvancedUserDto } from "../../dtos/user/user.dto"
import { CreateBusinessDto, ValidateBusinessNumberDto } from "../../dtos/user/business.dto"
import { userService } from "../services/user/user.service"
import { validate, validateCustom, validateDTO, validateWithJoi } from "../middleware/validationMiddleware"

// ------------------ Express-validator 체인 ------------------

/**
 * ID 파라미터 검증
 */
export const validateIdParam = validate([param("id").isInt({ min: 1 }).withMessage("유효한 ID 형식이 아닙니다").toInt()])

/**
 * Eamil query 검증
 */
export const validateEmailQuery = validate([query("email").exists().withMessage("이메일은 필수 값입니다.").isEmail().withMessage("유효한 이메일 형식이 아닙니다.").trim().normalizeEmail()])

/**
 * 간단한 로그인 검증 (express-validator 사용)
 * - 간단한 폼 데이터 검증에 적합
 */
export const validateLogin = validate([body("email").notEmpty().withMessage("이메일은 필수 항목입니다").isEmail().withMessage("유효한 이메일 주소를 입력하세요").normalizeEmail(), body("password").notEmpty().withMessage("비밀번호는 필수 항목입니다")])

// ------------------ Joi 스키마 기반 검증 ------------------

/**
 * 간단한 사용자 생성 검증 (Joi 스키마 사용)
 * - 단일 계층 객체 구조에 적합
 */
export const validateCreateUser = validateWithJoi(createUserSchema)

/**
 * 사용자 업데이트 검증 (Joi 스키마 사용)
 */
export const validateUpdateUser = validateWithJoi(updateUserSchema)

/**
 * 사업자 번호 형식 검증 (Joi 스키마 사용)
 * - 단일 필드 형식 검증에 적합
 */
export const validateBusinessNumberFormat = validateWithJoi(validateBusinessNumberSchema)

// ------------------ Class-Validator/DTO 기반 검증 ------------------

/**
 * 로그인 검증 (DTO 클래스 사용)
 * - 타입스크립트 타입 안전성이 중요할 때 적합
 */
export const validateLoginDTO = validateDTO(LoginUserDto)

/**
 * 사용자 생성 검증 (DTO 클래스 사용)
 * - 타입스크립트 타입 안전성이 중요할 때 적합
 */
export const validateCreateUserDTO = validateDTO(CreateUserDto)

/**
 * 사용자 업데이트 검증 (DTO 클래스 사용)
 */
export const validateUpdateUserDTO = validateDTO(UpdateUserDto)

/**
 * 고급 사용자 생성 검증 (DTO 클래스 사용)
 * - 중첩 객체 구조에 적합
 */
export const validateAdvancedUserRegistration = [
  // DTO 기반 유효성 검사
  validateDTO(CreateAdvancedUserDto),

  // 부가 검증: 비밀번호 일치 여부 확인
  validateCustom((req) => {
    const errors = []
    const { password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      errors.push("비밀번호와 비밀번호 확인이 일치하지 않습니다")
    }

    return errors
  }),

  // 부가 검증: 이메일 중복 확인 (비동기)
  validateCustom(async (req) => {
    const errors = []
    const { email } = req.body

    // 이메일 중복 확인
    const existingUser = await userService.getUserByEmail({ email })
    if (existingUser) {
      errors.push("이미 사용 중인 이메일입니다")
    }

    return errors
  }),
]

/**
 * 기업 사용자 등록 검증 (하이브리드 접근법)
 * - 복잡한 중첩 구조와 비동기 검증이 필요한 경우에 적합
 */
export const validateBusinessRegistration = [
  // DTO 기반 유효성 검사
  validateDTO(CreateBusinessDto),

  // 사업자 등록번호 유효성 검증 (비동기)
  validateCustom(async (req) => {
    const errors = []
    const { businessNumber } = req.body

    try {
      // 실제 API 호출 또는 서비스 로직을 통한 검증
      const isValid = await validateBusinessNumber(businessNumber)

      if (!isValid) {
        errors.push("유효하지 않은 사업자 등록번호입니다")
      }

      // 이미 등록된 사업자 번호인지 확인
      const isDuplicate = await checkBusinessNumberExists(businessNumber)
      if (isDuplicate) {
        errors.push("이미 등록된 사업자 등록번호입니다")
      }
    } catch (error) {
      errors.push("사업자 등록번호 검증 중 오류가 발생했습니다")
    }

    return errors
  }),

  // 이메일 중복 확인 (비동기)
  validateCustom(async (req) => {
    const errors = []
    const { email } = req.body

    // 이메일 중복 확인
    const existingUser = await userService.getUserByEmail({ email })
    if (existingUser) {
      errors.push("이미 사용 중인 이메일입니다")
    }

    return errors
  }),
]

// ------------------ 유틸리티 함수 ------------------

/**
 * 사업자 등록번호 유효성 검증 헬퍼 함수 (모의 구현)
 */
async function validateBusinessNumber(businessNumber: string): Promise<boolean> {
  // 체크섬 검증 로직 (실제로는 외부 API 호출)
  const digits = businessNumber.replace(/-/g, "").split("").map(Number)
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i]
  }

  sum += Math.floor((digits[8] * 5) / 10)
  const checksum = (10 - (sum % 10)) % 10

  return checksum === digits[9]
}

/**
 * 사업자 등록번호 중복 확인 헬퍼 함수 (모의 구현)
 */
async function checkBusinessNumberExists(businessNumber: string): Promise<boolean> {
  // 실제로는 데이터베이스 조회 필요
  const forbiddenNumbers = ["123-45-67890", "111-11-11111"]
  return forbiddenNumbers.includes(businessNumber)
}
