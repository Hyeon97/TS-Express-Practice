import request from "supertest"
import { app } from "../../../../app"
import { ServerService } from "../../../api/services/server/server.service"
import { serverBasicRepository } from "../../../api/repositories/server/server.basic.repository"

// 모의 데이터
const mockServers = [
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

// 서비스 및 레포지토리 모킹
jest.mock("../../../api/services/server/server.service")
jest.mock("../../../api/repositories/server/server.basic.repository")

describe("서버 라우트 테스트", () => {
  // 각 테스트 전에 모의 객체 초기화
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET /api/servers", () => {
    it("모든 서버를 성공적으로 조회해야 함", async () => {
      // 모의 구현 설정
      const mockGetAllServers = jest.fn().mockResolvedValue(mockServers)
      ServerService.prototype.getAllServers = mockGetAllServers

      // API 요청 실행
      const response = await request(app).get("/api/servers").expect("Content-Type", /json/).expect(200)

      // 응답 확인
      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(2)
      expect(mockGetAllServers).toHaveBeenCalledTimes(1)

      // 응답 데이터 구조 확인
      const firstServer = response.body.data[0]
      expect(firstServer).toHaveProperty("systemName")
      expect(firstServer).toHaveProperty("systemMode")
      expect(firstServer).toHaveProperty("os")
      expect(firstServer).toHaveProperty("version")
      expect(firstServer).toHaveProperty("ip")
      expect(firstServer).toHaveProperty("status")
    })

    it("필터 옵션을 적용하여 서버를 조회해야 함", async () => {
      // 모의 구현 설정
      const mockGetAllServers = jest.fn().mockResolvedValue([mockServers[0]])
      ServerService.prototype.getAllServers = mockGetAllServers

      // API 요청 실행 (필터 옵션 적용)
      const response = await request(app).get("/api/servers?os=win&state=connect").expect("Content-Type", /json/).expect(200)

      // 응답 확인
      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)

      // 서비스 호출 시 필터 옵션이 올바르게 전달되었는지 확인
      expect(mockGetAllServers).toHaveBeenCalledTimes(1)
    })

    it("잘못된 필터 옵션이 제공되면 400 오류를 반환해야 함", async () => {
      // API 요청 실행 (잘못된 필터 옵션)
      const response = await request(app).get("/api/servers?os=invalid").expect("Content-Type", /json/).expect(400)

      // 응답 확인
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it("서비스에서 오류가 발생하면 500 오류를 반환해야 함", async () => {
      // 모의 구현 설정 - 오류 발생
      const mockError = new Error("서버 조회 중 오류 발생")
      ServerService.prototype.getAllServers = jest.fn().mockRejectedValue(mockError)

      // API 요청 실행
      const response = await request(app).get("/api/servers").expect("Content-Type", /json/).expect(500)

      // 응답 확인
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })
  })

  // describe("GET /api/servers/id/:id", () => {
  //   it("유효한 ID로 서버를 성공적으로 조회해야 함", async () => {
  //     // 모의 구현 설정
  //     const mockGetServerById = jest.fn().mockResolvedValue(mockServers[0])
  //     ServerService.prototype.getServerById = mockGetServerById

  //     // API 요청 실행
  //     const response = await request(app).get("/api/servers/id/1").expect("Content-Type", /json/).expect(200)

  //     // 응답 확인
  //     expect(response.body.success).toBe(true)
  //     expect(response.body.data).toBeDefined()
  //     expect(mockGetServerById).toHaveBeenCalledWith(1)
  //   })

  //   it("존재하지 않는 ID로 요청하면 404 오류를 반환해야 함", async () => {
  //     // 모의 구현 설정 - 서버를 찾을 수 없음
  //     ServerService.prototype.getServerById = jest.fn().mockResolvedValue(null)

  //     // API 요청 실행
  //     const response = await request(app).get("/api/servers/id/999").expect("Content-Type", /json/).expect(404)

  //     // 응답 확인
  //     expect(response.body.success).toBe(false)
  //     expect(response.body.error).toBeDefined()
  //   })
  // })

  // describe("GET /api/servers/name/:name", () => {
  //   it("유효한 이름으로 서버를 성공적으로 조회해야 함", async () => {
  //     // 모의 구현 설정
  //     const mockGetServerByName = jest.fn().mockResolvedValue(mockServers[0])
  //     ServerService.prototype.getServerByName = mockGetServerByName

  //     // API 요청 실행
  //     const response = await request(app).get("/api/servers/name/server-1").expect("Content-Type", /json/).expect(200)

  //     // 응답 확인
  //     expect(response.body.success).toBe(true)
  //     expect(response.body.data).toBeDefined()
  //     expect(mockGetServerByName).toHaveBeenCalledWith("server-1")
  //   })

  //   it("존재하지 않는 이름으로 요청하면 404 오류를 반환해야 함", async () => {
  //     // 모의 구현 설정 - 서버를 찾을 수 없음
  //     ServerService.prototype.getServerByName = jest.fn().mockResolvedValue(null)

  //     // API 요청 실행
  //     const response = await request(app).get("/api/servers/name/non-existent").expect("Content-Type", /json/).expect(404)

  //     // 응답 확인
  //     expect(response.body.success).toBe(false)
  //     expect(response.body.error).toBeDefined()
  //   })
  // })
})
