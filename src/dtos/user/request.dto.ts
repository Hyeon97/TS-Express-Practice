import { BaseDTO } from "../base.dto"
import { CreateUserDTO, UpdateUserDTO } from "../../types/user"

/**
 * 사용자 생성 요청 DTO
 */
export class CreateUserRequestDTO implements BaseDTO {
  name: string
  email: string
  password: string

  constructor(data: Partial<CreateUserRequestDTO> = {}) {
    this.name = data.name || ""
    this.email = data.email || ""
    this.password = data.password || ""
  }

  /**
   * 유효성 검사
   */
  validate(): string[] {
    const errors: string[] = []

    // 이름 검증
    if (!this.name) {
      errors.push("이름은 필수 항목입니다")
    } else if (this.name.length < 2 || this.name.length > 100) {
      errors.push("이름은 2자 이상 100자 이하여야 합니다")
    }

    // 이메일 검증
    if (!this.email) {
      errors.push("이메일은 필수 항목입니다")
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        errors.push("유효한 이메일 주소를 입력하세요")
      }
    }

    // 비밀번호 검증
    if (!this.password) {
      errors.push("비밀번호는 필수 항목입니다")
    } else if (this.password.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다")
    }

    return errors
  }

  /**
   * 서비스 계층 DTO로 변환
   */
  toServiceDTO(): CreateUserDTO {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
    }
  }
}

/**
 * 사용자 업데이트 요청 DTO
 */
export class UpdateUserRequestDTO implements BaseDTO {
  name?: string
  email?: string
  password?: string

  constructor(data: Partial<UpdateUserRequestDTO> = {}) {
    this.name = data.name
    this.email = data.email
    this.password = data.password
  }

  /**
   * 유효성 검사
   */
  validate(): string[] {
    const errors: string[] = []

    // 최소 하나의 필드는 필요
    if (!this.name && !this.email && !this.password) {
      errors.push("업데이트할 필드를 하나 이상 제공해야 합니다")
      return errors
    }

    // 이름 검증 (제공된 경우)
    if (this.name !== undefined) {
      if (this.name.length < 2 || this.name.length > 100) {
        errors.push("이름은 2자 이상 100자 이하여야 합니다")
      }
    }

    // 이메일 검증 (제공된 경우)
    if (this.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        errors.push("유효한 이메일 주소를 입력하세요")
      }
    }

    // 비밀번호 검증 (제공된 경우)
    if (this.password !== undefined && this.password.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다")
    }

    return errors
  }

  /**
   * 서비스 계층 DTO로 변환
   */
  toServiceDTO(): UpdateUserDTO {
    const dto: UpdateUserDTO = {}

    if (this.name !== undefined) dto.name = this.name
    if (this.email !== undefined) dto.email = this.email
    if (this.password !== undefined) dto.password = this.password

    return dto
  }
}

/**
 * 사용자 인증 요청 DTO
 */
export class UserLoginRequestDTO implements BaseDTO {
  email: string
  password: string

  constructor(data: Partial<UserLoginRequestDTO> = {}) {
    this.email = data.email || ""
    this.password = data.password || ""
  }

  /**
   * 유효성 검사
   */
  validate(): string[] {
    const errors: string[] = []

    if (!this.email) {
      errors.push("이메일은 필수 항목입니다")
    }

    if (!this.password) {
      errors.push("비밀번호는 필수 항목입니다")
    }

    return errors
  }
}
