import * as connection from "../../db/connection"

/**
 * 데이터베이스 모킹 유틸리티
 * 테스트에서 데이터베이스 연결 및 쿼리를 모킹하기 위한 함수들을 제공합니다.
 */
export class DBMockUtils {
  /**
   * executeQuery 함수를 모킹하여 지정된 응답을 반환하도록 합니다.
   * @param mockResponse 모의 응답 데이터
   * @returns jest 모의 함수
   */
  static mockExecuteQuery<T>(mockResponse: T[]) {
    return jest.spyOn(connection, "executeQuery").mockResolvedValue(mockResponse)
  }

  /**
   * executeQuerySingle 함수를 모킹하여 지정된 응답을 반환하도록 합니다.
   * @param mockResponse 모의 응답 데이터 (단일 객체 또는 null)
   * @returns jest 모의 함수
   */
  static mockExecuteQuerySingle<T>(mockResponse: T | null) {
    return jest.spyOn(connection, "executeQuerySingle").mockResolvedValue(mockResponse)
  }

  /**
   * withTransaction 함수를 모킹하여 콜백의 결과를 그대로 반환하도록 합니다.
   * @returns jest 모의 함수
   */
  static mockWithTransaction() {
    return jest.spyOn(connection, "withTransaction").mockImplementation(async ({ callback }) => {
      // 임시 연결 객체
      const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        execute: jest.fn(),
        release: jest.fn(),
      }

      // 콜백 실행 및 결과 반환
      return await callback(mockConnection as any)
    })
  }

  /**
   * testConnection 함수를 모킹하여 연결 성공을 시뮬레이션합니다.
   * @param success 연결 성공 여부
   * @returns jest 모의 함수
   */
  static mockTestConnection(success: boolean = true) {
    return jest.spyOn(connection, "testConnection").mockResolvedValue(success)
  }

  /**
   * 모든 데이터베이스 관련 모킹을 초기화합니다.
   */
  static resetAllMocks() {
    jest.restoreAllMocks()
  }
}
