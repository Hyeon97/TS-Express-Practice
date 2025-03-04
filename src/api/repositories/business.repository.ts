import { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise"
import { executeQuery, executeQuerySingle, withTransaction } from "../../db/connection"
import { IndustryType } from "../../dtos/user/business.dto"

// MySQL RowDataPacket과 Business 인터페이스를 결합한 타입
type BusinessRow = {
  id: number
  company_name: string
  business_number: string
  email: string
  password: string
  industry_type: string
  employee_count: number
  founding_year: number
  street: string
  city: string
  state: string
  zip_code: string
  status: string
  marketing_consent: number
  data_processing_consent: number
  create_date: Date
  last_login_date: Date
} & RowDataPacket

export class BusinessRepository {
  private readonly tableName = "business_accounts"
  private readonly addressTableName = "business_addresses"

  /**
   * 모든 기업 계정 조회
   */
  async findAll() {
    const query = `
      SELECT b.*, a.street, a.city, a.state, a.zip_code
      FROM ${this.tableName} b
      LEFT JOIN ${this.addressTableName} a ON b.id = a.business_id
    `
    const businesses = await executeQuery<BusinessRow>({ sql: query })

    // Date 객체로 변환
    return businesses.map((business) => this.mapDateFields(business))
  }

  /**
   * ID로 기업 계정 조회
   */
  async findById(id: number) {
    const query = `
      SELECT b.*, a.street, a.city, a.state, a.zip_code
      FROM ${this.tableName} b
      LEFT JOIN ${this.addressTableName} a ON b.id = a.business_id
      WHERE b.id = ?
    `
    const business = await executeQuerySingle<BusinessRow>({ sql: query, params: [id] })

    if (!business) return null

    return this.mapDateFields(business)
  }

  /**
   * 사업자 등록번호로 기업 계정 조회
   */
  async findByBusinessNumber(businessNumber: string) {
    const query = `
      SELECT b.*, a.street, a.city, a.state, a.zip_code
      FROM ${this.tableName} b
      LEFT JOIN ${this.addressTableName} a ON b.id = a.business_id
      WHERE b.business_number = ?
    `
    const business = await executeQuerySingle<BusinessRow>({ sql: query, params: [businessNumber] })

    if (!business) return null

    return this.mapDateFields(business)
  }

  /**
   * 이메일로 기업 계정 조회
   */
  async findByEmail(email: string) {
    const query = `
      SELECT b.*, a.street, a.city, a.state, a.zip_code
      FROM ${this.tableName} b
      LEFT JOIN ${this.addressTableName} a ON b.id = a.business_id
      WHERE b.email = ?
    `
    const business = await executeQuerySingle<BusinessRow>({ sql: query, params: [email] })

    if (!business) return null

    return this.mapDateFields(business)
  }

  /**
   * 기업 계정 생성
   */
  async createBusinessAccount(data: {
    companyName: string
    businessNumber: string
    email: string
    password: string
    industryType: IndustryType
    employeeCount: number
    foundingYear: number
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    marketingConsent: boolean
    dataProcessingConsent: boolean
    status: string
  }) {
    const now = new Date()

    return withTransaction({
      callback: async (connection: PoolConnection) => {
        // 1. 기업 계정 기본 정보 생성
        const businessQuery = `
          INSERT INTO ${this.tableName} (
            company_name, 
            business_number, 
            email, 
            password, 
            industry_type, 
            employee_count, 
            founding_year,
            status,
            marketing_consent,
            data_processing_consent,
            create_date, 
            last_login_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const businessParams = [data.companyName, data.businessNumber, data.email, data.password, data.industryType, data.employeeCount, data.foundingYear, data.status, data.marketingConsent ? 1 : 0, data.dataProcessingConsent ? 1 : 0, now, now]

        const [businessResult] = await connection.execute<ResultSetHeader>(businessQuery, businessParams)
        const businessId = businessResult.insertId

        // 2. 주소 정보 생성
        const addressQuery = `
          INSERT INTO ${this.addressTableName} (
            business_id,
            street,
            city,
            state,
            zip_code,
            create_date,
            last_login_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        const addressParams = [businessId, data.address.street, data.address.city, data.address.state, data.address.zipCode, now, now]

        await connection.execute<ResultSetHeader>(addressQuery, addressParams)

        // 3. 생성된 기업 계정 조회
        const [rows] = await connection.execute<BusinessRow[]>(
          `
          SELECT b.*, a.street, a.city, a.state, a.zip_code
          FROM ${this.tableName} b
          LEFT JOIN ${this.addressTableName} a ON b.id = a.business_id
          WHERE b.id = ?
          `,
          [businessId]
        )

        if (rows.length === 0) {
          throw new Error("기업 계정 생성 후 조회 실패")
        }

        return this.mapDateFields(rows[0])
      },
    })
  }

  /**
   * 기업 계정 정보 업데이트
   */
  async update(id: number, data: any) {
    return withTransaction({
      callback: async (connection: PoolConnection) => {
        const now = new Date()

        // 기업 계정 테이블 필드와 주소 테이블 필드 분리
        const businessFields: any = {}
        const addressFields: any = {}

        // 필드 구분
        for (const [key, value] of Object.entries(data)) {
          if (["street", "city", "state", "zipCode"].includes(key)) {
            // 주소 필드 관련 키를 DB 컬럼명 규칙에 맞게 변환
            const dbKey = key === "zipCode" ? "zip_code" : key
            addressFields[dbKey] = value
          } else if (["marketingConsent", "dataProcessingConsent"].includes(key)) {
            // boolean 값을 0/1로 변환하고 DB 컬럼명 규칙에 맞게 변환
            const dbKey = key === "marketingConsent" ? "marketing_consent" : "data_processing_consent"
            businessFields[dbKey] = value ? 1 : 0
          } else {
            // 기타 필드는 camelCase를 snake_case로 변환
            const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
            businessFields[dbKey] = value
          }
        }

        // 기업 계정 정보 업데이트
        if (Object.keys(businessFields).length > 0) {
          businessFields.last_login_date = now

          const setClause = Object.keys(businessFields)
            .map((key) => `${key} = ?`)
            .join(", ")

          const businessQuery = `
            UPDATE ${this.tableName}
            SET ${setClause}
            WHERE id = ?
          `

          const businessParams = [...Object.values(businessFields), id]

          await connection.execute<ResultSetHeader>(businessQuery, businessParams)
        }

        // 주소 정보 업데이트
        if (Object.keys(addressFields).length > 0) {
          addressFields.last_login_date = now

          const setClause = Object.keys(addressFields)
            .map((key) => `${key} = ?`)
            .join(", ")

          const addressQuery = `
            UPDATE ${this.addressTableName}
            SET ${setClause}
            WHERE business_id = ?
          `

          const addressParams = [...Object.values(addressFields), id]

          await connection.execute<ResultSetHeader>(addressQuery, addressParams)
        }

        // 업데이트된 기업 계정 조회
        const [rows] = await connection.execute<BusinessRow[]>(
          `
          SELECT b.*, a.street, a.city, a.state, a.zip_code
          FROM ${this.tableName} b
          LEFT JOIN ${this.addressTableName} a ON b.id = a.business_id
          WHERE b.id = ?
          `,
          [id]
        )

        if (rows.length === 0) {
          throw new Error("기업 계정 업데이트 후 조회 실패")
        }

        return this.mapDateFields(rows[0])
      },
    })
  }

  /**
   * 날짜 필드를 Date 객체로 변환
   */
  private mapDateFields(business: BusinessRow) {
    return {
      ...business,
      create_date: new Date(business.create_date),
      last_login_date: new Date(business.last_login_date),
      // boolean 값으로 변환
      marketing_consent: !!business.marketing_consent,
      data_processing_consent: !!business.data_processing_consent,
    }
  }
}

export const businessRepository = new BusinessRepository()
