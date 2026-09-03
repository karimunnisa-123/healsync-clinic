FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . .
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "target/healsync-0.0.1-SNAPSHOT.jar"]