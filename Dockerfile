FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

EXPOSE 10000

CMD ["sh", "-c", "java -jar target/MiniCache-1.0-SNAPSHOT.jar"]