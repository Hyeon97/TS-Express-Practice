import { serverDBResponse, SystemModeLabels, OSTypeLables } from "../../types/server/server"
import { formatDiskSize } from "../../utils/data-convert.util"
import { DiskInfoDTO } from "./server.disk.dto"
import { NetworkInfoDTO } from "./server.network.dto"
import { PartitionInfoDTO } from "./server.partition.dto"

// 기본 필드 매핑 정의
export type BaseServerResponseFields = {
  systemName: string
  systemMode: string
  os: string
  version: string
  ip: string
  status: string
  licenseID: string | number
  lastUpdated: string
  diskInfo?: DiskInfoDTO[]
  networkInfo?: NetworkInfoDTO[]
  partitionInfo?: PartitionInfoDTO[]
  repositoryInfo?: any[]
}

// 상세 필드 추가 정의
export type DetailServerResponseFields = BaseServerResponseFields & {
  agent: string
  model: string
  manufacturer: string
  cpu: string
  cpuCount: string
  memory: string
}

// 기본값 상수
const DEFAULT_VALUES = {
  systemName: "",
  systemMode: "Unknown",
  agent: "",
  model: "",
  manufacturer: "",
  os: "Unknown",
  version: "Unknown",
  ip: "-",
  cpu: "",
  cpuCount: "0",
  memory: "",
  status: "Unknown",
  licenseID: "Unassigned",
  lastUpdated: "",
  diskInfo: [] as DiskInfoDTO[],
  networkInfo: [] as NetworkInfoDTO[],
  partitionInfo: [] as PartitionInfoDTO[],
  repositoryInfo: [] as any[],
}

// 기본 서버 응답 DTO
export class BaseServerResponseDTO implements BaseServerResponseFields {
  systemName: string
  systemMode: string
  os: string
  version: string
  ip: string
  status: string
  licenseID: string | number
  lastUpdated: string
  diskInfo?: DiskInfoDTO[]
  networkInfo?: NetworkInfoDTO[]
  partitionInfo?: PartitionInfoDTO[]
  repositoryInfo?: any[]

  constructor({
    systemName = DEFAULT_VALUES.systemName,
    systemMode = DEFAULT_VALUES.systemMode,
    os = DEFAULT_VALUES.os,
    version = DEFAULT_VALUES.version,
    ip = DEFAULT_VALUES.ip,
    status = DEFAULT_VALUES.status,
    licenseID = DEFAULT_VALUES.licenseID,
    lastUpdated = DEFAULT_VALUES.lastUpdated,
    diskInfo,
    networkInfo,
    partitionInfo,
    repositoryInfo,
  }: Partial<BaseServerResponseFields> = {}) {
    this.systemName = systemName
    this.systemMode = systemMode
    this.os = os
    this.version = version
    this.ip = ip
    this.status = status
    this.licenseID = licenseID
    this.lastUpdated = lastUpdated

    // 비어있지 않은 배열만 포함
    if (diskInfo && diskInfo.length > 0) {
      this.diskInfo = diskInfo
    }

    if (networkInfo && networkInfo.length > 0) {
      this.networkInfo = networkInfo
    }

    if (partitionInfo && partitionInfo.length > 0) {
      this.partitionInfo = partitionInfo
    }

    if (repositoryInfo && repositoryInfo.length > 0) {
      this.repositoryInfo = repositoryInfo
    }
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      systemName: this.systemName,
      systemMode: this.systemMode,
      os: this.os,
      version: this.version,
      ip: this.ip,
      status: this.status,
      licenseID: this.licenseID,
      lastUpdated: this.lastUpdated,
    }

    // 비어있지 않은 배열만 JSON 객체에 추가
    if (this.diskInfo && this.diskInfo.length > 0) {
      json.diskInfo = this.diskInfo
    }

    if (this.networkInfo && this.networkInfo.length > 0) {
      json.networkInfo = this.networkInfo
    }

    if (this.partitionInfo && this.partitionInfo.length > 0) {
      json.partitionInfo = this.partitionInfo
    }

    if (this.repositoryInfo && this.repositoryInfo.length > 0) {
      json.repositoryInfo = this.repositoryInfo
    }

