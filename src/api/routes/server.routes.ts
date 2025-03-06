// src/routes/user.routes.ts
import { Router } from "express"
import { serverController } from "../controllers/server/server.controller"
import { validatFilterOptionQuery } from "../validators/server.validators"

export class ServerRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.postRoutesInitialize()
    this.getRoutesInitialize()
    this.deleteRoutesInitialize()
    this.putRoutesInitialize()
  }

  private postRoutesInitialize(): void {}

  private getRoutesInitialize(): void {
    //  전체 목록 리턴
    this.router.get("/", validatFilterOptionQuery, serverController.getServers)
    // 서버 이름으로 조회
    this.router.get("/name/:name", validatFilterOptionQuery, serverController.getServerByName)
  }

  private deleteRoutesInitialize(): void {}

  private putRoutesInitialize(): void {}
}
