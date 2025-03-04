import { ApiError } from "../../../errors/api-error"
import { ServerBasic } from "../../../types/server"
import { logger } from "../../../utils/logger"
import { serverBasicRepository } from "../../repositories/server/server.basic.repository"

export class ServerService {
  /**
   * 모든 서버 조회
   */
  async getAllServers({}: {} = {}): Promise<ServerBasic[]> {
    try {
      logger.debug("모든 server 정보 조회 시도")
      const servers = await serverBasicRepository.findAll({})
      logger.info(`총 ${servers.length}개의 server 정보를 조회했습니다`)
      return servers
    } catch (error) {
      logger.error("server 목록 조회 중 오류 발생", error)
      throw ApiError.databaseError({ message: "server 목록을 조회하는 중에 오류가 발생했습니다" })
    }
  }
}
