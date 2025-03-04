import { ApiError } from "../../../errors/api-error"
import { CreateTokenDTO } from "../../../types/token"
import { logger } from "../../../utils/logger"
import { userRepository } from "../../repositories/user/user.repository"

export class TokenService {
  /**
   * 토큰 발급
   */
  async createToken({ data }: { data: CreateTokenDTO }) {
    try {
      logger.debug(`토큰 생성 시작\n${data}`)
      //  email, password로 유저 정보 가져오기
      const user = await userRepository.findByEmailAndPassword({ email: data.email, password: data.password })
      if (!user) {
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error("토큰 생성 중 오류 발생", error)
      throw ApiError
    }
  }
}
