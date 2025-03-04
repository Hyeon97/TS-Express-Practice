import { Request, Response, NextFunction } from "express"
import { ApiUtils } from "../../../utils/api.utils"
import { logger } from "../../../utils/logger"
import { ServerService } from "../../services/server/server.service"
import { ServerResponseDTO } from "../../../dtos/server/server.dto"
import { VALID_OS_VALUES, VALID_BOOLEAN_VALUES, VALID_STATE_VALUES, VALID_LICENSE_VALUES } from "../../../types/common"

export class ServerController {
  //  server 조회 옵션 추출
  private extractFilterOptions(query: any) {
    const { os, network, disk, partition, state, license } = query

    return {
      os: os as (typeof VALID_OS_VALUES)[number],
      network: network as (typeof VALID_BOOLEAN_VALUES)[number],
      disk: disk as (typeof VALID_BOOLEAN_VALUES)[number],
      partition: partition as (typeof VALID_BOOLEAN_VALUES)[number],
      state: state as (typeof VALID_STATE_VALUES)[number],
      license: license as (typeof VALID_LICENSE_VALUES)[number],
    }
  }
  /**
   * 모든 서버 조회
   */
  getServers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("서버 목록 조회 요청")

      // 필터 옵션 추출
      const filterOptions = this.extractFilterOptions(req.query)
      logger.debug(`적용된 필터 옵션: ${JSON.stringify(filterOptions)}`)

      // 서비스 호출
      const servers = await new ServerService().getAllServers()

      // 응답 DTO로 변환
      const serversDTOs = ServerResponseDTO.fromEntities({ servers })
      logger.info(`총 ${servers.length}개의 서버 정보를 조회했습니다.`)

      // 응답 생성
      ApiUtils.success({ res, data: serversDTOs })
    } catch (error) {
      next(error)
    }
  }
  getServerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {}
  getServerByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {}
}

export const serverController = new ServerController()
