import { Request, Response, NextFunction } from "express"
import { businessService } from "../../services/business.service"
import { logger } from "../../utils/logger"
import { ApiUtils } from "../../utils/api.utils"
import { BusinessResponseDto } from "../../dtos/user/business.dto"

export class BusinessController {
  /**
   * 사업자 등록번호 유효성 검증 API
   */
  validateBusinessNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 이미 미들웨어에서 기본 형식 검증이 완료됨
      const { businessNumber } = req.body

      logger.debug(`사업자 등록번호 유효성 검증 요청: ${businessNumber}`)

      // 비즈니스 서비스 호출 (외부 API 연동 등의 복잡한 로직)
      const validationResult = await businessService.validateBusinessNumber(businessNumber)

      // 성공 응답
      ApiUtils.success({
        res,
        data: {
          valid: validationResult.isValid,
          businessNumber,
          companyInfo: validationResult.isValid ? validationResult.companyInfo : null,
        },
        statusCode: 200,
        message: validationResult.isValid ? "유효한 사업자 등록번호입니다" : "유효하지 않은 사업자 등록번호입니다",
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 기업 회원 가입 처리
   */
  registerBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // DTO 기반 검증이 완료된 요청 데이터 사용
      const businessData = req.body.toServiceDTO ? req.body.toServiceDTO() : req.body

      logger.debug(`기업 계정 생성 요청: ${businessData.companyName}, ${businessData.businessNumber}`)

      // 비즈니스 서비스 호출
      const newBusiness = await businessService.createBusinessAccount(businessData)

      // 응답 DTO로 변환
      const businessDTO = BusinessResponseDto.fromEntity(newBusiness)

      logger.info(`새 기업 계정이 생성되었습니다. ID: ${newBusiness.id}, 회사명: ${newBusiness.company_name}`)

      // 응답 생성
      ApiUtils.success({ res, data: businessDTO, statusCode: 201, message: "기업 계정이 성공적으로 생성되었습니다" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 기업 계정 목록 조회
   */
  getBusinessAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("기업 계정 목록 조회 요청")

      // 비즈니스 서비스 호출
      const businesses = await businessService.getAllBusinessAccounts()

      // 응답 DTO로 변환
      const businessDTOs = BusinessResponseDto.fromEntities(businesses)

      logger.info(`총 ${businesses.length}개의 기업 계정 정보를 조회했습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: businessDTOs })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 기업 계정 상세 조회
   */
  getBusinessAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID는 이미 validateIdParam 미들웨어에서 검증됨
      const id = parseInt(req.params.id)

      logger.debug(`ID: ${id} 기업 계정 정보 조회 요청`)

      // 비즈니스 서비스 호출
      const business = await businessService.getBusinessAccountById(id)

      // 응답 DTO로 변환
      const businessDTO = BusinessResponseDto.fromEntity(business)

      logger.info(`ID: ${id} 기업 계정 정보를 성공적으로 조회했습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: businessDTO })
    } catch (error) {
      next(error)
    }
  }
}

export const businessController = new BusinessController()
