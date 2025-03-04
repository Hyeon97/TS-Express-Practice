import { RowDataPacket } from "mysql2"
import { executeQuery } from "../../../db/connection"
import { ServerBasic } from "../../../types/server"

type ServerBasicRow = ServerBasic & RowDataPacket

export class ServerBasicRepository {
  private readonly tableName = "server_basic"
  /**
   * 모든 서버 조회
   */
  async findAll({}: {} = {}): Promise<ServerBasic[]> {
    const query = `SELECT * FROM ${this.tableName}`
    const servers = await executeQuery<ServerBasicRow>({ sql: query })
    return servers
  }
}

export const serverBasicRepository = new ServerBasicRepository()
