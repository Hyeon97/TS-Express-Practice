import { logger } from "../utils/logger"
import { businessRepository } from "../repositories/business.repository"
import { userService } from "./user.service"
import { CryptoUtils } from "../utils/crypto.utils"
import axios from "axios"
import { IndustryType } from "../dtos/user/business.dto"
import { ApiError } from "../errors/api-error"
import { UserError } from "../errors/domain-errors/user-error"

// 사업자 등록번호 검증 결과 타입
interface BusinessNumberValidationResult {
  isValid: boolean
  companyInfo?: {
    name?: string
    address?: string
    industryType?: string
    status?: string
    registrationDate?: string
  }
}

/**
 * 기업 계정 관련 서비스 클래스
 */
export class BusinessService {
  /**
   * 사업자 등록번호 유효성 검증
   * - 형식 검증
   * - 국세청 API 연동 (모의)
   * - 중복 확인
   */
  async validateBusinessNumber(businessNumber: string): Promise<BusinessNumberValidationResult> {
    try {
      logger.debug(`사업자 등록번호 검증 시작: ${businessNumber}`)

      // 형식 검증 (이미 미들웨어에서 수행되었을 수 있지만 혹시 모르니 재검증)
      if (!/^\d{3}-\d{2}-\d{5}$/.test(businessNumber)) {
        return { isValid: false }
      }

      // 1. 체크섬 검증
      const isValidChecksum = this.validateBusinessNumberChecksum(businessNumber)
      if (!isValidChecksum) {
        logger.debug(`사업자 등록번호 체크섬 검증 실패: ${businessNumber}`)
        return { isValid: false }
      }

      // 2. 중복 확인
      const existingBusiness = await businessRepository.findByBusinessNumber(businessNumber)
      if (existingBusiness) {
        logger.debug(`이미 등록된 사업자 등록번호: ${businessNumber}`)
        return { isValid: false }
      }

      // 3. 국세청 API 연동 (실제로는 외부 API 호출, 여기서는 모의)
      const taxOfficeResult = await this.verifyWithTaxOffice(businessNumber)
      if (!taxOfficeResult.isValid) {
        logger.debug(`국세청 API 검증 실패: ${businessNumber}`)
        return { isValid: false }
      }

      logger.info(`사업자 등록번호 검증 성공: ${businessNumber}`)
      return {
        isValid: true,
        companyInfo: taxOfficeResult.companyInfo,
      }
    } catch (error) {
      logger.error(`사업자 등록번호 검증 중 오류 발생: ${error}`)
      throw ApiError.internal({ message: "사업자 등록번호 검증 중 오류가 발생했습니다" })
    }
  }

