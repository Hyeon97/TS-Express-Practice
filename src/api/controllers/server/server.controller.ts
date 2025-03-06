import { Request, Response, NextFunction } from "express"
import { ApiUtils } from "../../../utils/api.utils"
import { logger } from "../../../utils/logger"
import { ServerService } from "../../services/server/server.service"
import { ServerResponseDTOFactory } from "../../../dtos/server/server.dto"
import { VALID_OS_VALUES, VALID_STATE_VALUES, VALID_LICENSE_VALUES } from "../../../types/common"
import { convertToBoolean } from "../../../utils/data-convert.util"
import { ApiError } from "../../../errors/api-error"

export class ServerController {
  //  server 조회 옵션 추출
  private extractFilterOptions(query: any) {
    const { os, network, disk, partition, repository, state, license, detail } = query
    return {
      os: (os as (typeof VALID_OS_VALUES)[number]) || "",
      network: network ? convertToBoolean(network) : false,
      disk: disk ? convertToBoolean(disk) : false,
      partition: partition ? convertToBoolean(partition) : false,
      repository: repository ? convertToBoolean(repository) : false,
      state: (state as (typeof VALID_STATE_VALUES)[number]) || "",
      license: (license as (typeof VALID_LICENSE_VALUES)[number]) || "",
      detail: detail ? convertToBoolean(detail) : false, // detail 플래그 추가
    }
  }

  /**
   * 서버 정보 조회
   */
  getServers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("서버 목록 조회 요청")

      // 필터 옵션 추출
      const filterOptions = this.extractFilterOptions(req.query)
      logger.debug(`적용된 필터 옵션: ${JSON.stringify(filterOptions)}`)

      const serverService = new ServerService()
      const serversData =
        filterOptions.disk || filterOptions.network || filterOptions.partition || filterOptions.repository
          ? await serverService.getServersWithRelations({ filterOptions })
          : await serverService.getAllServers({ filterOptions })

      // 상세 정보 요청 여부에 따라 적절한 DTO 사용
      const serversDTOs = ServerResponseDTOFactory.createFromEntities({
        detail: filterOptions.detail,
        serversData,
      })

      logger.info(`총 ${serversData.length}개의 서버 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}`)

      // 응답 생성
      ApiUtils.success({ res, data: serversDTOs })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 서버 이름으로 정보 조회
   */
  getServerByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params
      logger.debug(`서버 이름으로 정보 조회 요청: ${name}`)

      // 필터 옵션 추출
      const filterOptions = this.extractFilterOptions(req.query)
      logger.debug(`적용된 필터 옵션: ${JSON.stringify(filterOptions)}`)

      const serverService = new ServerService()
      const serverData = await serverService.getServerByName({ name, filterOptions })
      if (!serverData.server) {
        throw ApiError.notFound({ message: `이름이 ${name}인 서버를 찾을 수 없습니다.` })
      }
      // 상세 정보 요청 여부에 따라 적절한 DTO 사용
      const serverDTO = ServerResponseDTOFactory.createFromEntity({
        detail: filterOptions.detail,
        serverData,
      })
      logger.info(`이름이 ${name}인 서버 정보 조회 완료. 상세 정보 포함: ${filterOptions.detail}`)
      // 응답 생성
      ApiUtils.success({ res, data: serverDTO })
    } catch (error) {
      next(error)
    }
  }
}

export const serverController = new ServerController()
