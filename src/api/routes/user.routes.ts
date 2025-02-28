import { Router } from "express"
import { userController } from "../controllers/user.controller"

const router = Router()

// 사용자 CRUD 라우트
router.get("/", userController.getUsers)
router.get("/:id", userController.getUserById)
router.post("/", userController.createUser)
router.put("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)

// 인증 라우트 (추가)
router.post("/login", userController.loginUser)

export const userRoutes = router