  /**
   * 기업 계정 생성
   */
  async createBusinessAccount(businessData: {
    companyName: string
    businessNumber: string
    email: string
    password: string
    industryType: IndustryType
    employeeCount: number
    foundingYear: number
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    marketingConsent?: boolean
    dataProcessingConsent: boolean
  }) {
    try {
      // 1. 사업자 등록번호 검증
      const validationResult = await this.validateBusinessNumber(businessData.businessNumber)
      if (!validationResult.isValid) {
        throw UserError.businessNumberInvalid(businessData.businessNumber)
      }

      // 2. 이메일 중복 확인
      const existingUser = await userService.getUserByEmail({ email: businessData.email })
      if (existingUser) {
        throw UserError.emailAlreadyExists(businessData.email)
      }

      // 3. 비밀번호 해시화
      const hashedPassword = CryptoUtils.hashPassword({ password: businessData.password })

      // 4. 기업 계정 생성
      const newBusiness = await businessRepository.createBusinessAccount({
        companyName: businessData.companyName,
        businessNumber: businessData.businessNumber,
        email: businessData.email,
        password: hashedPassword,
        industryType: businessData.industryType,
        employeeCount: businessData.employeeCount,
        foundingYear: businessData.foundingYear,
        address: businessData.address,
        marketingConsent: businessData.marketingConsent || false,
        dataProcessingConsent: businessData.dataProcessingConsent,
        status: "ACTIVE",
      })

      logger.info(`새 기업 계정이 생성되었습니다. ID: ${newBusiness.id}, 회사명: ${newBusiness.company_name}`)

      return newBusiness
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`기업 계정 생성 중 오류 발생: ${error}`)
      throw ApiError.internal({ message: "기업 계정 생성 중 오류가 발생했습니다" })
    }
  }

  /**
   * 모든 기업 계정 조회
   */
  async getAllBusinessAccounts() {
    try {
      return await businessRepository.findAll()
    } catch (error) {
      logger.error("기업 계정 목록 조회 중 오류 발생", error)
      throw ApiError.databaseError({ message: "기업 계정 목록을 조회하는 중 오류가 발생했습니다" })
    }
  }

  /**
   * ID로 기업 계정 조회
   */
  async getBusinessAccountById(id: number) {
    try {
      const business = await businessRepository.findById(id)

      if (!business) {
        throw ApiError.notFound({ message: `ID가 ${id}인 기업 계정을 찾을 수 없습니다` })
      }

      return business
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 기업 계정 조회 중 오류 발생`, error)
      throw ApiError.databaseError({ message: "기업 계정 정보를 조회하는 중 오류가 발생했습니다" })
    }
  }

  /**
   * 기업 계정 업데이트
   */
  async updateBusinessAccount(id: number, lastLogina: any) {
    try {
      // 1. 기존 기업 계정 확인
      const existingBusiness = await businessRepository.findById(id)

      if (!existingBusiness) {
        throw ApiError.notFound({ message: `ID가 ${id}인 기업 계정을 찾을 수 없습니다` })
      }

      // 2. 이메일 변경 시 중복 확인
      if (lastLogina.email && lastLogina.email !== existingBusiness.email) {
        const emailExists = await userService.getUserByEmail({ email: lastLogina.email })

        if (emailExists) {
          throw UserError.emailAlreadyExists(lastLogina.email)
        }
      }

      // 3. 비밀번호 변경 시 해시화
      if (lastLogina.password) {
        lastLogina.password = CryptoUtils.hashPassword({ password: lastLogina.password })
      }

      // 4. 기업 계정 업데이트
      const updatedBusiness = await businessRepository.update(id, lastLogina)

      logger.info(`기업 계정 ID: ${id} 정보가 업데이트되었습니다`)

      return updatedBusiness
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 기업 계정 업데이트 중 오류 발생`, error)
      throw ApiError.databaseError({ message: "기업 계정 정보를 업데이트하는 중 오류가 발생했습니다" })
    }
  }

  /**
   * 기업 계정 비활성화
   */
  async deactivateBusinessAccount(id: number) {
    try {
      // 1. 기존 기업 계정 확인
      const existingBusiness = await businessRepository.findById(id)

      if (!existingBusiness) {
        throw ApiError.notFound({ message: `ID가 ${id}인 기업 계정을 찾을 수 없습니다` })
      }

      // 2. 기업 계정 비활성화
      await businessRepository.update(id, { status: "INACTIVE" })

      logger.info(`기업 계정 ID: ${id} 비활성화되었습니다`)

      return true
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 기업 계정 비활성화 중 오류 발생`, error)
      throw ApiError.databaseError({ message: "기업 계정을 비활성화하는 중 오류가 발생했습니다" })
    }
  }

  // ============== 비공개 헬퍼 메서드 ==============

  /**
   * 사업자 등록번호 체크섬 검증
   * @private
   */
  private validateBusinessNumberChecksum(businessNumber: string): boolean {
    // 하이픈 제거 및 숫자 배열로 변환
    const digits = businessNumber.replace(/-/g, "").split("").map(Number)

    // 가중치
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]

    // 체크섬 계산
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * weights[i]
    }

    sum += Math.floor((digits[8] * 5) / 10)
    const checksum = (10 - (sum % 10)) % 10

    return checksum === digits[9]
  }

  /**
   * 국세청 API 연동 (모의)
   * @private
   */
  private async verifyWithTaxOffice(businessNumber: string): Promise<BusinessNumberValidationResult> {
    try {
      // 실제로는 국세청 API 호출
      // 여기서는 모의 응답 생성

      // 특정 테스트용 사업자 번호는 항상 실패하도록 설정
      const invalidTestNumbers = ["000-00-00000", "111-11-11111", "999-99-99999"]
      if (invalidTestNumbers.includes(businessNumber)) {
        return { isValid: false }
      }

      // 모의 응답 - 실제 환경에서는 외부 API 호출
      // const response = await axios.post('https://api.taxoffice.example.com/validate', {
      //   businessNumber: businessNumber
      // })

      // 80% 확률로 유효한 것으로 판단 (테스트 목적)
      const isValid = Math.random() > 0.2

      // 유효하지 않으면 간단히 false 반환
      if (!isValid) {
        return { isValid: false }
      }

      // 유효하면 회사 정보 포함
      return {
        isValid: true,
        companyInfo: {
          name: `테스트 기업 ${businessNumber.substring(0, 3)}`,
          address: "서울특별시 강남구 테헤란로 123",
          industryType: "소프트웨어 개발",
          status: "영업중",
          registrationDate: "2020-01-01",
        },
      }
    } catch (error) {
      logger.error(`국세청 API 호출 중 오류 발생: ${error}`)
      throw ApiError.serviceUnavailable({ message: "사업자 등록번호 확인 서비스에 일시적인 오류가 발생했습니다" })
    }
  }
}

export const businessService = new BusinessService()
