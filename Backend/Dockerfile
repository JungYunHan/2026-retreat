# =================================================
# Stage 1: Build the application with Gradle
# =================================================
FROM gradle:8.5-jdk17-jammy as builder

# 작업 디렉토리 설정
WORKDIR /app

# 프로젝트의 모든 파일을 Docker 컨테이너로 복사합니다.
COPY . .

# gradlew 스크립트에 실행 권한을 부여합니다.
RUN chmod +x ./gradlew

# Gradle을 사용하여 실행 가능한 JAR 파일을 빌드합니다. (테스트는 생략)
RUN ./gradlew bootJar -x test

# =================================================
# Stage 2: Create a slim runtime image
# =================================================
FROM eclipse-temurin:17-jdk
WORKDIR /app

# builder 스테이지에서 빌드된 JAR 파일을 복사합니다.
COPY --from=builder /app/build/libs/*.jar app.jar

# 애플리케이션이 사용할 포트를 노출합니다.
EXPOSE 8080

# 컨테이너가 시작될 때 애플리케이션을 실행합니다.
ENTRYPOINT ["java", "-jar", "app.jar"]