import { executeQuery } from "../../../db/connection"
import { ApiError } from "../../../errors/api-error"
import { ServerNetwork } from "../../../types/server"
import { logger } from "../../../utils/logger"

export class ServerNetworkRepository {
  private readonly tableName = "server_network"

  /**
   * 특정 시스템 이름을 가진 서버들의 네트워크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerNetwork[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }

      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      logger.debug(`네트워크 정보 조회 쿼리: ${query}, 파라미터: ${systemNames.join(", ")}`)
      return await executeQuery<ServerNetwork>({ sql: query, params: systemNames })
    } catch (error) {
      throw ApiError.databaseError({ message: "server network 목록을 조회하는 중에 오류가 발생했습니다" })
    }
  }
}

export const serverNetworkRepository = new ServerNetworkRepository()
