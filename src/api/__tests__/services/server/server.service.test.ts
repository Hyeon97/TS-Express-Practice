import { ApiError } from "../../../../errors/api-error"
import { serverBasicRepository } from "../../../../api/repositories/server/server.basic.repository"
import { ServerService } from "../../../../api/services/server/server.service"
import { ServerBasic } from "../../../../types/server"

// 서버 레포지토리 모킹
jest.mock("../../../../api/repositories/server/server.basic.repository")

// 모의 데이터
const mockServers: ServerBasic[] = [
  {
    nID: 1,
    nUserID: 1,
    nGroupID: 1,
    nCenterID: 1,
    sSystemName: "server-1",
    sSystemNameDisplay: "Server 1",
    nSystemMode: 1, // 시스템 모드: Source
    nCSMType: 0,
    sAgentVersion: "1.0.0",
    nOS: 1, // OS 타입: Windows
    sOSVersion: "10",
    sIPAddress: "192.168.1.1",
    sPrivateIPAddress: "10.0.0.1",
    sModel: "Model X",
    sOrganization: "Test Org",
    sManufacturer: "Test Manufacturer",
    sSystemType: "Physical",
    sCPUName: "Intel i7",
    sNumberOfProcessors: "8",
    sTotalPhysicalMemory: "16GB",
    nNetworkID: 1,
    sKernelVersion: "1.0",
    sStatus: "Online",
    sLastUpdateTime: "2023-01-01T00:00:00Z",
    nFlags: 0,
    sOriginSystemName: "server-1-origin",
    nLicenseID: 12345,
  },
  {
    nID: 2,
    nUserID: 1,
    nGroupID: 1,
    nCenterID: 1,
    sSystemName: "server-2",
    sSystemNameDisplay: "Server 2",
    nSystemMode: 2, // 시스템 모드: Target
    nCSMType: 0,
    sAgentVersion: "1.0.0",
    nOS: 2, // OS 타입: Linux
    sOSVersion: "Ubuntu 20.04",
    sIPAddress: "192.168.1.2",
    sPrivateIPAddress: "10.0.0.2",
    sModel: "Model Y",
    sOrganization: "Test Org",
    sManufacturer: "Test Manufacturer",
    sSystemType: "Virtual",
    sCPUName: "AMD Ryzen",
    sNumberOfProcessors: "16",
    sTotalPhysicalMemory: "32GB",
    nNetworkID: 2,
    sKernelVersion: "5.4",
    sStatus: "Online",
    sLastUpdateTime: "2023-01-02T00:00:00Z",
    nFlags: 0,
    sOriginSystemName: "server-2-origin",
    nLicenseID: 67890,
  },
]

describe("ServerService 테스트", () => {
  // 테스트 인스턴스
  let serverService: ServerService

  // 각 테스트 전에 모의 객체 초기화
  beforeEach(() => {
    jest.clearAllMocks()
    serverService = new ServerService()
  })

  describe("getAllServers 메서드", () => {
    it("모든 서버를 성공적으로 반환해야 함", async () => {
      // 모의 구현 설정
      const mockFindAll = jest.fn().mockResolvedValue(mockServers)
      serverBasicRepository.findAll = mockFindAll

      // 메서드 호출
      const result = await serverService.getAllServers()

      // 결과 검증
      expect(result).toEqual(mockServers)
      expect(mockFindAll).toHaveBeenCalledTimes(1)
    })

    it("레포지토리 오류 발생 시 ApiError를 throw해야 함", async () => {
      // 모의 구현 설정 - 오류 발생
      const mockError = new Error("데이터베이스 오류")
      serverBasicRepository.findAll = jest.fn().mockRejectedValue(mockError)

      // 메서드 호출 및 예외 확인
      await expect(serverService.getAllServers()).rejects.toThrow(ApiError)
      expect(serverBasicRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  // // getServerById 메서드 구현이 필요할 경우 추가
  // describe("getServerById 메서드", () => {
  //   it("ID로 서버를 성공적으로 조회해야 함", async () => {
  //     // 필요한 메서드 구현
  //     ServerService.prototype.getServerById = jest.fn().mockImplementation(async (id: number) => {
  //       const server = mockServers.find((s) => s.nID === id)
  //       if (!server) return null
  //       return server
  //     })

  //     // 테스트
  //     const result = await serverService.getServerById(1)
  //     expect(result).toEqual(mockServers[0])
  //   })

  //   it("존재하지 않는 ID로 조회 시 null을 반환해야 함", async () => {
  //     // 필요한 메서드 구현
  //     ServerService.prototype.getServerById = jest.fn().mockImplementation(async (id: number) => {
  //       const server = mockServers.find((s) => s.nID === id)
  //       if (!server) return null
  //       return server
  //     })

  //     // 테스트
  //     const result = await serverService.getServerById(999)
  //     expect(result).toBeNull()
  //   })
  // })

  // // getServerByName 메서드 구현이 필요할 경우 추가
  // describe("getServerByName 메서드", () => {
  //   it("이름으로 서버를 성공적으로 조회해야 함", async () => {
  //     // 필요한 메서드 구현
  //     ServerService.prototype.getServerByName = jest.fn().mockImplementation(async (name: string) => {
  //       const server = mockServers.find((s) => s.sSystemName === name)
  //       if (!server) return null
  //       return server
  //     })

  //     // 테스트
  //     const result = await serverService.getServerByName("server-1")
  //     expect(result).toEqual(mockServers[0])
  //   })

  //   it("존재하지 않는 이름으로 조회 시 null을 반환해야 함", async () => {
  //     // 필요한 메서드 구현
  //     ServerService.prototype.getServerByName = jest.fn().mockImplementation(async (name: string) => {
  //       const server = mockServers.find((s) => s.sSystemName === name)
  //       if (!server) return null
  //       return server
  //     })

  //     // 테스트
  //     const result = await serverService.getServerByName("non-existent")
  //     expect(result).toBeNull()
  //   })
  // })
})
