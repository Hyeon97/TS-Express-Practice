// Jest 셋업 파일

// 환경 변수 설정
process.env.NODE_ENV = "test"
process.env.PORT = "4000"
process.env.API_PREFIX = "/api"
process.env.LOG_LEVEL = "error" // 테스트 중 로그 레벨 축소

// 로거 모킹
jest.mock("./src/utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  stream: {
    write: jest.fn(),
  },
  morganMiddleware: jest.fn().mockImplementation((req, res, next) => next()),
}))

// 테스트 타임아웃 설정
jest.setTimeout(30000)

// 전역 beforeAll 훅
beforeAll(() => {
  console.log("테스트 시작: 테스트 환경 설정 완료")
})

// 전역 afterAll 훅
afterAll(() => {
  console.log("테스트 종료: 테스트 환경 정리 완료")
})

// 각 테스트 전에 실행
beforeEach(() => {
  jest.clearAllMocks()
})