    return json
  }

  /**
   * 엔티티에서 기본 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ serverData }: { serverData: serverDBResponse }): BaseServerResponseDTO {
    const { server, disk, network, partition, repository } = serverData

    const diskInfo = disk && disk.length > 0 ? DiskInfoDTO.fromEntities(disk) : undefined
    const networkInfo = network && network.length > 0 ? NetworkInfoDTO.fromEntities(network) : undefined
    const partitionInfo = partition && partition.length > 0 ? PartitionInfoDTO.fromEntities(partition) : undefined
    const repositoryInfo = repository && repository.length > 0 ? repository : undefined

    return new BaseServerResponseDTO({
      systemName: server.sSystemName,
      systemMode: SystemModeLabels[server.nSystemMode],
      os: OSTypeLables[server.nOS],
      version: server.sOSVersion,
      ip: server.sIPAddress,
      status: server.sStatus,
      licenseID: server.nLicenseID === 0 ? DEFAULT_VALUES.licenseID : server.nLicenseID,
      lastUpdated: server.sLastUpdateTime,
      diskInfo,
      networkInfo,
      partitionInfo,
      repositoryInfo,
    })
  }

  /**
   * 엔티티 배열에서 기본 DTO 배열로 변환
   */
  static fromEntities({ serversData }: { serversData: serverDBResponse[] }): BaseServerResponseDTO[] {
    return serversData.map((serverData) => BaseServerResponseDTO.fromEntity({ serverData }))
  }
}

// 상세 서버 응답 DTO (기본 DTO 상속)
export class DetailServerResponseDTO extends BaseServerResponseDTO implements DetailServerResponseFields {
  agent: string
  model: string
  manufacturer: string
  cpu: string
  cpuCount: string
  memory: string

  constructor(props: Partial<DetailServerResponseFields>) {
    super(props) // 기본 속성 초기화

    // 상세 속성 초기화
    this.agent = props.agent || DEFAULT_VALUES.agent
    this.model = props.model || DEFAULT_VALUES.model
    this.manufacturer = props.manufacturer || DEFAULT_VALUES.manufacturer
    this.cpu = props.cpu || DEFAULT_VALUES.cpu
    this.cpuCount = props.cpuCount || DEFAULT_VALUES.cpuCount
    this.memory = props.memory || DEFAULT_VALUES.memory
    if (this.memory) {
      this.memory = `${this.memory} (${formatDiskSize(this.memory)})`
    }
  }

  /**
   * JSON 직렬화를 위한 메서드 (오버라이드)
   */
  toJSON(): Record<string, any> {
    // 기본 JSON을 상속받아 확장
    const json = super.toJSON()

    // 상세 필드 추가
    json.agent = this.agent
    json.model = this.model
    json.manufacturer = this.manufacturer
    json.cpu = this.cpu
    json.cpuCount = this.cpuCount
    json.memory = this.memory

    return json
  }

  /**
   * 엔티티에서 상세 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ serverData }: { serverData: serverDBResponse }): DetailServerResponseDTO {
    const { server, disk, network, partition, repository } = serverData

    const diskInfo = disk && disk.length > 0 ? DiskInfoDTO.fromEntities(disk) : undefined
    const networkInfo = network && network.length > 0 ? NetworkInfoDTO.fromEntities(network) : undefined
    const partitionInfo = partition && partition.length > 0 ? PartitionInfoDTO.fromEntities(partition) : undefined
    const repositoryInfo = repository && repository.length > 0 ? repository : undefined

    return new DetailServerResponseDTO({
      systemName: server.sSystemName,
      systemMode: SystemModeLabels[server.nSystemMode],
      agent: server.sAgentVersion,
      model: server.sModel,
      manufacturer: server.sManufacturer,
      os: OSTypeLables[server.nOS],
      version: server.sOSVersion,
      ip: server.sIPAddress,
      cpu: server.sCPUName,
      cpuCount: server.sNumberOfProcessors,
      memory: server.sTotalPhysicalMemory,
      status: server.sStatus,
      licenseID: server.nLicenseID === 0 ? DEFAULT_VALUES.licenseID : server.nLicenseID,
      lastUpdated: server.sLastUpdateTime,
      diskInfo,
      networkInfo,
      partitionInfo,
      repositoryInfo,
    })
  }

  /**
   * 엔티티 배열에서 상세 DTO 배열로 변환
   */
  static fromEntities({ serversData }: { serversData: serverDBResponse[] }): DetailServerResponseDTO[] {
    return serversData.map((serverData) => DetailServerResponseDTO.fromEntity({ serverData }))
  }
}

// 응답 생성을 위한 팩토리 메서드
export class ServerResponseDTOFactory {
  static createFromEntity({
    detail,
    serverData,
  }: {
    detail: boolean
    serverData: serverDBResponse
  }): BaseServerResponseDTO | DetailServerResponseDTO {
    return detail ? DetailServerResponseDTO.fromEntity({ serverData }) : BaseServerResponseDTO.fromEntity({ serverData })
  }

  static createFromEntities({
    detail,
    serversData,
  }: {
    detail: boolean
    serversData: serverDBResponse[]
  }): (BaseServerResponseDTO | DetailServerResponseDTO)[] {
    return detail ? DetailServerResponseDTO.fromEntities({ serversData }) : BaseServerResponseDTO.fromEntities({ serversData })
  }
}
