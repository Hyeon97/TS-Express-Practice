// 사용자 테이블(user_info) 데이터 구조 정의
export interface User {
  id: number
  name: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
}

// 사용자 생성 시 필요한 데이터 타입
export type CreateUserDTO = Omit<User, "id" | "created_at" | "updated_at">

// 사용자 업데이트 시 필요한 데이터 타입 (모든 필드 선택적)
export type UpdateUserDTO = Partial<Omit<User, "id" | "created_at" | "updated_at">>

// 사용자 조회 결과 타입 (비밀번호 제외)
export type UserResponse = Omit<User, "password">
