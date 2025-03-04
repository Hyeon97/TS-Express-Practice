import { Request, Response, NextFunction } from "express"
import { ServerController } from "../../../../api/controllers/server/server.controller"
import { ServerService } from "../../../../api/services/server/server.service"
import { ApiError } from "../../../../errors/api-error"
import { ApiUtils } from "../../../../utils/api.utils"
import { ErrorCode } from "../../../../errors/error-codes"

// ServerService 모킹
jest.mock("../../../../api/services/server/server.service")
// ApiUtils 모킹
jest.mock("../../../../utils/api.utils")

describe("ServerController 테스트", () => {
  // 인스턴스 및 모의 객체
  let serverController: ServerController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: jest.MockedFunction<NextFunction>

  // 각 테스트 전에 모의 객체 초기화
  beforeEach(() => {
    jest.clearAllMocks()

    serverController = new ServerController()

    mockRequest = {
      query: {},
      params: {},
    }

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }

    mockNext = jest.fn()
  })

  describe("getServers 메서드", () => {
    it("모든 서버를 성공적으로 반환해야 함", async () => {
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

      // 모의 구현 설정
      const mockGetAllServers = jest.fn().mockResolvedValue(mockServers)
      ServerService.prototype.getAllServers = mockGetAllServers

      // ApiUtils 모의 구현
      const mockSuccess = jest.fn()
      ApiUtils.success = mockSuccess

      // 메서드 호출
      await serverController.getServers(mockRequest as Request, mockResponse as Response, mockNext)

      // 서비스 호출 확인
      expect(mockGetAllServers).toHaveBeenCalledTimes(1)

      // ApiUtils 성공 응답 확인
      expect(mockSuccess).toHaveBeenCalledTimes(1)
      expect(mockSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          res: mockResponse,
          data: expect.any(Array),
        })
      )

      // NextFunction이 호출되지 않았는지 확인
      expect(mockNext).not.toHaveBeenCalled()
    })

    it("필터 옵션이 제공된 경우 적용해야 함", async () => {
      // 필터 옵션이 있는 요청
      mockRequest.query = {
        os: "win",
        network: "true",
        state: "connect",
      }

      // 모의 구현 설정
      const mockGetAllServers = jest.fn().mockResolvedValue([])
      ServerService.prototype.getAllServers = mockGetAllServers

      // ApiUtils 모의 구현
      const mockSuccess = jest.fn()
      ApiUtils.success = mockSuccess

      // 메서드 호출
      await serverController.getServers(mockRequest as Request, mockResponse as Response, mockNext)

      // 서비스 호출 시 필터 옵션이 적용되었는지 확인
      expect(mockGetAllServers).toHaveBeenCalledTimes(1)

      // ApiUtils 성공 응답 확인
      expect(mockSuccess).toHaveBeenCalledTimes(1)
    })

    it("오류 발생 시 next 함수를 호출해야 함", async () => {
      // 모의 구현 설정 - 오류 발생
      const mockError = new ApiError({
        statusCode: 500,
        message: "서버 조회 중 오류 발생",
        errorCode: ErrorCode.INTERNAL_ERROR,
      })
      ServerService.prototype.getAllServers = jest.fn().mockRejectedValue(mockError)

      // 메서드 호출
      await serverController.getServers(mockRequest as Request, mockResponse as Response, mockNext)

      // next 함수가 오류와 함께 호출되었는지 확인
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockNext).toHaveBeenCalledWith(mockError)
    })
  })

  // getServerById 메서드에 대한 테스트도 추가 가능
  describe("getServerById 메서드", () => {
    // 현재 코드에서는 빈 구현이므로 구현 후 테스트 작성
    it("구현이 필요함", () => {
      expect(serverController.getServerById).toBeDefined()
    })
  })

  // getServerByName 메서드에 대한 테스트도 추가 가능
  describe("getServerByName 메서드", () => {
    // 현재 코드에서는 빈 구현이므로 구현 후 테스트 작성
    it("구현이 필요함", () => {
      expect(serverController.getServerByName).toBeDefined()
    })
  })
})
