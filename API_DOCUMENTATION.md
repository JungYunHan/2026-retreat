# API 문서

## 개요
모든 API는 일관된 응답 형식을 사용합니다.

### 표준 응답 형식
```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* 실제 데이터 */ },
  "error": "Optional error message"
}
```

## 인증 API

### POST /api/auth/login
로그인 및 JWT 토큰 발급

**요청:**
```json
{
  "username": "user1",
  "password": "password123"
}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**실패 응답 (401):**
```json
{
  "success": false,
  "error": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

## 페이지 데이터 API

### GET /api/home
홈 화면 데이터 조회 (인증 불필요)

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "dDay": 51,
    "scheduleItems": [
      {
        "time": "09:00",
        "title": "아침 집회",
        "location": "대강당"
      }
    ],
    "menu": {
      "date": "2026-01-23",
      "breakfast": "토스트, 우유",
      "lunch": "김치찌개, 밥",
      "dinner": "불고기, 밥"
    },
    "latestNotices": [
      {
        "id": 1,
        "title": "첫 번째 공지사항",
        "createdAt": "2025-12-01T10:00:00"
      }
    ]
  }
}
```

### GET /api/mypage
마이페이지 데이터 조회 (인증 필요)

**헤더:**
```
Authorization: Bearer {accessToken}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "name": "홍길동",
    "email": "hong@example.com",
    "phoneNumber": "010-1234-5678",
    "teamName": "청년부",
    "position": "팀원",
    "role": "USER"
  }
}
```

**실패 응답 (401):**
```json
{
  "success": false,
  "error": "인증이 필요합니다."
}
```

## Next.js에서 사용 예제

### 1. 로그인
```typescript
import { authApi } from '@/lib/api';

const handleLogin = async () => {
  const response = await authApi.login({
    username: 'user1',
    password: 'password123'
  });

  if (response.success) {
    console.log('토큰:', response.data?.accessToken);
    // 로그인 성공 후 페이지 이동
    router.push('/');
  } else {
    console.error('로그인 실패:', response.error);
  }
};
```

### 2. 홈 데이터 조회
```typescript
import { pageApi } from '@/lib/api';

const fetchHomeData = async () => {
  const response = await pageApi.getHomeData();

  if (response.success && response.data) {
    console.log('D-Day:', response.data.dDay);
    console.log('오늘 일정:', response.data.scheduleItems);
  }
};
```

### 3. 마이페이지 데이터 조회 (인증 필요)
```typescript
import { pageApi } from '@/lib/api';

const fetchMyPage = async () => {
  const response = await pageApi.getMyPageData();

  if (response.success && response.data) {
    console.log('사용자 이름:', response.data.name);
  } else if (response.error) {
    // 인증 실패 시 로그인 페이지로 이동
    router.push('/login');
  }
};
```

## 환경변수 설정

### 개발 환경 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 운영 환경 (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com/api
```

## 에러 처리

모든 API 호출은 다음과 같은 에러 처리 패턴을 사용합니다:

```typescript
const response = await apiClient.get('/some-endpoint');

if (response.success) {
  // 성공 처리
  console.log(response.data);
} else {
  // 에러 처리
  console.error(response.error);
}
```

## 주요 변경사항

### Backend
1. ✅ `ApiResponse<T>` 표준 응답 형식 추가
2. ✅ `GlobalExceptionHandler` 전역 예외 처리
3. ✅ 모든 Controller를 `@RestController`로 통일
4. ✅ 일관된 `/api/*` 경로 구조
5. ✅ 상세한 API 주석 추가

### Frontend
1. ✅ `api-client.ts` - HTTP 클라이언트 유틸리티
2. ✅ `api.ts` - 타입 안전한 API 함수들
3. ✅ `/login` - 로그인 페이지
4. ✅ JWT 토큰 자동 관리 (localStorage)
5. ✅ 환경변수 분리 (개발/운영)

## 테스트 방법

### 로컬 테스트
```bash
# Backend 실행
cd backend
./gradlew bootRun

# Frontend 실행
cd frontEnd
npm run dev
```

브라우저에서 `http://localhost:3000/login` 접속

### Render 배포 후
- Backend: `https://your-app-name.onrender.com/api`
- Frontend `.env.production` 업데이트 후 재배포
