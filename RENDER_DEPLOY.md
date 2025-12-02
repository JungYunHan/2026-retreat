# Render 배포 가이드

## 현재 구성
- **Backend**: Spring Boot 3.3.0 + JDK 17
- **Frontend**: Next.js 16 (정적 export)
- **Database**: PostgreSQL (Render 제공)
- **인증**: JWT
- **배포 방식**: Docker 컨테이너

## Render 배포 단계

### 1. GitHub 연동
1. 이 프로젝트를 GitHub에 푸시
2. Render 대시보드에서 "New +" → "Blueprint" 선택
3. 저장소 연결 (render.yaml 자동 감지)

### 2. 환경 변수 설정
Render 대시보드에서 자동으로 설정되지만, 수동 확인/추가:
- `SPRING_PROFILES_ACTIVE`: `prod`
- `JWT_SECRET`: 자동 생성 또는 직접 입력 (최소 32자)
- `JWT_EXPIRATION_MS`: `3600000`
- DB 관련은 PostgreSQL 생성 시 자동 연결

### 3. 배포 프로세스
```
GitHub Push → Render 자동 빌드 → Docker 빌드 (3단계)
  1. Next.js 빌드 (static export)
  2. Spring Boot JAR 빌드
  3. 최종 이미지 생성 및 실행
```

### 4. 배포 후 확인
- URL: `https://smy-winter-2026.onrender.com`
- Health Check: `/` (index.html)
- API: `/api/home`, `/api/auth/login` 등

## 주의사항

### Free Tier 제한
- 15분 미활동 시 슬립 모드 (첫 요청 시 재시작 약 30초)
- 월 750시간 무료
- PostgreSQL: 90일 후 자동 삭제 (Free Plan)

### 데이터베이스 초기화
현재 `ddl-auto: validate` 설정:
- 첫 배포 시 수동 스키마 생성 필요 또는
- 임시로 `update`로 변경 후 배포 → 이후 `validate`로 복원

### CORS 설정
`SecurityConfig.java`에서 Render URL 추가 필요:
```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "https://smy-winter-2026.onrender.com"
));
```

## 로컬 Docker 테스트
```powershell
# 프로젝트 루트에서
docker build -f backend/Dockerfile -t smy-winter-2026 .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev smy-winter-2026
```

## 비용 최적화
- **Hobby Plan ($7/월)**: 슬립 모드 없음, SSL 인증서 자동
- **PostgreSQL Starter ($7/월)**: 영구 보관, 백업 기능

## 트러블슈팅
- **빌드 실패**: Dockerfile 경로 확인 (`dockerContext: .`)
- **DB 연결 실패**: 환경변수 `DB_URL` 형식 확인
- **정적파일 404**: `static` 폴더 빌드 포함 여부 확인

---
**참고 문서**: https://render.com/docs/deploy-spring-boot
