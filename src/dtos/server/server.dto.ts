import { OSTypeLables, ServerBasic, SystemModeLabels } from "../../types/server"

// 필드 매핑 정의
export type ServerResponseFields = {
  systemName: string
  systemMode: string
  os: string
  version: string
  ip: string
  status: string
  licenseID: string | number
}

// 기본값 상수
const DEFAULT_VALUES: ServerResponseFields = {
  systemName: "",
  systemMode: "Unknown",
  os: "Unknown",
  version: "Unknown",
  ip: "Unknown",
  status: "Unknown",
  licenseID: "Unassigned",
}

// 사용자 응답 DTO
export class ServerResponseDTO implements ServerResponseFields {
  systemName: string
  systemMode: string
  os: string
  version: string
  ip: string
  status: string
  licenseID: string | number

  constructor({ systemName = DEFAULT_VALUES.systemName, systemMode = DEFAULT_VALUES.systemMode, os = DEFAULT_VALUES.os, version = DEFAULT_VALUES.version, ip = DEFAULT_VALUES.ip, status = DEFAULT_VALUES.status, licenseID = DEFAULT_VALUES.licenseID }: Partial<ServerResponseFields> = {}) {
    this.systemName = systemName
    this.systemMode = systemMode
    this.os = os
    this.version = version
    this.ip = ip
    this.status = status
    this.licenseID = licenseID
  }

  /**
   * 엔티티에서 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ server }: { server: ServerBasic }): ServerResponseDTO {
    return new ServerResponseDTO({
      systemName: server.sSystemName,
      systemMode: SystemModeLabels[server.nSystemMode],
      os: OSTypeLables[server.nOS],
      version: server.sOSVersion,
      ip: server.sIPAddress,
      status: server.sStatus,
      licenseID: server.nLicenseID === 0 ? DEFAULT_VALUES.licenseID : server.nLicenseID,
    })
  }

  /**
   * 엔티티 배열에서 DTO 배열로 변환
   */
  static fromEntities({ servers }: { servers: ServerBasic[] }): ServerResponseDTO[] {
    return servers.map((server) => ServerResponseDTO.fromEntity({ server }))
  }
}
