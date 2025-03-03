import { Request, Response, NextFunction } from "express"

export type LogFormat = "dev" | "combined" | "common" | "short" | "tiny"
export type LogLevel = "error" | "warn" | "info" | "http" | "debug" | "silly"

export interface Controller {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>
  getUserById(req: Request, res: Response, next: NextFunction): Promise<void>
  createUser(req: Request, res: Response, next: NextFunction): Promise<void>
  updateUser(req: Request, res: Response, next: NextFunction): Promise<void>
  deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>
}
