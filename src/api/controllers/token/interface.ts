import { Request, Response, NextFunction } from "express"

export interface ITokenController {
  createToken(req: Request, res: Response, next: NextFunction): Promise<void>
}
