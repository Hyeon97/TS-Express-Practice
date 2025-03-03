import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { AgreementsDto } from "./user.dto"

/**
 * 산업 유형 열거형
 */
export enum IndustryType {
  TECH = "tech",
  FINANCE = "finance",
  HEALTHCARE = "healthcare",
  EDUCATION = "education",
  MANUFACTURING = "manufacturing",
  RETAIL = "retail",
  OTHER = "other",
}

/**
 * 주소 DTO (중첩용)
 */
export class AddressDto {
  @IsNotEmpty({ message: "주소는 필수 항목입니다" })
  @IsString({ message: "주소는 문자열이어야 합니다" })
  street: string = ""

  @IsNotEmpty({ message: "도시는 필수 항목입니다" })
  @IsString({ message: "도시는 문자열이어야 합니다" })
  city: string = ""

  @IsNotEmpty({ message: "시/도는 필수 항목입니다" })
  @IsString({ message: "시/도는 문자열이어야 합니다" })
  state: string = ""

  @IsNotEmpty({ message: "우편번호는 필수 항목입니다" })
  @Matches(/^\d{5}$/, { message: "우편번호는 5자리 숫자여야 합니다" })
  zipCode: string = ""
}

/**
 * 회사 상세 정보 DTO (중첩용)
 */
export class CompanyDetailsDto {
  @IsNotEmpty({ message: "산업 유형은 필수 항목입니다" })
  @IsEnum(IndustryType, { message: "유효한 산업 유형이 아닙니다" })
  industryType: IndustryType = IndustryType.OTHER

  @IsNotEmpty({ message: "직원 수는 필수 항목입니다" })
  @IsNumber({}, { message: "직원 수는 숫자여야 합니다" })
  @Min(1, { message: "직원 수는 1명 이상이어야 합니다" })
  employeeCount: number = 1

  @IsNotEmpty({ message: "설립연도는 필수 항목입니다" })
  @IsNumber({}, { message: "설립연도는 숫자여야 합니다" })
  @Min(1800, { message: "설립연도는 1800년 이후여야 합니다" })
  @Max(new Date().getFullYear(), { message: `설립연도는 ${new Date().getFullYear()}년 이전이어야 합니다` })
  foundingYear: number = 2000

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty({ message: "회사 주소는 필수 항목입니다" })
  address: AddressDto = new AddressDto()
}

/**
 * 비즈니스 계정 등록 DTO
 */
export class CreateBusinessDto {
  @IsNotEmpty({ message: "회사명은 필수 항목입니다" })
  @IsString({ message: "회사명은 문자열이어야 합니다" })
  @MinLength(2, { message: "회사명은 최소 2자 이상이어야 합니다" })
  @MaxLength(100, { message: "회사명은 최대 100자 이하여야 합니다" })
  companyName: string = ""

  @IsNotEmpty({ message: "사업자 등록번호는 필수 항목입니다" })
  @Matches(/^\d{3}-\d{2}-\d{5}$/, { message: "사업자 등록번호는 xxx-xx-xxxxx 형식이어야 합니다" })
  businessNumber: string = ""

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

  @ValidateNested()
  @Type(() => CompanyDetailsDto)
  @IsNotEmpty({ message: "회사 상세 정보는 필수 항목입니다" })
  companyDetails: CompanyDetailsDto = new CompanyDetailsDto()

  @ValidateNested()
  @Type(() => BusinessAgreementsDto)
  @IsNotEmpty({ message: "약관 동의 정보는 필수 항목입니다" })
  agreements: BusinessAgreementsDto = new BusinessAgreementsDto()

  /**
   * 서비스 계층 DTO로 변환
   */
  toServiceDTO() {
    return {
      companyName: this.companyName,
      businessNumber: this.businessNumber,
      email: this.email,
      password: this.password,
      industryType: this.companyDetails.industryType,
      employeeCount: this.companyDetails.employeeCount,
      foundingYear: this.companyDetails.foundingYear,
      address: this.companyDetails.address,
      marketingConsent: this.agreements.marketing || false,
      dataProcessingConsent: this.agreements.dataProcessing,
    }
  }
}

/**
 * 비즈니스 약관 동의 DTO (중첩용)
 */
export class BusinessAgreementsDto extends AgreementsDto {
  @IsNotEmpty({ message: "정보 이용 동의는 필수 항목입니다" })
  @IsBoolean({ message: "정보 이용 동의 필드는 불리언 값이어야 합니다" })
  dataProcessing: boolean = false
}

/**
 * 사업자 등록번호 검증 요청 DTO
 */
export class ValidateBusinessNumberDto {
  @IsNotEmpty({ message: "사업자 등록번호는 필수 항목입니다" })
  @Matches(/^\d{3}-\d{2}-\d{5}$/, { message: "사업자 등록번호는 xxx-xx-xxxxx 형식이어야 합니다" })
  businessNumber: string = ""
}

/**
 * 비즈니스 계정 응답 DTO
 */
export class BusinessResponseDto {
  id: number = 0
  companyName: string = ""
  businessNumber: string = ""
  email: string = ""
  industryType: string = ""
  employeeCount: number = 0
  foundingYear: number = 0
  createdAt: string = ""

  constructor(data: Partial<BusinessResponseDto> = {}) {
    this.id = data.id || 0
    this.companyName = data.companyName || ""
    this.businessNumber = data.businessNumber || ""
    this.email = data.email || ""
    this.industryType = data.industryType || ""
    this.employeeCount = data.employeeCount || 0
    this.foundingYear = data.foundingYear || 0
    this.createdAt = data.createdAt || ""
  }

  /**
   * 엔티티에서 DTO로 변환하는 정적 메서드
   */
  static fromEntity(business: any): BusinessResponseDto {
    return new BusinessResponseDto({
      id: business.id,
      companyName: business.company_name,
      businessNumber: business.business_number,
      email: business.email,
      industryType: business.industry_type,
      employeeCount: business.employee_count,
      foundingYear: business.founding_year,
      createdAt: business.created_at.toISOString(),
    })
  }

  /**
   * 엔티티 배열에서 DTO 배열로 변환
   */
  static fromEntities(businesses: any[]): BusinessResponseDto[] {
    return businesses.map((business) => BusinessResponseDto.fromEntity(business))
  }
}
