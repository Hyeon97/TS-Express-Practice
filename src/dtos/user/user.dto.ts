import "reflect-metadata"
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"

// 기본 약관 동의 DTO
export class AgreementsDto {
  @IsNotEmpty({ message: "서비스 이용약관 동의는 필수 항목입니다" })
  @IsBoolean({ message: "서비스 이용약관 동의 필드는 불리언 값이어야 합니다" })
  terms: boolean = false

  @IsNotEmpty({ message: "개인정보 처리방침 동의는 필수 항목입니다" })
  @IsBoolean({ message: "개인정보 처리방침 동의 필드는 불리언 값이어야 합니다" })
  privacy: boolean = false

  @IsOptional()
  @IsBoolean({ message: "마케팅 정보 수신 동의 필드는 불리언 값이어야 합니다" })
  marketing?: boolean = false
}

// 사용자 프로필 DTO
export class UserProfileDto {
  @IsNotEmpty({ message: "전화번호는 필수 항목입니다" })
  @Matches(/^\d{2,3}-\d{3,4}-\d{4}$/, { message: "전화번호 형식이 올바르지 않습니다" })
  phone: string = ""

  @IsOptional()
  @IsString({ message: "주소는 문자열이어야 합니다" })
  @MaxLength(200, { message: "주소는 최대 200자까지 입력 가능합니다" })
  address?: string
}

// 로그인 DTO
export class LoginUserDto {
  @IsNotEmpty({ message: "이메일은 필수 항목입니다" })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력하세요" })
  email: string = ""

  @IsNotEmpty({ message: "비밀번호는 필수 항목입니다" })
  password: string = ""
}

// 사용자 생성 DTO
export class CreateUserDto {
  @IsNotEmpty({ message: "이름은 필수 항목입니다" })
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @MinLength(2, { message: "이름은 최소 2자 이상이어야 합니다" })
  @MaxLength(100, { message: "이름은 최대 100자 이하여야 합니다" })
  name: string = ""

  @IsNotEmpty({ message: "이메일은 필수 항목입니다" })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력하세요" })
  email: string = ""

  @IsNotEmpty({ message: "비밀번호는 필수 항목입니다" })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/[A-Z]/, { message: "비밀번호에는 최소 하나의 대문자가 포함되어야 합니다" })
  @Matches(/[a-z]/, { message: "비밀번호에는 최소 하나의 소문자가 포함되어야 합니다" })
  @Matches(/[0-9]/, { message: "비밀번호에는 최소 하나의 숫자가 포함되어야 합니다" })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: "비밀번호에는 최소 하나의 특수문자가 포함되어야 합니다" })
  password: string = ""
}

// 사용자 업데이트 DTO
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @MinLength(2, { message: "이름은 최소 2자 이상이어야 합니다" })
  @MaxLength(100, { message: "이름은 최대 100자 이하여야 합니다" })
  name?: string

  @IsOptional()
  @IsEmail({}, { message: "유효한 이메일 주소를 입력하세요" })
  email?: string

  @IsOptional()
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/[A-Z]/, { message: "비밀번호에는 최소 하나의 대문자가 포함되어야 합니다" })
  @Matches(/[a-z]/, { message: "비밀번호에는 최소 하나의 소문자가 포함되어야 합니다" })
  @Matches(/[0-9]/, { message: "비밀번호에는 최소 하나의 숫자가 포함되어야 합니다" })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: "비밀번호에는 최소 하나의 특수문자가 포함되어야 합니다" })
  password?: string

  toServiceDTO() {
    const dto: any = {}

    if (this.name !== undefined) dto.name = this.name
    if (this.email !== undefined) dto.email = this.email
    if (this.password !== undefined) dto.password = this.password

    return dto
  }
}

// 고급 사용자 생성 DTO
export class CreateAdvancedUserDto {
  @IsNotEmpty({ message: "이름은 필수 항목입니다" })
  @IsString({ message: "이름은 문자열이어야 합니다" })
  @MinLength(2, { message: "이름은 최소 2자 이상이어야 합니다" })
  @MaxLength(100, { message: "이름은 최대 100자 이하여야 합니다" })
  name: string = ""

  @IsNotEmpty({ message: "이메일은 필수 항목입니다" })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력하세요" })
  email: string = ""

  @IsNotEmpty({ message: "비밀번호는 필수 항목입니다" })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  @Matches(/[A-Z]/, { message: "비밀번호에는 최소 하나의 대문자가 포함되어야 합니다" })
  @Matches(/[a-z]/, { message: "비밀번호에는 최소 하나의 소문자가 포함되어야 합니다" })
  @Matches(/[0-9]/, { message: "비밀번호에는 최소 하나의 숫자가 포함되어야 합니다" })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: "비밀번호에는 최소 하나의 특수문자가 포함되어야 합니다" })
  password: string = ""

  @IsNotEmpty({ message: "비밀번호 확인은 필수 항목입니다" })
  @IsString({ message: "비밀번호 확인은 문자열이어야 합니다" })
  confirmPassword: string = ""

  @ValidateNested()
  @Type(() => UserProfileDto)
  @IsNotEmpty({ message: "프로필 정보는 필수 항목입니다" })
  profile: UserProfileDto = new UserProfileDto()

  @ValidateNested()
  @Type(() => AgreementsDto)
  @IsNotEmpty({ message: "약관 동의 정보는 필수 항목입니다" })
  agreements: AgreementsDto = new AgreementsDto()

  toServiceDTO() {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
      profile: {
        phone: this.profile.phone,
        address: this.profile.address,
      },
      marketingConsent: this.agreements.marketing,
    }
  }
}

// 사용자 응답 DTO
export class UserResponseDto {
  id: number = 0
  name: string = ""
  email: string = ""
  createdAt: string = ""
  updatedAt: string = ""

  constructor(data: Partial<UserResponseDto> = {}) {
    this.id = data.id || 0
    this.name = data.name || ""
    this.email = data.email || ""
    this.createdAt = data.createdAt || ""
    this.updatedAt = data.updatedAt || ""
  }

  /**
   * 엔티티에서 DTO로 변환하는 정적 메서드
   */
  static fromEntity(user: any): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    })
  }

  /**
   * 엔티티 배열에서 DTO 배열로 변환
   */
  static fromEntities(users: any[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.fromEntity(user))
  }
}
