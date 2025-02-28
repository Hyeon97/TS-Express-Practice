import { IConfig, Environment, LogFormat } from "../types/common"

class AppConfig implements IConfig {
  readonly port: number
  readonly environment: Environment
  readonly apiPrefix: string
  readonly logLevel: string
  readonly logDir: string
  readonly logFormat: LogFormat

  constructor() {
    // 환경 변수에서 값 가져오기
    this.environment = this.getEnvValue<Environment>("NODE_ENV", "development")
    this.port = this.getNumberEnv("PORT", 3000)
    this.apiPrefix = this.getEnvValue<string>("API_PREFIX", "/api")
    this.logLevel = this.getEnvValue<string>("LOG_LEVEL", "info")
    this.logDir = this.getEnvValue<string>("LOG_DIR", "logs")
    this.logFormat = this.getEnvValue<LogFormat>("LOG_FORMAT", "combined")

    // 설정 정보 로깅
    this.logConfig()
  }

  /**
   * 문자열 환경 변수 가져오기
   */
  private getEnvValue<T>(key: string, defaultValue: T): T {
    return (process.env[key] as unknown as T) || defaultValue
  }

  /**
   * 숫자 환경 변수 가져오기
   */
  private getNumberEnv(key: string, defaultValue: number): number {
    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  /**
   * 불리언 환경 변수 가져오기
   */
  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    return value.toLowerCase() === "true"
  }

  /**
   * 현재 로드된 설정 정보를 로깅합니다.
   */
  private logConfig(): void {
    console.log("애플리케이션 설정:")
    console.log(`- 환경: ${this.environment}`)
    console.log(`- 포트: ${this.port}`)
    console.log(`- API 경로: ${this.apiPrefix}`)
    console.log(`- 로그 레벨: ${this.logLevel}`)
    console.log(`- 로그 디렉토리: ${this.logDir}`)
    console.log(`- 로그 포맷: ${this.logFormat}`)
  }
}

// 싱글톤 인스턴스 내보내기
export const config = new AppConfig()
