# Estágio 1: Build da aplicação Spring Boot
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copia arquivos do wrapper Maven para cache de dependências
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copia código-fonte e gera o pacote JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Estágio 2: Imagem final otimizada para execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuário de segurança não-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
