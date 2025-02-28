import { userRepository } from "../repositories/user.repository"
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user"
import { logger } from "../utils/logger"
import { ApiError } from "../middleware/errorMiddleware"
import { CryptoUtils } from "../utils/crypto.utils"

export class UserService {
  /**
   * 모든 사용자 조회
   */
  async getAllUsers({}: {} = {}): Promise<User[]> {
    try {
      return await userRepository.findAll({})
    } catch (error) {
      logger.error("사용자 목록 조회 중 오류 발생", error)
      throw new ApiError(500, "사용자 목록을 조회하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * ID로 사용자 조회
   */
  async getUserById({ id }: { id: number }): Promise<User> {
    try {
      const user = await userRepository.findById({ id })

      if (!user) {
        throw new ApiError(404, `ID가 ${id}인 사용자를 찾을 수 없습니다`)
      }

      return user
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 사용자 조회 중 오류 발생`, error)
      throw new ApiError(500, "사용자 정보를 조회하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail({ email }: { email: string }): Promise<User | null> {
    try {
      return await userRepository.findByEmail({ email })
    } catch (error) {
      logger.error(`이메일 ${email} 사용자 조회 중 오류 발생`, error)
      throw new ApiError(500, "사용자 정보를 조회하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 사용자 인증
   */
  async authenticateUser({ email, password }: { email: string; password: string }): Promise<User> {
    try {
      const user = await userRepository.findByEmail({ email })

      if (!user) {
        throw new ApiError(401, "이메일 또는 비밀번호가 올바르지 않습니다")
      }

      // crypto를 사용한 비밀번호 검증
      const isPasswordValid = CryptoUtils.verifyPassword({
        password,
        storedHash: user.password,
      })

      if (!isPasswordValid) {
        throw new ApiError(401, "이메일 또는 비밀번호가 올바르지 않습니다")
      }

      return user
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error("사용자 인증 중 오류 발생", error)
      throw new ApiError(500, "사용자 인증 중에 오류가 발생했습니다")
    }
  }

  /**
   * 새 사용자 생성
   */
  async createUser({ userData }: { userData: CreateUserDTO }): Promise<User> {
    try {
      // 이메일 중복 확인
      const existingUser = await userRepository.findByEmail({ email: userData.email })

      if (existingUser) {
        throw new ApiError(409, "이미 사용 중인 이메일입니다")
      }

      // crypto를 사용한 비밀번호 해싱
      const hashedPassword = CryptoUtils.hashPassword({ password: userData.password })

      // 사용자 생성
      const newUser = await userRepository.create({
        userData: {
          ...userData,
          password: hashedPassword,
        },
      })

      logger.info(`새 사용자가 생성되었습니다. ID: ${newUser.id}, 이메일: ${newUser.email}`)

      return newUser
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error("사용자 생성 중 오류 발생", error)
      throw new ApiError(500, "사용자를 생성하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser({ id, userData }: { id: number; userData: UpdateUserDTO }): Promise<User> {
    try {
      // 사용자 존재 확인
      const existingUser = await userRepository.findById({ id })

      if (!existingUser) {
        throw new ApiError(404, `ID가 ${id}인 사용자를 찾을 수 없습니다`)
      }

      // 이메일 변경 시 중복 확인
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await userRepository.findByEmail({ email: userData.email })

        if (emailExists) {
          throw new ApiError(409, "이미 사용 중인 이메일입니다")
        }
      }

      // 비밀번호 변경 시 해싱
      let updatedUserData = { ...userData }

      if (userData.password) {
        updatedUserData.password = CryptoUtils.hashPassword({ password: userData.password })
      }

      // 사용자 업데이트
      const updatedUser = await userRepository.update({ id, userData: updatedUserData })

      if (!updatedUser) {
        throw new ApiError(500, "사용자 정보를 업데이트하지 못했습니다")
      }

      logger.info(`사용자 ID: ${id} 정보가 업데이트되었습니다`)

      return updatedUser
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 사용자 업데이트 중 오류 발생`, error)
      throw new ApiError(500, "사용자 정보를 업데이트하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 사용자 삭제
   */
  async deleteUser({ id }: { id: number }): Promise<void> {
    try {
      // 사용자 존재 확인
      const existingUser = await userRepository.findById({ id })

      if (!existingUser) {
        throw new ApiError(404, `ID가 ${id}인 사용자를 찾을 수 없습니다`)
      }

      // 사용자 삭제
      const deleted = await userRepository.delete({ id })

      if (!deleted) {
        throw new ApiError(500, "사용자를 삭제하지 못했습니다")
      }

      logger.info(`사용자 ID: ${id}가 삭제되었습니다`)
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 사용자 삭제 중 오류 발생`, error)
      throw new ApiError(500, "사용자를 삭제하는 중에 오류가 발생했습니다")
    }
  }
}

export const userService = new UserService()
