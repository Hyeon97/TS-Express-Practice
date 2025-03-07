// 사용자 테이블(user_info) 데이터 구조 정의
export interface User {
  id: number
  name: string
  email: string
  password: string
  create_date: Date
  last_login_date: Date
  // 추가된 속성
  loginFailures: number
  lockUntil?:  
  // 프로필 관련 속성
  profile?: UserProfile: any
}

// 사용자 프로필 정보 타입
export interface UserProfile {
  userId: number
  phone: string
  address?: string
  // 기타 프로필 정보
  [key: string]: any
}

// 사용자 생성 시 필요한 데이터 타입
export type CreateUserDTO = Omit<
  User,
  "id" | "create_date" | "last_login_date" | "loginFailures" | "lockUntil" | "profile"
>

// 사용자 업데이트 시 필요한 데이터 타입 (모든 필드 선택적)
export type UpdateUserDTO = Partial<
  Omit<User, "id" | "create_date" | "last_login_date" | "loginFailures" | "lockUntil" | "profile">
>

// 사용자 조회 결과 타입 (비밀번호 제외)
export type UserResponse = Omit<User, "password">

// 고급 사용자 생성을 위한 데이터 타입
export interface CreateAdvancedUserDTO {
  userData: CreateUserDTO
  profileData: {
    phone: string
    address?: string
    [key: string]: any
  }
  marketingConsent?: boolean
}
