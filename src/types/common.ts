import { Request, Response, NextFunction } from "express"

export type Environment = "development" | "production" | "test"
export type LogFormat = "dev" | "combined" | "common" | "short" | "tiny"
export type LogLevel = "error" | "warn" | "info" | "http" | "debug" | "silly"

export interface IConfig {
  port: number
  environment: Environment
  apiPrefix: string
  logLevel: string
  logDir: string
  logFormat: LogFormat
}

export interface IUser {
  id: string
  name: string
  email: string
  createdAt: Date
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface Controller {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>
  getUserById(req: Request, res: Response, next: NextFunction): Promise<void>
  createUser(req: Request, res: Response, next: NextFunction): Promise<void>
  updateUser(req: Request, res: Response, next: NextFunction): Promise<void>
  deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>
}

export type GenericController = {
  [key: string]: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
