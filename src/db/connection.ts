import mysql from "mysql2/promise"
import { config } from "../config/config"
import { logger } from "../utils/logger"

// 환경 변수에서 데이터베이스 설정 가져오기
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test_database",
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
  waitForConnections: true,
  queueLimit: 0,
}

// 커넥션 풀 생성
export const pool = mysql.createPool(dbConfig)

// 데이터베이스 연결 확인
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection()
    logger.info("데이터베이스 연결 성공")
    connection.release()
    return true
  } catch (error: any) {
    logger.error(`데이터베이스 연결 실패: ${error.message}`)
    return false
  }
}

// 쿼리 실행 헬퍼 함수
export const executeQuery = async <T>({ sql, params = [] }: { sql: string; params?: any[] }): Promise<T[]> => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows as T[]
  } catch (error: any) {
    logger.error(`쿼리 실행 오류: ${error.message}`)
    logger.debug(`SQL: ${sql}, 매개변수: ${JSON.stringify(params)}`)
    throw error
  }
}

// 단일 결과 쿼리 실행 헬퍼 함수
export const executeQuerySingle = async <T>({
  sql,
  params = [],
}: {
  sql: string
  params?: any[]
}): Promise<T | null> => {
  const results = await executeQuery<T>({ sql, params })
  return results.length > 0 ? results[0] : null
}

// 트랜잭션 헬퍼 함수
export const withTransaction = async <T>({
  callback,
}: {
  callback: (connection: mysql.PoolConnection) => Promise<T>
}): Promise<T> => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
