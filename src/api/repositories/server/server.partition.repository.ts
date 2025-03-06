import { executeQuery } from "../../../db/connection"
import { ServerPartition } from "../../../types/server"
import { logger } from "../../../utils/logger"

export class ServerPartitionRepository {
  private readonly tableName = "server_partition"

  /**
   * 특정 시스템 이름을 가진 서버들의 파티션 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerPartition[]> {
    if (systemNames.length === 0) {
      return []
    }

    const placeholders = systemNames.map(() => "?").join(",")
    const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
    logger.debug(`파티션 정보 조회 쿼리: ${query}, 파라미터: ${systemNames.join(", ")}`)

    return await executeQuery<ServerPartition>({ sql: query, params: systemNames })
  }
}

export const serverPartitionRepository = new ServerPartitionRepository()
