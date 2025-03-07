import { executeQuery } from "../../../db/connection"
import { ApiError } from "../../../errors/api-error"
import { OsType, StateType, ServerFilterOptions } from "../../../types/server/server"
import { ServerBasic } from "../../../types/server/server.db"

import { logger } from "../../../utils/logger"

export class ServerBasicRepository {
  private readonly tableName = "server_basic"
  private conditions: string[] = []
  private params: any[] = []
  private readonly OS_TYPES: Record<OsType, number> = { win: 1, lin: 2 }

  /**
   * 조건과 파라미터 초기화
   */
  private resetQueryState(): void {
    this.conditions = []
    this.params = []
  }

  /**
   * OS 필터 조건 적용
   */
  private applyOsFilter({ os }: { os: OsType }): void {
    this.conditions.push(`nOS = ?`)
    this.params.push(this.OS_TYPES[os])
  }

  /**
   * 상태 필터 조건 적용
   */
  private applyStateFilter({ state }: { state: StateType }): void {
    this.conditions.push(`sStatus = ?`)
    this.params.push(state)
  }

  /**
   * 라이센스 필터 조건 적용
   */
  private applyLicenseFilter({ license }: { license: string }): void {
    if (license === "assign") {
      this.conditions.push(`nLicenseID > 0`) // 라이센스 할당됨
    } else if (license === "unassign") {
      this.conditions.push(`nLicenseID = 0`) // 라이센스 할당되지 않음
    }
  }

  /**
   * 모든 서버 조회
   */
  async findAll({ filterOptions }: { filterOptions?: ServerFilterOptions } = {}): Promise<ServerBasic[]> {
    try {
      this.resetQueryState()
      if (filterOptions) {
        // OS 필터 적용
        if (filterOptions.os) {
          this.applyOsFilter({ os: filterOptions.os })
        }
        // 상태 필터 적용
        if (filterOptions.state) {
          this.applyStateFilter({ state: filterOptions.state })
        }
        // 라이센스 필터 적용
        if (filterOptions.license) {
          this.applyLicenseFilter({ license: filterOptions.license })
        }
      }

      let query = `SELECT * FROM ${this.tableName}`
      if (this.conditions.length > 0) {
        query += ` WHERE ${this.conditions.join(" AND ")}`
      }
      logger.debug(`실행 쿼리: ${query}, 파라미터: ${this.params.join(", ")}`)
      return await executeQuery<ServerBasic>({ sql: query, params: this.params })
    } catch (error) {
      throw ApiError.databaseError({ message: "server 목록을 조회하는 중에 오류가 발생했습니다" })
    }
  }

  /**
   * 특정 서버 조회
   */
  async findByServerName({ name, filterOptions }: { name: string; filterOptions?: ServerFilterOptions }): Promise<ServerBasic[]> {
    try {
      this.resetQueryState()
      this.params.push(name)
      if (filterOptions) {
        // OS 필터 적용
        if (filterOptions.os) {
          this.applyOsFilter({ os: filterOptions.os })
        }
        // 상태 필터 적용
        if (filterOptions.state) {
          this.applyStateFilter({ state: filterOptions.state })
        }
        // 라이센스 필터 적용
        if (filterOptions.license) {
          this.applyLicenseFilter({ license: filterOptions.license })
        }
      }

      let query = `SELECT * FROM ${this.tableName} WHERE sSystemName = ?`
      if (this.conditions.length > 0) {
        query += ` ${this.conditions.join(" AND ")}`
      }
      logger.debug(`실행 쿼리: ${query}, 파라미터: ${this.params.join(", ")}`)
      return await executeQuery<ServerBasic>({ sql: query, params: this.params })
    } catch (error) {
      throw ApiError.databaseError({ message: "server 정보를 조회하는 중에 오류가 발생했습니다" })
    }
  }
}

export const serverBasicRepository = new ServerBasicRepository()
