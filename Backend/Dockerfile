# =================================================
# Stage 1: Build Next.js frontend
# =================================================
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontEnd/package*.json ./

# Install dependencies (lockfile 없을 때도 동작하도록)
RUN npm install

# Copy frontend source
COPY frontEnd/ ./

# Build Next.js static export
RUN npm run build

# =================================================
# Stage 2: Build Spring Boot with Gradle
# =================================================
FROM gradle:8.5-jdk17-jammy as backend-builder

# 작업 디렉토리 설정
WORKDIR /app

# Copy backend files
COPY backend/ ./

# Copy frontend build output to static resources
COPY --from=frontend-builder /app/frontend/out ./src/main/resources/static

# gradlew 스크립트에 실행 권한을 부여합니다.
RUN chmod +x ./gradlew

# Gradle을 사용하여 실행 가능한 JAR 파일을 빌드합니다. (테스트 생략, 프론트 빌드 스킵)
RUN ./gradlew --no-daemon bootJar -x test -PskipFrontend

# =================================================
# Stage 3: Create a slim runtime image
# =================================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# builder 스테이지에서 빌드된 JAR 파일을 복사합니다.
COPY --from=backend-builder /app/build/libs/*.jar app.jar

# 애플리케이션이 사용할 포트를 노출합니다.
EXPOSE 8080

# 컨테이너가 시작될 때 애플리케이션을 실행합니다.
ENTRYPOINT ["java", "-jar", "app.jar"]