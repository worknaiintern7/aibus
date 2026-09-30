# -------------- Build stage ------------------------
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests

# -------------- Runtime stage ----------------------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Configure JVM options for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]