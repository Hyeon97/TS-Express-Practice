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
} from "../validators/user.validators"

const router = Router()

// 유저 CRUD 라우트 - 다양한 검증 방식 시연
router.get("/", userController.getUsers)
router.get("/:id", validateIdParam, userController.getUserById)

// Express-validator 기반 검증
router.post("/express-validator", validateLogin, userController.loginUser)

// Joi 스키마 기반 검증
router.post("/joi", validateCreateUser, userController.createUser)
router.put("/joi/:id", validateIdParam, validateUpdateUser, userController.updateUser)

// DTO 클래스 기반 검증
router.post("/dto", validateCreateUserDTO, userController.createUser)
router.put("/dto/:id", validateIdParam, validateUpdateUserDTO, userController.updateUser)
router.post("/login", validateLoginDTO, userController.loginUser)

// 하이브리드 검증 (여러 방식 조합)
router.post("/advanced", validateAdvancedUserRegistration, userController.createAdvancedUser)
router.post("/business", validateBusinessRegistration, businessController.registerBusiness)

// 비즈니스 관련 라우트
router.post("/validate-business-number", validateBusinessNumberFormat, businessController.validateBusinessNumber)

// 간단한 API 라우트는 기본적으로 Joi 스키마 기반 검증 사용
router.delete("/:id", validateIdParam, userController.deleteUser)

export const userRoutes = router
