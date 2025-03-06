import { ApiError } from "../../../errors/api-error"
import {
  ServerBasic,
  serverDBResponse,
  ServerDisk,
  ServerFilterOptions,
  ServerNetwork,
  ServerPartition,
  ServerRepository,
} from "../../../types/server"
import { logger } from "../../../utils/logger"
import { serverBasicRepository } from "../../repositories/server/server.basic.repository"
import { serverDiskRepository } from "../../repositories/server/server.disk.repository"
import { serverNetworkRepository } from "../../repositories/server/server.network.repository"
import { serverPartitionRepository } from "../../repositories/server/server.partition.repository"
import { serverRepositoryRepository } from "../../repositories/server/server.repository.repository"

export class ServerService {
  //  필터 옵션 전처리
  private processFilterOptions({ filterOptions }: { filterOptions?: ServerFilterOptions }): ServerFilterOptions {
    if (!filterOptions) return {}

    // 기본 필터 옵션 정의
    const defaultOptions: ServerFilterOptions = {
      os: "",
      network: false,
      disk: false,
      partition: false,
      repository: false,
      state: "",
      license: "",
    }

    // 기본 옵션과 제공된 옵션을 병합하여 반환
    // Boolean 값들은 명시적으로 Boolean으로 변환하여 타입 안전성 보장
    return {
      ...defaultOptions,
      ...filterOptions,
      network: filterOptions.network ? Boolean(filterOptions.network) : defaultOptions.network,
      disk: filterOptions.disk ? Boolean(filterOptions.disk) : defaultOptions.disk,
      partition: filterOptions.partition ? Boolean(filterOptions.partition) : defaultOptions.partition,
      repository: filterOptions.repository ? Boolean(filterOptions.repository) : defaultOptions.repository,
    }
  }

  // 서버 데이터와 관련 데이터를 조합하는 헬퍼 메서드
  private combineServerData({
    servers,
    disks = [],
    networks = [],
    partitions = [],
    repositories = [],
  }: {
    servers: ServerBasic[]
    disks?: ServerDisk[]
    networks?: ServerNetwork[]
    partitions?: ServerPartition[]
    repositories?: ServerRepository[]
  }): serverDBResponse[] {
    const serverMap = new Map<string, serverDBResponse>()

    // 서버 기본 정보로 맵 초기화
    servers.forEach((server) => {
      serverMap.set(server.sSystemName, { server })
    })

    // 디스크 정보 추가
    disks.forEach((disk) => {
      const serverResponse = serverMap.get(disk.sSystemName)
      if (serverResponse) {
        if (!serverResponse.disk) {
          serverResponse.disk = []
        }
        serverResponse.disk.push(disk)
      }
    })

    // 네트워크 정보 추가
    networks.forEach((network) => {
      const serverResponse = serverMap.get(network.sSystemName)
      if (serverResponse) {
        if (!serverResponse.network) {
          serverResponse.network = []
        }
        serverResponse.network.push(network)
      }
    })

    // 파티션 정보 추가
    partitions.forEach((partition) => {
      const serverResponse = serverMap.get(partition.sSystemName)
      if (serverResponse) {
        if (!serverResponse.partition) {
          serverResponse.partition = []
        }
        serverResponse.partition.push(partition)
      }
    })

    // 리포지토리 정보 추가
    repositories.forEach((repo) => {
      const serverResponse = serverMap.get(repo.sSystemName)
      if (serverResponse) {
        if (!serverResponse.repository) {
          serverResponse.repository = []
        }
        serverResponse.repository.push(repo)
      }
    })

    return Array.from(serverMap.values())
  }

  /**
   * 서버 정보 및 요청된 관련 정보 조회
   */
  async getServersWithRelations({ filterOptions }: { filterOptions?: ServerFilterOptions } = {}): Promise<serverDBResponse[]> {
    try {
      const processedFilters = this.processFilterOptions({ filterOptions })
      logger.debug(`필터 옵션이 적용된 server 정보 조회 시도: ${JSON.stringify(processedFilters)}`)

      // 서버 기본 정보 조회
      const servers = await serverBasicRepository.findAll({ filterOptions: processedFilters })

      if (servers.length === 0) {
        return []
      }

      const systemNames = servers.map((server) => server.sSystemName)

      // 관련 정보 조회를 위한 Promise 배열
      const promises: Promise<void>[] = []
      let disks: ServerDisk[] = []
      let networks: ServerNetwork[] = []
      let partitions: ServerPartition[] = []
      let repositories: ServerRepository[] = []

      // 디스크 정보 조회
      if (processedFilters.disk) {
        promises.push(
          serverDiskRepository.findBySystemNames({ systemNames }).then((result) => {
            disks = result
          })
        )
      }

      // 네트워크 정보 조회
      if (processedFilters.network) {
        promises.push(
          serverNetworkRepository.findBySystemNames({ systemNames }).then((result) => {
            networks = result
          })
        )
      }

      // 파티션 정보 조회
      if (processedFilters.partition) {
        promises.push(
          serverPartitionRepository.findBySystemNames({ systemNames }).then((result) => {
            partitions = result
          })
        )
      }

      // 리포지토리 정보 조회
      if (processedFilters.repository) {
        promises.push(
          serverRepositoryRepository.findBySystemNames({ systemNames }).then((result) => {
            repositories = result
          })
        )
      }

      // 모든 Promise 완료 대기
      await Promise.all(promises)

      // 데이터 조합
      const result = this.combineServerData({
        servers,
        disks,
        networks,
        partitions,
        repositories,
      })

      logger.info(`총 ${result.length}개의 server 정보를 관련 데이터와 함께 조회했습니다`)
      return result
    } catch (error) {
      logger.error("server 정보 조회 중 오류 발생", error)
      if (error instanceof ApiError) throw error
      throw ApiError.serverError({ message: "server 정보를 조회하는 중에 오류가 발생했습니다" })
    }
  }

  /**
   * 모든 서버의 기본 정보만 조회
   */
  async getAllServers({ filterOptions }: { filterOptions?: ServerFilterOptions } = {}): Promise<serverDBResponse[]> {
    try {
      const processedFilters = this.processFilterOptions({ filterOptions })
      const servers = await serverBasicRepository.findAll({ filterOptions: processedFilters })
      return servers.map((server) => ({ server }))
    } catch (error) {
      logger.error("server 목록 조회 중 오류 발생", error)
      if (error instanceof ApiError) throw error
      throw ApiError.serverError({ message: `server 목록을 조회하는 중에 오류가 발생했습니다.` })
    }
  }

  /**
   * 서버 이름으로 조회
   */
  async getServerByName({ name, filterOptions }: { name: string; filterOptions?: ServerFilterOptions }): Promise<serverDBResponse> {
    try {
      const processedFilters = this.processFilterOptions({ filterOptions })
      const server = await serverBasicRepository.findByServerName({ name, filterOptions: processedFilters })
      return { server: server[0] || null }
    } catch (error) {
      logger.error("server 조회 중 오류 발생", error)
      if (error instanceof ApiError) throw error
      throw ApiError.serverError({ message: `server 정보를 조회하는 중에 오류가 발생했습니다.` })
    }
  }
}
