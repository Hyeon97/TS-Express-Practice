import { executeQuery, executeQuerySingle, withTransaction } from "../db/connection"
import { User, CreateUserDTO, UpdateUserDTO, CreateAdvancedUserDTO } from "../types/user"
import { logger } from "../utils/logger"
import { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise"

// MySQL RowDataPacket과 User 인터페이스를 결합한 타입
type UserRow = User & RowDataPacket

export class UserRepository {
  private readonly tableName = "user_info"
  private readonly profileTableName = "user_profiles"

  /**
   * 모든 사용자 조회
   */
  async findAll({}: {} = {}): Promise<User[]> {
    const query = `
      SELECT * FROM ${this.tableName}
    `
    const users = await executeQuery<UserRow>({ sql: query })

    // Date 객체로 변환 및 로그인 실패 횟수 매핑
    return users.map((user) => this.mapUserData(user))
  }

  /**
   * ID로 단일 사용자 조회
   */
  async findById({ id }: { id: number }): Promise<User | null> {
    const query = `
      SELECT u.*, COUNT(l.id) as login_failures, l.lock_until
      FROM ${this.tableName} u
      LEFT JOIN user_login_attempts l ON u.id = l.user_id AND l.success = 0 AND l.create_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      WHERE u.id = ?
      GROUP BY u.id
    `
    const user = await executeQuerySingle<UserRow>({ sql: query, params: [id] })

    if (!user) return null

    return this.mapUserData(user)
  }

  /**
   * 이메일로 단일 사용자 조회
   */
  async findByEmail({ email }: { email: string }): Promise<User | null> {
    const query = `
      SELECT u.*, COUNT(l.id) as login_failures, l.lock_until
      FROM ${this.tableName} u
      LEFT JOIN user_login_attempts l ON u.id = l.user_id AND l.success = 0 AND l.create_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      WHERE u.email = ?
      GROUP BY u.id
    `
    const user = await executeQuerySingle<UserRow>({ sql: query, params: [email] })

    if (!user) return null

    return this.mapUserData(user)
  }

  /**
   * 새 사용자 생성
   */
  async create({ userData }: { userData: CreateUserDTO }): Promise<User> {
    const now = new Date()

    const query = `
      INSERT INTO ${this.tableName} (name, email, password, create_date, last_login_date)
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
   * 고급 사용자 생성 (프로필 정보 포함)
   */
  async createAdvancedUser({ userData, profileData, marketingConsent = false }: CreateAdvancedUserDTO): Promise<User> {
    const now = new Date()

    return withTransaction({
      callback: async (connection: PoolConnection) => {
        // 기본 사용자 정보 생성
        const userQuery = `
          INSERT INTO ${this.tableName} (
            name, 
            email, 
            password, 
            marketing_consent,
            create_date, 
            last_login_date
          ) VALUES (?, ?, ?, ?, ?, ?)
        `

        const userParams = [userData.name, userData.email, userData.password, marketingConsent ? 1 : 0, now, now]

        const [userResult] = await connection.execute<ResultSetHeader>(userQuery, userParams)
        const userId = userResult.insertId

        // 프로필 정보 생성
        const profileQuery = `
          INSERT INTO ${this.profileTableName} (
            user_id,
            phone,
            address,
            create_date,
            last_login_date
          ) VALUES (?, ?, ?, ?, ?)
        `

        const profileParams = [userId, profileData.phone, profileData.address || null, now, now]

        await connection.execute<ResultSetHeader>(profileQuery, profileParams)

        // 생성된 사용자 조회 (프로필 정보 포함)
        const [rows] = await connection.execute<UserRow[]>(
          `
          SELECT u.*, p.phone, p.address
          FROM ${this.tableName} u
          LEFT JOIN ${this.profileTableName} p ON u.id = p.user_id
          WHERE u.id = ?
          `,
          [userId]
        )

        if (rows.length === 0) {
          throw new Error("사용자 생성 후 조회 실패")
        }

        const user = this.mapDateFields({ user: rows[0] })

        // 프로필 정보 추가
        user.profile = {
          userId,
          phone: rows[0]["phone"] as string,
          address: rows[0]["address"] as string,
        }

        return user
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

    // last_login_date 필드 자동 업데이트
    setValues.push("last_login_date = ?")
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
   * 로그인 실패 횟수 증가
   */
  async updateLoginFailures(userId: number, failCount: number): Promise<void> {
    const now = new Date()

    const query = `
      INSERT INTO user_login_attempts (user_id, success, create_date)
      VALUES (?, 0, ?)
    `

    await executeQuery({ sql: query, params: [userId, now] })

    logger.debug(`사용자 ID: ${userId}의 로그인 실패 횟수가 ${failCount}로 업데이트되었습니다`)
  }

  /**
   * 계정 잠금
   */
  async lockAccount(userId: number, lockUntil: Date): Promise<void> {
    const now = new Date()

    const query = `
      INSERT INTO user_login_attempts (user_id, success, lock_until, create_date)
      VALUES (?, 0, ?, ?)
    `

    await executeQuery({ sql: query, params: [userId, lockUntil, now] })

    logger.warn(`사용자 ID: ${userId}의 계정이 ${lockUntil}까지 잠겼습니다`)
  }

  /**
   * 로그인 실패 횟수 초기화
   */
  async resetLoginFailures(userId: number): Promise<void> {
    const now = new Date()

    // 성공한 로그인 기록 추가
    const insertQuery = `
      INSERT INTO user_login_attempts (user_id, success, create_date)
      VALUES (?, 1, ?)
    `

    await executeQuery({ sql: insertQuery, params: [userId, now] })

    // 이전 실패 기록에 lock_until 제거 (잠금 해제)
    const updateQuery = `
      UPDATE user_login_attempts
      SET lock_until = NULL
      WHERE user_id = ? AND lock_until IS NOT NULL
    `

    await executeQuery({ sql: updateQuery, params: [userId] })

    logger.debug(`사용자 ID: ${userId}의 로그인 실패 횟수가 초기화되었습니다`)
  }

  /**
   * 날짜 필드를 Date 객체로 변환
   */
  private mapDateFields({ user }: { user: UserRow }): User {
    return {
      ...user,
      create_date: new Date(user.create_date),
      last_login_date: new Date(user.last_login_date),
    }
  }

  /**
   * 사용자 데이터 매핑 (로그인 실패 횟수 및 잠금 시간 포함)
   */
  private mapUserData(user: UserRow): User {
    const mappedUser = this.mapDateFields({ user })

    // // 로그인 실패 횟수 추가
    // if (user.login_failures !== undefined) {
    //   mappedUser.loginFailures = parseInt(user.login_failures as any, 10) || 0
    // }

    // // 계정 잠금 시간 추가
    // if (user.lock_until) {
    //   mappedUser.lockUntil = new Date(user.lock_until)
    // }

    return mappedUser
  }
}

export const userRepository = new UserRepository()
