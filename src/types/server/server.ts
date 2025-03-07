import { VALID_OS_VALUES, VALID_STATE_VALUES, VALID_LICENSE_VALUES } from "../common"
import { ServerBasic, ServerDisk, ServerPartition, ServerNetwork, ServerRepository } from "./server.db"

//  server 연결 상태 정의
export type StateType = "connect" | "disconnect"

//  시스템 모드 정의
export enum SystemMode {
  SOURCE = 1,
  TARGET = 2,
  RECOVERY = 3,
  VSM = 10,
}

//  디스크 타입 정의
export enum DiskType {
  BIOS = 0,
  GPT = 1,
}

//  OS 타입
export type OsType = "win" | "lin"
export enum OSType {
  WINDOW = 1,
  LINUX = 2,
  CLOUD = 3,
}

//  저장소 타입 정의
export enum ServerRepositoryType {
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

//  server data 요청 필터링 옵션
export interface ServerFilterOptions {
  os?: (typeof VALID_OS_VALUES)[number] | ""
  network?: boolean
  disk?: boolean
  partition?: boolean
  repository?: boolean
  state?: (typeof VALID_STATE_VALUES)[number] | ""
  license?: (typeof VALID_LICENSE_VALUES)[number] | ""
}

//  서버 조회 결과 리턴 타입
export interface serverDBResponse {
  server: ServerBasic
  disk?: ServerDisk[]
  partition?: ServerPartition[]
  network?: ServerNetwork[]
  repository?: ServerRepository[]
}
