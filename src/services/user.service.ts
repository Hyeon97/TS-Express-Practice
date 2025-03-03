import { userRepository } from "../repositories/user.repository"
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user"
import { logger } from "../utils/logger"
import { ApiError, UserError } from "../middleware/errorMiddleware"
import { CryptoUtils } from "../utils/crypto.utils"

export class UserService {
  /**
   * 모든 사용자 조회
   */
  async getAllUsers({}: {} = {}): Promise<User[]> {
    try {
      logger.debug("모든 사용자 정보 조회 시도")
      const users = await userRepository.findAll({})
      logger.info(`총 ${users.length}명의 사용자 정보를 조회했습니다`)
      return users
    } catch (error) {
      logger.error("사용자 목록 조회 중 오류 발생", error)
      throw ApiError.databaseError("사용자 목록을 조회하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * ID로 사용자 조회
   */
  async getUserById({ id }: { id: number }): Promise<User> {
    try {
      logger.debug(`ID ${id}로 사용자 조회 시도`)
      const user = await userRepository.findById({ id })

      if (!user) {
        logger.warn(`ID ${id}인 사용자를 찾을 수 없습니다`)
        throw ApiError.notFound(`ID가 ${id}인 사용자를 찾을 수 없습니다`)
      }

      logger.debug(`ID ${id} 사용자 조회 성공`)
      return user
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 사용자 조회 중 오류 발생`, error)
      throw ApiError.databaseError("사용자 정보를 조회하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail({ email }: { email: string }): Promise<User | null> {
    try {
      logger.debug(`이메일 ${email}로 사용자 조회 시도`)
      return await userRepository.findByEmail({ email })
    } catch (error) {
      logger.error(`이메일 ${email} 사용자 조회 중 오류 발생`, error)
      throw ApiError.databaseError("사용자 정보를 조회하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 사용자 인증
   */
  async authenticateUser({ email, password }: { email: string; password: string }): Promise<User> {
    try {
      logger.debug(`이메일 ${email}로 사용자 인증 시도`)
      const user = await userRepository.findByEmail({ email })

      if (!user) {
        logger.warn(`인증 실패: 이메일 ${email}에 해당하는 사용자 없음`)
        throw UserError.invalidCredentials()
      }

      // 계정 잠김 상태 확인
      if (user.lockUntil && user.lockUntil > new Date()) {
        logger.warn(`계정 잠김: 사용자 ID ${user.id}, 잠금 해제 시간: ${user.lockUntil}`)
        throw UserError.accountLocked("로그인 시도 제한 초과", user.lockUntil)
      }

      // 비밀번호 검증
      const isPasswordValid = CryptoUtils.verifyPassword({
        password,
        storedHash: user.password,
      })

      if (!isPasswordValid) {
        // 로그인 실패 횟수 증가 (5회 이상 실패 시 계정 잠금)
        await this.incrementLoginFailures(user.id)
        logger.warn(`인증 실패: 사용자 ID ${user.id}의 비밀번호 불일치`)
        throw UserError.invalidCredentials()
      }

      // 로그인 성공 시 실패 횟수 초기화
      if (user.loginFailures > 0) {
        await userRepository.resetLoginFailures(user.id)
      }

      logger.info(`인증 성공: 사용자 ID ${user.id}, 이메일 ${user.email}`)
      return user
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error("사용자 인증 중 오류 발생", error)
      throw ApiError.internal("사용자 인증 중에 오류가 발생했습니다")
    }
  }

  /**
   * 로그인 실패 횟수 증가
   * @private
   */
  private async incrementLoginFailures(userId: number): Promise<void> {
    try {
      const user = await userRepository.findById({ id: userId })
      if (!user) return

      const newFailCount = (user.loginFailures || 0) + 1
      logger.debug(`사용자 ID ${userId}의 로그인 실패 횟수 증가: ${newFailCount}회`)

      // 5회 이상 실패 시 계정 잠금 (30분)
      if (newFailCount >= 5) {
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30분
        await userRepository.lockAccount(userId, lockUntil)
        logger.warn(`사용자 ID ${userId} 계정이 잠겼습니다. 잠금 해제 시간: ${lockUntil}`)
      } else {
        await userRepository.updateLoginFailures(userId, newFailCount)
      }
    } catch (error) {
      logger.error(`로그인 실패 횟수 증가 중 오류: 사용자 ID ${userId}`, error)
    }
  }

  /**
   * 새 사용자 생성
   */
  async createUser({ userData }: { userData: CreateUserDTO }): Promise<User> {
    try {
      logger.debug(`새 사용자 생성 시도: ${userData.email}`)

      // 이메일 중복 확인
      const existingUser = await userRepository.findByEmail({ email: userData.email })

      if (existingUser) {
        logger.warn(`이메일 중복: ${userData.email}`)
        throw UserError.emailAlreadyExists(userData.email)
      }

      // 비밀번호 복잡성 검사
      this.validatePasswordComplexity(userData.password)

      // 비밀번호 해싱
      const hashedPassword = CryptoUtils.hashPassword({ password: userData.password })

      // 사용자 생성
      const newUser = await userRepository.create({
        userData: {
          ...userData,
          password: hashedPassword,
        },
      })

      logger.info(`새 사용자 생성 성공: ID ${newUser.id}, 이메일 ${newUser.email}`)
      return newUser
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error("사용자 생성 중 오류 발생", error)
      throw ApiError.internal("사용자를 생성하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 고급 사용자 생성 (프로필 정보 포함)
   */
  async createAdvancedUser({ userData }: { userData: any }): Promise<User> {
    try {
      logger.debug(`고급 사용자 생성 시도: ${userData.email}`)

      // 이메일 중복 확인
      const existingUser = await userRepository.findByEmail({ email: userData.email })

      if (existingUser) {
        logger.warn(`이메일 중복: ${userData.email}`)
        throw UserError.emailAlreadyExists(userData.email)
      }

      // 비밀번호 복잡성 검사
      this.validatePasswordComplexity(userData.password)

      // 비밀번호 해싱
      const hashedPassword = CryptoUtils.hashPassword({ password: userData.password })

      // 사용자 기본 정보 준비
      const userBasicData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      }

      // 사용자 생성 (트랜잭션 사용)
      const newUser = await userRepository.createAdvancedUser({
        userData: userBasicData,
        profileData: userData.profile,
        marketingConsent: userData.marketingConsent || false,
      })

      logger.info(`고급 사용자 생성 성공: ID ${newUser.id}, 이메일 ${newUser.email}`)
      return newUser
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error("고급 사용자 생성 중 오류 발생", error)
      throw ApiError.internal("사용자를 생성하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser({ id, userData }: { id: number; userData: UpdateUserDTO }): Promise<User> {
    try {
      logger.debug(`사용자 ID ${id} 정보 업데이트 시도`)

      // 사용자 존재 확인
      const existingUser = await userRepository.findById({ id })

      if (!existingUser) {
        logger.warn(`ID ${id}인 사용자를 찾을 수 없습니다`)
        throw ApiError.notFound(`ID가 ${id}인 사용자를 찾을 수 없습니다`)
      }

      // 이메일 변경 시 중복 확인
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await userRepository.findByEmail({ email: userData.email })

        if (emailExists) {
          logger.warn(`이메일 중복: ${userData.email}`)
          throw UserError.emailAlreadyExists(userData.email)
        }
      }

      // 비밀번호 변경 시 복잡성 검사 및 해싱
      let updatedUserData = { ...userData }

      if (userData.password) {
        this.validatePasswordComplexity(userData.password)
        updatedUserData.password = CryptoUtils.hashPassword({ password: userData.password })
      }

      // 사용자 업데이트
      const updatedUser = await userRepository.update({ id, userData: updatedUserData })

      if (!updatedUser) {
        throw ApiError.internal("사용자 정보를 업데이트하지 못했습니다")
      }

      logger.info(`사용자 ID ${id} 정보 업데이트 성공`)
      return updatedUser
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 사용자 업데이트 중 오류 발생`, error)
      throw ApiError.internal("사용자 정보를 업데이트하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 사용자 삭제
   */
  async deleteUser({ id }: { id: number }): Promise<void> {
    try {
      logger.debug(`사용자 ID ${id} 삭제 시도`)

      // 사용자 존재 확인
      const existingUser = await userRepository.findById({ id })

      if (!existingUser) {
        logger.warn(`ID ${id}인 사용자를 찾을 수 없습니다`)
        throw ApiError.notFound(`ID가 ${id}인 사용자를 찾을 수 없습니다`)
      }

      // 사용자 삭제
      const deleted = await userRepository.delete({ id })

      if (!deleted) {
        throw ApiError.internal("사용자를 삭제하지 못했습니다")
      }

      logger.info(`사용자 ID ${id} 삭제 성공`)
    } catch (error) {
      if (error instanceof ApiError) throw error

      logger.error(`ID ${id} 사용자 삭제 중 오류 발생`, error)
      throw ApiError.internal("사용자를 삭제하는 중에 오류가 발생했습니다")
    }
  }

  /**
   * 비밀번호 복잡성 검사
   * @private
   */
  private validatePasswordComplexity(password: string): void {
    const rules: string[] = []
    const errors: string[] = []

    // 최소 8자 이상
    rules.push("최소 8자 이상")
    if (password.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다")
    }

    // 대문자 포함
    rules.push("최소 1개의 대문자 포함")
    if (!/[A-Z]/.test(password)) {
      errors.push("비밀번호에는 최소 하나의 대문자가 포함되어야 합니다")
    }

    // 소문자 포함
    rules.push("최소 1개의 소문자 포함")
    if (!/[a-z]/.test(password)) {
      errors.push("비밀번호에는 최소 하나의 소문자가 포함되어야 합니다")
    }

    // 숫자 포함
    rules.push("최소 1개의 숫자 포함")
    if (!/[0-9]/.test(password)) {
      errors.push("비밀번호에는 최소 하나의 숫자가 포함되어야 합니다")
    }

    // 특수문자 포함
    rules.push("최소 1개의 특수문자 포함")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("비밀번호에는 최소 하나의 특수문자가 포함되어야 합니다")
    }

    // 연속된 문자 검사
    rules.push("연속된 문자 3개 이상 사용 금지")
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i)
      const char2 = password.charCodeAt(i + 1)
      const char3 = password.charCodeAt(i + 2)

      if (char1 + 1 === char2 && char2 + 1 === char3) {
        errors.push("비밀번호에 3자 이상의 연속된 문자가 포함되어서는 안 됩니다")
        break
      }
    }

    if (errors.length > 0) {
      logger.warn(`비밀번호 복잡성 검사 실패: ${errors.join(", ")}`)
      throw UserError.passwordComplexityFailed(rules)
    }

    logger.debug("비밀번호 복잡성 검사 통과")
  }
}

export const userService = new UserService()
