import { query } from "express-validator"
import { validate } from "../middleware/validationMiddleware"

/**
 * server filter option query 검증
 */
//  옵션
const filterOptionValidationRules = [
  query("os").optional().isIn(["win", "lin"]).withMessage("OS는 'win' 또는 'lin'만 가능합니다."),
  query("network").optional().isBoolean().withMessage("network는 'true' 또는 'false'만 가능합니다."),
  query("disk").optional().isBoolean().withMessage("disk는 'true' 또는 'false'만 가능합니다."),
  query("partition").optional().isBoolean().withMessage("partition은 'true' 또는 'false'만 가능합니다."),
  query("repository").optional().isBoolean().withMessage("repository는 'true' 또는 'false'만 가능합니다."),
  query("detail").optional().isBoolean().withMessage("detail은 'true' 또는 'false'만 가능합니다."),
  query("state").optional().isIn(["connect", "disconnect"]).withMessage("state는 'connect' 또는 'disconnect'만 가능합니다."),
  query("license").optional().isIn(["assign", "unassign"]).withMessage("license는 'assign' 또는 'unassign'만 가능합니다."),
]
export const validatFilterOptionQuery = validate(filterOptionValidationRules)
