import { serverBasicRepository } from "../../../../api/repositories/server/server.basic.repository"
import * as connection from "../../../../db/connection"

// connection 모듈 모킹
jest.mock("../../../../db/connection")

describe("ServerBasicRepository 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("findAll 메서드", () => {
    it("모든 서버를 성공적으로 가져와야 함", async () => {
      // 모의 데이터
      const mockServers = [
        {
          nID: 1,
          sSystemName: "server-1",
          nSystemMode: 1,
          nOS: 1,
          sOSVersion: "10",
          sIPAddress: "192.168.1.1",
          sStatus: "Online",
          nLicenseID: 12345,
        },
        {
          nID: 2,
          sSystemName: "server-2",
          nSystemMode: 2,
          nOS: 2,
          sOSVersion: "Ubuntu 20.04",
          sIPAddress: "192.168.1.2",
          sStatus: "Online",
          nLicenseID: 67890,
        },
      ]

      // executeQuery 모의 구현
      const mockedExecuteQuery = jest.fn().mockResolvedValue(mockServers)
      jest.spyOn(connection, "executeQuery").mockImplementation(mockedExecuteQuery)

      // 메서드 호출
      const result = await serverBasicRepository.findAll()

      // 결과 검증
      expect(result).toEqual(mockServers)
      expect(mockedExecuteQuery).toHaveBeenCalledTimes(1)
      expect(mockedExecuteQuery).toHaveBeenCalledWith({
        sql: expect.stringContaining("SELECT * FROM server_basic"),
      })
    })

    it("데이터베이스 오류 발생 시 예외를 전파해야 함", async () => {
      // executeQuery 모의 구현 - 오류 발생
      const dbError = new Error("데이터베이스 연결 오류")
      jest.spyOn(connection, "executeQuery").mockRejectedValue(dbError)

      // 메서드 호출 및 예외 확인
      await expect(serverBasicRepository.findAll()).rejects.toThrow(dbError)
    })
  })

  // ServerBasicRepository에 추가 메서드가 있다면 해당 메서드에 대한 테스트도 작성 가능
})
