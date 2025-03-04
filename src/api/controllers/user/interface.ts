import { Request, Response, NextFunction } from "express"

export interface IUserController {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>
  getUserById(req: Request, res: Response, next: NextFunction): Promise<void>
  createUser(req: Request, res: Response, next: NextFunction): Promise<void>
  updateUser(req: Request, res: Response, next: NextFunction): Promise<void>
  deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>
}
