import { executeQuery, executeQuerySingle, withTransaction } from "../db/connection"
import { User, CreateUserDTO, UpdateUserDTO } from "../types/user"
import { logger } from "../utils/logger"
import { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise"

// MySQL RowDataPacket과 User 인터페이스를 결합한 타입
type UserRow = User & RowDataPacket

export class UserRepository {
  private readonly tableName = "user_info"

  /**
   * 모든 사용자 조회
   */
  async findAll({}: {} = {}): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName}`
    const users = await executeQuery<UserRow>({ sql: query })

    // Date 객체로 변환
    return users.map((user) => this.mapDateFields({ user }))
  }

  /**
   * ID로 단일 사용자 조회
   */
  async findById({ id }: { id: number }): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`
    const user = await executeQuerySingle<UserRow>({ sql: query, params: [id] })

    if (!user) return null

    return this.mapDateFields({ user })
  }

  /**
   * 이메일로 단일 사용자 조회
   */
  async findByEmail({ email }: { email: string }): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = ?`
    const user = await executeQuerySingle<UserRow>({ sql: query, params: [email] })

    if (!user) return null

    return this.mapDateFields({ user })
  }

  /**
   * 새 사용자 생성
   */
  async create({ userData }: { userData: CreateUserDTO }): Promise<User> {
    const now = new Date()

    const query = `
      INSERT INTO ${this.tableName} (name, email, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `

    const params = [userData.name, userData.email, userData.password, now, now]

    return withTransaction({
      callback: async (connection: PoolConnection) => {
        const [result] = await connection.execute<ResultSetHeader>(query, params)
        const id = result.insertId

        // 생성된 사용자 조회
        const [rows] = await connection.execute<UserRow[]>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id])

        if (rows.length === 0) {
          throw new Error("사용자 생성 후 조회 실패")
        }

        return this.mapDateFields({ user: rows[0] })
      },
    })
  }

  /**
   * 사용자 정보 업데이트
   */
  async update({ id, userData }: { id: number; userData: UpdateUserDTO }): Promise<User | null> {
    // 업데이트할 필드가 없다면 현재 사용자 정보 반환
    if (Object.keys(userData).length === 0) {
      return this.findById({ id })
    }

    // 업데이트할 필드와 값 생성
    const setValues: string[] = []
    const params: any[] = []

    for (const [key, value] of Object.entries(userData)) {
      setValues.push(`${key} = ?`)
      params.push(value)
    }

    // updated_at 필드 자동 업데이트
    setValues.push("updated_at = ?")
    params.push(new Date())

    // ID 파라미터 추가
    params.push(id)

    const query = `
      UPDATE ${this.tableName}
      SET ${setValues.join(", ")}
      WHERE id = ?
    `

    const [result] = await executeQuery<ResultSetHeader>({ sql: query, params })

    if (result.affectedRows === 0) {
      return null
    }

    return this.findById({ id })
  }

  /**
   * 사용자 삭제
   */
  async delete({ id }: { id: number }): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`
    const [result] = await executeQuery<ResultSetHeader>({ sql: query, params: [id] })

    return result.affectedRows > 0
  }

  /**
   * 날짜 필드를 Date 객체로 변환
   */
  private mapDateFields({ user }: { user: UserRow }): User {
    return {
      ...user,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at),
    }
  }
}

export const userRepository = new UserRepository()
