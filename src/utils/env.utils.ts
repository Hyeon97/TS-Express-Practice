import path from "path"
import fs from "fs"
import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import { Environment } from "../types/common"

/**
 * 환경 변수 및 실행 환경 관련 유틸리티
 */
export class EnvUtils {
  // 패키지 여부 확인 (싱글톤 패턴으로 한 번만 계산)
  static readonly isPackaged = "pkg" in process
  static readonly execDir = this.isPackaged ? path.dirname(process.execPath) : process.cwd()

  /**
   * 환경 변수를 로드하고 실행 정보를 설정합니다.
   * @returns 현재 실행 디렉토리
   */
  static initialize(): string {
    // 패키징 환경에 따라 다른 환경 변수 파일 로드
    if (this.isPackaged) {
      // 패키징된 환경: apiENV 파일 사용
      const envPath = path.join(this.execDir, "apiENV")
      this.loadEnvFile(envPath)
    } else {
      // 개발 환경: NODE_ENV에 따른 .env 파일 사용
      this.loadEnvFromNodeEnv()
    }

    // NODE_ENV가 설정되지 않은 경우 기본값 설정
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "development"
      console.log("NODE_ENV가 설정되지 않아 기본값 'development'로 설정합니다.")
    }

    // 실행 정보 로깅
    this.logEnvironmentInfo()

    return this.execDir
  }

  /**
   * 환경별 .env 파일 로드
   */
  private static loadEnvFromNodeEnv(): void {
    const nodeEnv = process.env.NODE_ENV || "development"
    const envPath = path.resolve(process.cwd(), "env", `.env.${nodeEnv}`)
    console.log(`envPath: ${envPath}`)
    this.loadEnvFile(envPath)
  }

  /**
   * 지정된 경로의 환경 변수 파일 로드
   */
  private static loadEnvFile(envPath: string): void {
    if (fs.existsSync(envPath)) {
      try {
        const envConfig = dotenv.config({ path: envPath })
        dotenvExpand.expand(envConfig)

        console.log(`환경 변수 파일 로드: ${envPath}`)
      } catch (error) {
        console.error(`환경 변수 파일 로드 중 오류 발생: ${error}`)
        console.warn("기본 환경 변수를 사용합니다.")
      }
    } else {
      console.warn(`환경 변수 파일을 찾을 수 없습니다: ${envPath}`)
      console.warn("기본 환경 변수를 사용합니다.")
    }
  }

  /**
   * 현재 환경 정보 로깅
   */
  private static logEnvironmentInfo(): void {
    console.log(`실행 모드: ${this.isPackaged ? "패키징됨" : "개발"}`)
    console.log(`실행 디렉토리: ${this.execDir}`)
    console.log(`환경: ${process.env.NODE_ENV}`)
  }
}
