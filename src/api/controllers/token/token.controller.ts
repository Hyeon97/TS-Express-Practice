import { Request, Response, NextFunction } from "express"
import { ITokenController } from "./interface"
import { logger } from "../../../utils/logger"
import { ApiUtils } from "../../../utils/api.utils"

export class TokenController implements ITokenController {
  /**
   * 토큰 발급
   */
  createToken(req: Request, res: Response, next: NextFunction): any {
    try {
      logger.debug("토큰 발급 요청")

      // const token = await tokenService.createToke()
      // const tokenDTO = TokenResponseDTO

      // logger.info(`토큰 생성됨`)

      // ApiUtils.success({ res, data: tokenDTO })
    } catch (error) {
      next(error)
    }
  }
}
