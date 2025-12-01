# 2026 선목젊은이 동계수련회 웹 애플리케이션

이 프로젝트는 '2026 선목젊은이 동계수련회'를 위한 모바일 웹 애플리케이션입니다. 수련회 참가자들이 시간표, 공지사항 등 다양한 정보를 쉽게 확인하고 사용할 수 있도록 돕는 것을 목표로 합니다.

## 🎯 주요 기능

- **사용자 인증**: Spring Security를 이용한 로그인 및 로그아웃 기능
- **홈 화면**: 수련회 D-Day, 최신 공지, 오늘의 일정 등 주요 정보 제공
- **광고 배너**: 상단 이미지 슬라이더를 통한 정보 전달
- **탭 기반 내비게이션**: 홈, 시간표, 공지, 설정 등 주요 메뉴로의 빠른 이동

## 🛠️ 기술 스택 (Tech Stack)

### 백엔드 (Backend)
- **Framework**: **Spring Boot 3.x**
- **Java 17**
- **Spring Data JPA**: 데이터베이스 연동
- **Spring Security**: 인증 및 권한 관리
- **Gradle**: 의존성 관리 및 빌드

### 프론트엔드 (Frontend)
- **Framework**: **Next.js**
- **Language**: **TypeScript**
- **Styling**: (예: Tailwind CSS, Emotion 등)
- **State Management**: (예: Redux Toolkit, Zustand 등)

### 데이터베이스 (Database)
- **H2 Database**: 개발용 인메모리 데이터베이스
- **PostgreSQL**: 운영용 데이터베이스

### 개발 도구
- **Lombok**: 보일러플레이트 코드 감소
- **Spring Boot DevTools**: 실시간 리로드 및 개발 편의 기능

## 🚀 빌드 및 실행 방법

### 사전 준비물

- **Java 17 (JDK)** 설치
- **IDE**: IntelliJ IDEA 또는 VS Code 등의 통합 개발 환경

### 1. 프로젝트 클론

```bash
git clone <저장소_URL>
cd smy-winter-2026
```

### 2. 프로젝트 실행 (개발 환경)

이 프로젝트는 기본적으로 별도의 설정 없이 바로 실행할 수 있는 개발(`dev`) 프로필을 사용합니다.

#### IDE에서 실행
1. IDE에서 프로젝트를 엽니다.
2. `SmyWinter2026Application.java` 파일을 찾아 실행합니다.

#### Gradle로 실행

터미널에서 아래 명령어를 입력합니다.
```bash
# Windows
.\gradlew bootRun

# macOS / Linux
./gradlew bootRun
```

### 3. 애플리케이션 접속

- **웹 페이지**: 웹 브라우저에서 `http://localhost:8080` 으로 접속합니다.
- **H2 데이터베이스 콘솔**: 개발 중 데이터베이스를 직접 확인하려면 `http://localhost:8080/h2-console` 로 접속합니다.
  - **JDBC URL**: `jdbc:h2:mem:testdb`
  - **사용자명**: `sa`
  - **비밀번호**: (공란)

### 4. 테스트 계정
- **이메일**: `user@example.com`
- **비밀번호**: `password`