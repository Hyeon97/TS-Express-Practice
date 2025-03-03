import { EnvUtils } from "./src/utils/env.utils"

// 환경 변수 로드 및 초기화
EnvUtils.initialize()

// 환경 변수 로드 후에 다른 모듈 가져오기
import { app } from "./app"
import { config } from "./src/config/config"
import { logger } from "./src/utils/logger"
import { testConnection } from "./src/db/connection"

const startServer = async (): Promise<void> => {
  try {
    // 데이터베이스 연결 테스트
    logger.info("데이터베이스 연결 시도 중...")
    const dbConnected = await testConnection()

    if (!dbConnected) {
      logger.error("데이터베이스 연결 실패로 서버 시작이 중단되었습니다")
      logger.info("환경 변수를 확인하세요:")
      logger.info(`- DB_HOST: ${process.env.DB_HOST || "설정되지 않음"}`)
      logger.info(`- DB_USER: ${process.env.DB_USER || "설정되지 않음"}`)
      logger.info(`- DB_NAME: ${process.env.DB_NAME || "설정되지 않음"}`)

      // 개발 환경에서는 DB 연결 실패해도 서버 시작 (선택적)
      if (process.env.NODE_ENV === "development" && process.env.SKIP_DB_CHECK === "true") {
        logger.warn("개발 환경에서 DB 연결 없이 서버를 시작합니다.")
      } else {
        process.exit(1)
      }
    }

    // 서버 시작
    app.listen(config.port, () => {
      logger.info(`\n🚀 서버가 http://localhost:${config.port} 에서 실행 중입니다`)
      logger.info(`환경: ${config.environment}`)
    })
  } catch (error) {
    logger.error("서버 시작 중 오류가 발생했습니다:", error)
    process.exit(1)
  }
}

// 프로세스 종료 처리
process.on("unhandledRejection", (reason, promise) => {
  logger.error("처리되지 않은 Promise 거부:", reason)
  process.exit(1)
})

process.on("uncaughtException", (error) => {
  logger.error("처리되지 않은 예외:", error)
  process.exit(1)
})

// 서버 시작
startServer()
