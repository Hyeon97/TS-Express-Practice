import request from "supertest"

import { testConnection } from "../../db/connection"
import { serverBasicRepository } from "../../api/repositories/server/server.basic.repository"
import { app } from "../../../app"

// 테스트 데이터
const testServer = {
  nID: 1,
  nUserID: 1,
  nGroupID: 1,
  nCenterID: 1,
  sSystemName: "test-server",
  sSystemNameDisplay: "Test Server",
  nSystemMode: 1,
  nCSMType: 0,
  sAgentVersion: "1.0.0",
  nOS: 1,
  sOSVersion: "10",
  sIPAddress: "192.168.1.10",
  sPrivateIPAddress: "10.0.0.10",
  sModel: "Test Model",
  sOrganization: "Test Org",
  sManufacturer: "Test Manufacturer",
  sSystemType: "Test",
  sCPUName: "Test CPU",
  sNumberOfProcessors: "4",
  sTotalPhysicalMemory: "8GB",
  nNetworkID: 1,
  sKernelVersion: "1.0",
  sStatus: "Online",
  sLastUpdateTime: new Date().toISOString(),
  nFlags: 0,
  sOriginSystemName: "test-server-origin",
  nLicenseID: 12345,
}

// 전체 테스트 스위트 관련 설정
describe("서버 API 통합 테스트", () => {
  // 모든 테스트 전에 실행
  beforeAll(async () => {
    // 데이터베이스 연결 확인
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error("데이터베이스 연결 실패")
      process.exit(1)
    }

    // 테스트 데이터 준비 (실제 DB에 테스트 데이터 추가)
    // 주의: 여기서는 모킹하지만, 실제 통합 테스트에서는 DB에 직접 데이터를 넣고 테스트
    jest.spyOn(serverBasicRepository, "findAll").mockResolvedValue([testServer])
  })

  // 모든 테스트 후에 실행
  afterAll(async () => {
    // 테스트 데이터 정리 (실제 DB에서 테스트 데이터 삭제)
    jest.restoreAllMocks()
  })

  describe("GET /api/servers", () => {
    it("서버 목록을 성공적으로 반환해야 함", async () => {
      const response = await request(app).get("/api/servers").expect("Content-Type", /json/).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBeGreaterThan(0)

      // 반환된 데이터 구조 확인
      const server = response.body.data[0]
      expect(server).toHaveProperty("systemName")
      expect(server).toHaveProperty("systemMode")
      expect(server).toHaveProperty("os")
      expect(server).toHaveProperty("ip")
      expect(server).toHaveProperty("status")
    })
  })

  // describe("GET /api/servers/id/:id", () => {
  //   it("ID로 서버를 성공적으로 조회해야 함", async () => {
  //     // 테스트 ID
  //     const testId = 1

  //     // ServerService.getServerById 메서드를 모킹하여 특정 ID에 대한 응답 설정
  //     jest.spyOn(serverBasicRepository, "findById").mockResolvedValue(testServer)

  //     const response = await request(app).get(`/api/servers/id/${testId}`).expect("Content-Type", /json/).expect(200)

  //     expect(response.body.success).toBe(true)
  //     expect(response.body.data).toBeDefined()
  //     expect(response.body.data.systemName).toBe(testServer.sSystemName)
  //   })

  //   it("존재하지 않는 ID로 요청 시 404를 반환해야 함", async () => {
  //     // 존재하지 않는 ID
  //     const nonExistentId = 999

  //     // ServerService.getServerById 메서드를 모킹하여 null 반환
  //     jest.spyOn(serverBasicRepository, "findById").mockResolvedValue(null)

  //     await request(app).get(`/api/servers/id/${nonExistentId}`).expect("Content-Type", /json/).expect(404)
  //   })
  // })

  // describe("필터 옵션 테스트", () => {
  //   it("OS 필터로 서버를 조회해야 함", async () => {
  //     // Windows OS 필터
  //     const response = await request(app).get("/api/servers?os=win").expect("Content-Type", /json/).expect(200)

  //     expect(response.body.success).toBe(true)

  //     // 필터링이 실제로 백엔드에서 수행되는지 테스트하려면
  //     // 여기에 필터링된 결과에 대한 추가 검증을 구현
  //   })

  //   it("여러 필터 조합으로 서버를 조회해야 함", async () => {
  //     // 여러 필터 조합
  //     const response = await request(app).get("/api/servers?os=win&state=connect&network=true").expect("Content-Type", /json/).expect(200)

  //     expect(response.body.success).toBe(true)
  //   })

  //   it("잘못된 필터 값으로 요청 시 400을 반환해야 함", async () => {
  //     // 잘못된 OS 값
  //     await request(app).get("/api/servers?os=invalid").expect("Content-Type", /json/).expect(400)
  //   })
  // })
})
