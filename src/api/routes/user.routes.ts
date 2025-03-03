// src/routes/user.routes.ts
import { Router } from "express"
import { userController } from "../controllers/user.controller"
import { businessController } from "../controllers/business.controller"
import {
  validateIdParam,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
  validateLoginDTO,
  validateCreateUserDTO,
  validateUpdateUserDTO,
  validateAdvancedUserRegistration,
  validateBusinessRegistration,
  validateBusinessNumberFormat,
  validateEmailQuery,
} from "../validators/user.validators"

export class UserRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.postRoutesInitialize()
    this.getRoutesInitialize()
    this.deleteRoutesInitialize()
    this.putRoutesInitialize()
  }

  private postRoutesInitialize(): void {
    // Express-validator 기반 검증
    this.router.post("/express-validator", validateLogin, userController.loginUser)

    // Joi 스키마 기반 검증
    this.router.post("/joi", validateCreateUser, userController.createUser)

    // DTO 클래스 기반 검증
    this.router.post("/dto", validateCreateUserDTO, userController.createUser)
    this.router.post("/login", validateLoginDTO, userController.loginUser)

    // 하이브리드 검증 (여러 방식 조합)
    this.router.post("/advanced", validateAdvancedUserRegistration, userController.createAdvancedUser)
    this.router.post("/business", validateBusinessRegistration, businessController.registerBusiness)

    // 비즈니스 관련 라우트
    this.router.post(
      "/validate-business-number",
      validateBusinessNumberFormat,
      businessController.validateBusinessNumber
    )
  }

  private getRoutesInitialize(): void {
    //  전체 목록 리턴
    this.router.get("/", userController.getUsers)
    //  id로 조회
    this.router.get("/id/:id", validateIdParam, userController.getUserById)
    //  email로 조회
    this.router.get("/email", validateEmailQuery, userController.getUserById)
  }

  private deleteRoutesInitialize(): void {
    // 간단한 API 라우트는 기본적으로 Joi 스키마 기반 검증 사용
    this.router.delete("/:id", validateIdParam, userController.deleteUser)
  }

  private putRoutesInitialize(): void {
    // Joi 스키마 기반 검증
    this.router.put("/joi/:id", validateIdParam, validateUpdateUser, userController.updateUser)
    // DTO 클래스 기반 검증
    this.router.put("/dto/:id", validateIdParam, validateUpdateUserDTO, userController.updateUser)
  }
}
