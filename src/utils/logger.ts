import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import morgan, { StreamOptions } from "morgan"
import path from "path"
import fs from "fs"
import { config } from "../config/config"

// 로그 디렉토리 생성
const logDir = config.logDir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5,
}

// 로그 색상 정의
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
  silly: "white",
}

// Winston에 색상 추가
winston.addColors(colors)

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`
  })
)

// 콘솔용 컬러 포맷 정의
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    return `${info.timestamp} ${info.level}: ${info.message}`
  })
)

// 일별 로테이팅 파일 전송자 설정
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  maxSize: "20m",
  zippedArchive: true,
  level: config.logLevel,
})

// 에러 로그용 일별 로테이팅 파일 전송자 설정
const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  maxSize: "20m",
  zippedArchive: true,
  level: "error",
})

// Winston 로거 생성
export const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format: logFormat,
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // 로그 파일 출력
    fileRotateTransport,
    // 에러 로그 파일 출력
    errorFileRotateTransport,
  ],
  exitOnError: false,
})

// Morgan 스트림 생성
export const stream: StreamOptions = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Morgan 미들웨어 생성 함수
export const morganMiddleware = morgan(config.logFormat, { stream })

// 로깅 초기화 메시지
logger.info(`로그 시스템 초기화 완료 (${config.environment} 환경)`)
