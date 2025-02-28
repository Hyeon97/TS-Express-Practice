import { User } from "../../types/user"
import { ApiResponseDTO } from "../base.dto"

/**
 * 사용자 정보 응답 DTO
 */
export class UserResponseDTO {
  id: number
  name: string
  email: string
  createdAt: string
  updatedAt: string

  constructor(data: Partial<UserResponseDTO> = {}) {
    this.id = data.id || 0
    this.name = data.name || ""
    this.email = data.email || ""
    this.createdAt = data.createdAt || ""
    this.updatedAt = data.updatedAt || ""
  }

  /**
   * 데이터베이스 엔티티로부터 DTO 생성
   */
  static fromEntity(user: User): UserResponseDTO {
    return new UserResponseDTO({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    })
  }

  /**
   * 엔티티 배열에서 DTO 배열로 변환
   */
  static fromEntities(users: User[]): UserResponseDTO[] {
    return users.map((user) => UserResponseDTO.fromEntity(user))
  }
}

/**
 * 단일 사용자 응답 포맷
 */
export type SingleUserResponseDTO = ApiResponseDTO<UserResponseDTO>

/**
 * 사용자 목록 응답 포맷
 */
export type UserListResponseDTO = ApiResponseDTO<UserResponseDTO[]>
