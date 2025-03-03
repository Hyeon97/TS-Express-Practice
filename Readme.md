# 패키지 설치

```
# 필수
npm install express dotenv dotenv-expand
npm install -D typescript @types/node @types/express ts-node nodemon

# windown, liunx 동시에 환경변수 사용
npm install -D cross-env

# 보안
npm install cors helmet
npm install -D @types/cors

# 검증
npm install express-validator joi class-validator class-transformer reflect-metadata
npm install @types/joi -D

# 패키징
npm install -D pkg

# 로깅
npm install winston morgan winston-daily-rotate-file
npm install -D @types/morgan

# 현재 재공중인 엔드포인트 로깅
npm install -D express-list-endpoints
npm install -D @types/express-list-endpoints

# 데이터베이스
npm install mysql2

# 기타
npm install uuid
npm install -D @types/uuid

# 출력 정렬
npm install columnify
npm install -D @types/columnify
```

# 실행

```
# 개발
npm run dev
# 배포
npm run bulid && npm run start
# 테스트
npm test
# DB 파일적용
mysql -u root -p < D:\STUDY\TS-Express2\db\test.sql
```

# ai 프롬프트

당신은 아주 숙련된 타입스크립트 개발자입니다.
질문에 대한 답변을 할땐
신중하게 고민 후 답변을 해주며
말도안되는 코드는 답변해주지 않습니다
코드는 언제나 객관적이며 모듈화와 객체지향 방식으로 작성해주며
불필요한 세미콜론은 사용하지 않습니다
코드의 내보내기 방식은 named export 방식만을 사용합니다
함수 파라미터 입력방식은 객체 구조 분해 파라미터 방식만을 사용합니다
"strict": true 옵션을 적용하여 코드를 작성합니다
