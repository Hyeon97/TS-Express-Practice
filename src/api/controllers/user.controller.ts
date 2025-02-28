import { Request, Response, NextFunction } from "express"
import { userService } from "../../services/user.service"
import { Controller } from "../../types/common"
import { logger } from "../../utils/logger"
import { ApiError } from "../../middleware/errorMiddleware"
import { CreateUserRequestDTO, UpdateUserRequestDTO, UserLoginRequestDTO } from "../../dtos/user/request.dto"
import { UserResponseDTO } from "../../dtos/user/response.dto"
import { ApiUtils } from "../../utils/api.utils"

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
      const userDTOs = UserResponseDTO.fromEntities(users)

      logger.info(`총 ${users.length}명의 사용자 정보를 조회했습니다.`)

      // 응답 생성
      ApiUtils.success(res, userDTOs)
    } catch (error) {
      logger.error("사용자 목록 조회 중 오류 발생")
      next(error)
    }
  }

  /**
   * ID로 사용자 조회
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        throw new ApiError(400, "유효하지 않은 사용자 ID입니다")
      }

      logger.debug(`ID: ${id} 사용자 정보 조회 요청`)

      // 서비스 호출
      const user = await userService.getUserById({ id })

      // 응답 DTO로 변환
      const userDTO = UserResponseDTO.fromEntity(user)

      logger.info(`ID: ${id} 사용자 정보를 성공적으로 조회했습니다.`)

      // 응답 생성
      ApiUtils.success(res, userDTO)
    } catch (error) {
      logger.error(`ID: ${req.params.id} 사용자 정보 조회 중 오류 발생`)
      next(error)
    }
  }

  /**
   * 사용자 생성
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 요청 DTO로 변환 및 유효성 검사
      const createUserDTO = new CreateUserRequestDTO(req.body)
      const validationErrors = createUserDTO.validate()

      if (validationErrors.length > 0) {
        logger.warn(`사용자 생성 요청 유효성 검사 실패: ${validationErrors.join(", ")}`)
        ApiUtils.error(res, validationErrors, 400)
        return
      }

      logger.debug(`사용자 생성 요청: ${createUserDTO.name}, ${createUserDTO.email}`)

      // 서비스 호출
      const newUser = await userService.createUser({ userData: createUserDTO.toServiceDTO() })

      // 응답 DTO로 변환
      const userDTO = UserResponseDTO.fromEntity(newUser)

      logger.info(`새 사용자가 생성되었습니다. ID: ${newUser.id}, 이름: ${newUser.name}`)

      // 응답 생성
      ApiUtils.success(res, userDTO, 201, "사용자가 성공적으로 생성되었습니다")
    } catch (error) {
      logger.error("사용자 생성 중 오류 발생")
      next(error)
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        throw new ApiError(400, "유효하지 않은 사용자 ID입니다")
      }

      // 요청 DTO로 변환 및 유효성 검사
      const updateUserDTO = new UpdateUserRequestDTO(req.body)
      const validationErrors = updateUserDTO.validate()

      if (validationErrors.length > 0) {
        logger.warn(`사용자 업데이트 요청 유효성 검사 실패: ${validationErrors.join(", ")}`)
        ApiUtils.error(res, validationErrors, 400)
        return
      }

      logger.debug(`ID: ${id} 사용자 정보 업데이트 요청`)

      // 서비스 호출
      const updatedUser = await userService.updateUser({
        id,
        userData: updateUserDTO.toServiceDTO(),
      })

      // 응답 DTO로 변환
      const userDTO = UserResponseDTO.fromEntity(updatedUser)

      logger.info(`ID: ${id} 사용자 정보가 성공적으로 업데이트되었습니다.`)

      // 응답 생성
      ApiUtils.success(res, userDTO, 200, "사용자 정보가 성공적으로 업데이트되었습니다")
    } catch (error) {
      logger.error(`ID: ${req.params.id} 사용자 정보 업데이트 중 오류 발생`)
      next(error)
    }
  }

  /**
   * 사용자 삭제
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id)

      if (isNaN(id)) {
        throw new ApiError(400, "유효하지 않은 사용자 ID입니다")
      }

      logger.debug(`ID: ${id} 사용자 삭제 요청`)

      // 서비스 호출
      await userService.deleteUser({ id })

      logger.info(`ID: ${id} 사용자가 성공적으로 삭제되었습니다.`)

      // 응답 생성
      ApiUtils.success(res, null, 200, "사용자가 성공적으로 삭제되었습니다")
    } catch (error) {
      logger.error(`ID: ${req.params.id} 사용자 삭제 중 오류 발생`)
      next(error)
    }
  }

  /**
   * 사용자 로그인(인증)
   */
  loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 요청 DTO로 변환 및 유효성 검사
      const loginDTO = new UserLoginRequestDTO(req.body)
      const validationErrors = loginDTO.validate()

      if (validationErrors.length > 0) {
        logger.warn(`로그인 요청 유효성 검사 실패: ${validationErrors.join(", ")}`)
        ApiUtils.error(res, validationErrors, 400)
        return
      }

      logger.debug(`이메일: ${loginDTO.email} 로그인 시도`)

      // 서비스 호출
      const user = await userService.authenticateUser({
        email: loginDTO.email,
        password: loginDTO.password,
      })

      // 응답 DTO로 변환
      const userDTO = UserResponseDTO.fromEntity(user)

      logger.info(`ID: ${user.id}, 이메일: ${user.email} 사용자 로그인 성공`)

      // 응답 생성
      ApiUtils.success(res, userDTO, 200, "로그인에 성공했습니다")
    } catch (error) {
      logger.error("사용자 로그인 중 오류 발생")
      next(error)
    }
  }
}

export const userController = new UserController()
