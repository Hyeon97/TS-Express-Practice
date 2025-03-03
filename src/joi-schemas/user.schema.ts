import Joi from "joi"

/**
 * 사용자 생성을 위한 Joi 스키마
 * (필드가 적은 간단한 스키마의 경우 Joi 활용)
 */
export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "이름은 필수 항목입니다",
    "string.min": "이름은 최소 {#limit}자 이상이어야 합니다",
    "string.max": "이름은 최대 {#limit}자 이하여야 합니다",
    "any.required": "이름은 필수 항목입니다",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "이메일은 필수 항목입니다",
    "string.email": "유효한 이메일 주소를 입력하세요",
    "any.required": "이메일은 필수 항목입니다",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .required()
    .messages({
      "string.empty": "비밀번호는 필수 항목입니다",
      "string.min": "비밀번호는 최소 {#limit}자 이상이어야 합니다",
      "string.pattern.base": "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
      "any.required": "비밀번호는 필수 항목입니다",
    }),
})

/**
 * 사용자 업데이트를 위한 Joi 스키마
 */
export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    "string.min": "이름은 최소 {#limit}자 이상이어야 합니다",
    "string.max": "이름은 최대 {#limit}자 이하여야 합니다",
  }),

  email: Joi.string().email().messages({
    "string.email": "유효한 이메일 주소를 입력하세요",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .messages({
      "string.min": "비밀번호는 최소 {#limit}자 이상이어야 합니다",
      "string.pattern.base": "비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다",
    }),
})
  .min(1)
  .messages({
    "object.min": "업데이트할 필드를 하나 이상 제공해야 합니다",
  })

/**
 * 로그인을 위한 Joi 스키마
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "이메일은 필수 항목입니다",
    "string.email": "유효한 이메일 주소를 입력하세요",
    "any.required": "이메일은 필수 항목입니다",
  }),

  password: Joi.string().required().messages({
    "string.empty": "비밀번호는 필수 항목입니다",
    "any.required": "비밀번호는 필수 항목입니다",
  }),
})

/**
 * 사업자 등록번호 검증을 위한 Joi 스키마
 */
export const validateBusinessNumberSchema = Joi.object({
  businessNumber: Joi.string()
    .pattern(/^\d{3}-\d{2}-\d{5}$/)
    .required()
    .messages({
      "string.pattern.base": "사업자 등록번호는 xxx-xx-xxxxx 형식이어야 합니다",
      "string.empty": "사업자 등록번호는 필수 항목입니다",
      "any.required": "사업자 등록번호는 필수 항목입니다",
    }),
})
