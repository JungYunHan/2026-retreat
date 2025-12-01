# 2026 선목젊은이 동계수련회 웹 애플리케이션

이 프로젝트는 '2026 선목젊은이 동계수련회'를 위한 모바일 웹 애플리케이션입니다. 수련회 참가자들이 시간표, 공지사항 등 다양한 정보를 쉽게 확인하고 사용할 수 있도록 돕는 것을 목표로 합니다.

## 🎯 주요 기능

- **사용자 인증**: Spring Security를 이용한 안전한 로그인 및 로그아웃 기능
- **홈 화면**: 수련회 D-Day 카운터, 최신 공지, 오늘의 일정 등 핵심 정보 제공
- **정보 조회**: 전체 시간표, 공지사항 목록 및 상세 내용 확인
- **실시간 정보 전달**: 상단 광고 배너 슬라이더를 통한 중요 정보 강조
- **편리한 내비게이션**: 탭 기반 UI로 홈, 시간표, 공지, 설정 등 주요 메뉴 간 빠른 이동 지원

## 📂 프로젝트 구조

이 프로젝트는 백엔드와 프론트엔드가 분리된 구조로 구성되어 있습니다.

### Backend (Spring Boot)

```
src
└── main
    ├── java/com/smy/winter2026
    │   ├── SmyWinter2026Application.java  // 애플리케이션 메인 클래스
    │   ├── config                         // Security, Web MVC 등 설정 파일
    │   ├── controller                     // API HTTP 요청 처리
    │   ├── domain (or entity)             // 데이터베이스 테이블과 매핑되는 객체
    │   ├── dto                            // 계층 간 데이터 전송 객체
    │   ├── repository                     // 데이터베이스 접근 (JPA)
    │   └── service                        // 비즈니스 로직 구현
    └── resources
        ├── application.yml                // 공통 환경설정
        └── static                         // 정적 리소스
```

### Frontend (Next.js)

```
frontEnd
├── app/               // 라우팅, UI 등 핵심 애플리케이션 로직
│   ├── (pages)/       // 각 페이지 컴포넌트 (예: home, schedule)
│   ├── layout.tsx     // 공통 레이아웃
│   └── page.tsx       // 기본 진입 페이지
├── components/        // 재사용 가능한 UI 컴포넌트 (버튼, 탭 등)
├── lib/ or utils/     // 공통 함수 및 유틸리티
├── public/            // 이미지, 폰트 등 정적 에셋
└── styles/            // 전역 스타일 및 테마
```

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
- **Styling**: Tailwind CSS, Emotion 등
- **State Management**: Redux Toolkit, Zustand 등

### 데이터베이스 (Database)
- **H2 Database**: 개발용 인메모리 데이터베이스
- **PostgreSQL**: 운영용 데이터베이스

### 개발 도구
- **Lombok**: 보일러플레이트 코드 감소
- **Spring Boot DevTools**: 실시간 리로드 및 개발 편의 기능

## 🚀 빌드 및 실행 방법

### 사전 준비물

- **Java 17 (JDK)**
- **Node.js** (v18.x 이상 권장)
- **IDE**: IntelliJ IDEA 또는 VS Code 등의 통합 개발 환경

### Backend 실행 (Spring Boot)

1.  **프로젝트 열기**: IDE에서 `Backend` 폴더를 프로젝트로 엽니다.

#### IDE에서 실행

`src/main/java/com/smy/winter2026/SmyWinter2026Application.java` 파일을 찾아 실행합니다.

#### Gradle로 실행

프로젝트의 `Backend` 디렉터리에서 터미널을 열고 아래 명령어를 입력합니다.

```bash
# Windows
.\gradlew bootRun

# macOS / Linux
./gradlew bootRun
``` 

2.  **애플리케이션 접속**
    -   **API 서버**: `http://localhost:8080`

### Frontend 실행 (Next.js)

1.  **의존성 설치**

    프로젝트의 `frontEnd` 디렉터리에서 터미널을 열고 아래 명령어를 입력합니다.

    ```bash
    npm install
    # 또는 yarn install
    ```

2.  **개발 서버 실행**

    ```bash
    npm run dev
    # 또는 yarn dev
    ```

3.  **애플리케이션 접속**

    -   **웹 페이지**: 웹 브라우저에서 `http://localhost:3000` 으로 접속합니다.

### 테스트 계정
- **이메일**: `user@example.com`
- **비밀번호**: `password`