import { VALID_OS_VALUES, VALID_STATE_VALUES, VALID_LICENSE_VALUES } from "./common"

//  server 연결 상태 정의
export type StateType = "connect" | "disconnect"

//  시스템 모드 정의
enum SystemMode {
  SOURCE = 1,
  TARGET = 2,
  RECOVERY = 3,
  VSM = 10,
}

//  디스크 타입 정의
enum DiskType {
  BIOS = 0,
  GPT = 1,
}

//  OS 타입
export type OsType = "win" | "lin"
enum OSType {
  WINDOW = 1,
  LINUX = 2,
  CLOUD = 3,
}

//  저장소 타입 정의
enum ServerRepositoryType {
  SOURCE = 1,
  TARGET = 2,
  VSM = 10,
  NETWORK = 20,
  CLOUD = 30,
  UNKNOWN = 99,
}

//  시스템 모드 변환
export const SystemModeLabels: Record<SystemMode, string> = {
  [SystemMode.SOURCE]: "Source",
  [SystemMode.TARGET]: "Target",
  [SystemMode.RECOVERY]: "Recovery",
  [SystemMode.VSM]: "VSM",
}

//  디스크 타입 변환
export const DiskTypeLabels: Record<DiskType, string> = {
  [DiskType.BIOS]: "Bios",
  [DiskType.GPT]: "Gpt",
}

//  OS 타입 변환
export const OSTypeLables: Record<OSType, string> = {
  [OSType.WINDOW]: "Window",
  [OSType.LINUX]: "Linux",
  [OSType.CLOUD]: "Cloud",
}

//  server 저장소 타입 변환
export const ServerRepositoryTypeLables: Record<ServerRepositoryType, string> = {
  [ServerRepositoryType.SOURCE]: "Source",
  [ServerRepositoryType.TARGET]: "Target",
  [ServerRepositoryType.VSM]: "VSM",
  [ServerRepositoryType.NETWORK]: "Network",
  [ServerRepositoryType.CLOUD]: "Cloud Storage",
  [ServerRepositoryType.UNKNOWN]: "Unknwon",
}

//  server data 필터링 옵션
export interface ServerFilterOptions {
  os?: (typeof VALID_OS_VALUES)[number] | ""
  network?: boolean
  disk?: boolean
  partition?: boolean
  repository?: boolean
  state?: (typeof VALID_STATE_VALUES)[number] | ""
  license?: (typeof VALID_LICENSE_VALUES)[number] | ""
}

//  server_basic table 데이터 구조 정의
export interface ServerBasic {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sSystemNameDisplay: string
  nSystemMode: SystemMode //  시스템 등록 모드(1:source, 2:target, 3:recovery, 10:vsm)
  nCSMType: number //  CSM서버 타입(0:Onpremise, 1:AWS, 2:Azure, 3:OpenStack, 4:CloudStack, 5:VMware, 6:HyperV, 7:KVM)
  sAgentVersion: string
  nOS: OSType
  sOSVersion: string
  sIPAddress: string
  sPrivateIPAddress: string
  sModel: string
  sOrganization: string
  sManufacturer: string
  sSystemType: string
  sCPUName: string
  sNumberOfProcessors: string
  sTotalPhysicalMemory: string
  nNetworkID: number
  sKernelVersion: string
  sStatus: string
  sLastUpdateTime: string
  nFlags: number
  sOriginSystemName: string
  nLicenseID: number
}

//  서버 조회 결과 리턴 타입
export interface serverDBResponse {
  server: ServerBasic
  disk?: ServerDisk[]
  partition?: ServerPartition[]
  network?: ServerNetwork[]
  repository?: ServerRepository[]
}

//  server_disk table 데이터 구조 정의
export interface ServerDisk {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nDiskType: DiskType //  디스크 타입(0:bios, 1:gpt)
  nDiskNum: number
  sDiskSize: string
  sDiskCaption: string
  sDevice: string
  sProduct: string
  sVender: string
  sLastUpdateTime: string
  nFlags: number
}

//  server_network table 데이터 구조 정의
export interface ServerNetwork {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sNetworkName: string
  sIPAddress: string
  sSubnet: string
  sGateway: string
  sMacaddress: string
  sLastUpdateTime: string
  nFlags: number
}

//  server_partition table 데이터 구조 정의
export interface ServerPartition {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nDiskNum: number
  nPartitionNum: number
  nPartSize: number //  단위: byte
  nPartUsed: number //  단위: byte
  nPartFree: number //  단위: byte
  sLetter: string
  sCaption: string //  윈도우 전용
  sDevice: string //  리눅스 전용
  sFileSystem: string
  sFlag: string
  sLastUpdateTime: string
  nFlags: number
}

//  server_repository table 데이터 구조 정의
export interface ServerRepository {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nOS: OSType //  운영체제 종류(1: Windows, 2:Linux, 3:cloud)
  nType: ServerRepositoryType //  저장소 타입(1: 소스서버, 2:타겟서버, 10:VSM서버, 20: Network, 30: Cloud Storage, 99: 알수없음)
  nUsedSize: number //   단위: byte
  nFreeSize: number //   단위: byte
  sLocalPath: string
  sRemotePath: string
  sRemoteUser: string
  sRemotePwd: string
  sRemoteDomain: string
  sIPAddress: string
  sZConverterIPAddress: string
  nZConverterPort: number
  sCloudConnectInfo: string
  sLastUpdateTime: string
  nFlags: number
}
