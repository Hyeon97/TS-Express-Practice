import { Request, Response, NextFunction } from "express"
import { userService } from "../../services/user.service"
import { Controller } from "../../types/common"
import { logger } from "../../utils/logger"
import { ApiUtils } from "../../utils/api.utils"
import { UserResponseDto } from "../../dtos/user/user.dto"

export class UserController implements Controller {
  /**
   * 모든 사용자 조회
   */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("사용자 목록 조회 요청")

      // 서비스 호출
      const users = await userService.getAllUsers()

      // 응답 DTO로 변환
      const userDTOs = UserResponseDto.fromEntities(users)
      logger.info(`총 ${users.length}명의 사용자 정보를 조회했습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: userDTOs })
    } catch (error) {
      next(error)
    }
  }

  /**
   * ID로 사용자 조회
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID는 이미 validateIdParam 미들웨어에서 검증 및 형변환됨
      const id = parseInt(req.params.id)

      logger.debug(`ID: ${id} 사용자 정보 조회 요청`)

      // 서비스 호출
      const user = await userService.getUserById({ id })

      // 응답 DTO로 변환
      const userDTO = UserResponseDto.fromEntity(user)

      logger.info(`ID: ${id} 사용자 정보를 성공적으로 조회했습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: userDTO })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 사용자 생성 (다양한 검증 방식 지원)
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body

      logger.debug(`사용자 생성 요청: ${name}, ${email}`)

      // 서비스 호출 (유효성 검사는 이미 미들웨어에서 수행됨)
      const newUser = await userService.createUser({
        userData: { name, email, password },
      })

      // 응답 DTO로 변환
      const userDTO = UserResponseDto.fromEntity(newUser)

      logger.info(`새 사용자가 생성되었습니다. ID: ${newUser.id}, 이름: ${newUser.name}`)

      // 응답 생성
      ApiUtils.success({ res, data: userDTO, statusCode: 201, message: "사용자가 성공적으로 생성되었습니다" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 고급 사용자 생성 (DTO 클래스 사용)
   */
  createAdvancedUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // DTO 기반 검증이 완료된 요청 데이터 사용
      const userData = req.body.toServiceDTO ? req.body.toServiceDTO() : req.body

      logger.debug(`고급 사용자 생성 요청: ${userData.name}, ${userData.email}`)

      // 서비스 호출
      const newUser = await userService.createAdvancedUser({ userData })

      // 응답 DTO로 변환
      const userDTO = UserResponseDto.fromEntity(newUser)

      logger.info(`새 고급 사용자가 생성되었습니다. ID: ${newUser.id}, 이름: ${newUser.name}`)

      // 응답 생성
      ApiUtils.success({ res, data: userDTO, statusCode: 201, message: "고급 사용자가 성공적으로 생성되었습니다" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 사용자 정보 업데이트 (다양한 검증 방식 지원)
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID는 이미 validateIdParam 미들웨어에서 검증됨
      const id = parseInt(req.params.id)

      // DTO 기반 검증이 완료된 요청 데이터 사용
      const userData = req.body.toServiceDTO ? req.body.toServiceDTO() : req.body

      logger.debug(`ID: ${id} 사용자 정보 업데이트 요청`)

      // 서비스 호출
      const updatedUser = await userService.updateUser({
        id,
        userData,
      })

      // 응답 DTO로 변환
      const userDTO = UserResponseDto.fromEntity(updatedUser)

      logger.info(`ID: ${id} 사용자 정보가 성공적으로 업데이트되었습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: userDTO, statusCode: 200, message: "사용자 정보가 성공적으로 업데이트되었습니다" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 사용자 삭제
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ID는 이미 validateIdParam 미들웨어에서 검증됨
      const id = parseInt(req.params.id)

      logger.debug(`ID: ${id} 사용자 삭제 요청`)

      // 서비스 호출
      await userService.deleteUser({ id })

      logger.info(`ID: ${id} 사용자가 성공적으로 삭제되었습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: null, statusCode: 200, message: "사용자가 성공적으로 삭제되었습니다" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 사용자 로그인 (다양한 검증 방식 지원)
   */
  loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body

      logger.debug(`이메일: ${email} 로그인 시도`)

      // 서비스 호출
      const user = await userService.authenticateUser({
        email,
        password,
      })

      // 응답 DTO로 변환
      const userDTO = UserResponseDto.fromEntity(user)

      logger.info(`ID: ${user.id}, 이메일: ${user.email} 사용자 로그인 성공`)

      // 응답 생성
      ApiUtils.success({ res, data: userDTO, statusCode: 200, message: "로그인에 성공했습니다" })
    } catch (error) {
      next(error)
    }
  }
}

export const userController = new UserController()
