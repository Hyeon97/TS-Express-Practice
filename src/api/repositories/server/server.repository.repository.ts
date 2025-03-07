import { executeQuery } from "../../../db/connection"
import { ApiError } from "../../../errors/api-error"
import { ServerRepository } from "../../../types/server/server.db"
import { logger } from "../../../utils/logger"

export class ServerRepositoryRepository {
  private readonly tableName = "server_repository"

  /**
   * 특정 시스템 이름을 가진 서버들의 리포지토리 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerRepository[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      logger.debug(`리포지토리 정보 조회 쿼리: ${query}, 파라미터: ${systemNames.join(", ")}`)
      return await executeQuery<ServerRepository>({ sql: query, params: systemNames })
    } catch (error) {
      throw ApiError.databaseError({ message: "server repository 목록을 조회하는 중에 오류가 발생했습니다" })
    }
  }
}

export const serverRepositoryRepository = new ServerRepositoryRepository()
