# Estágio 1: Build da aplicação Spring Boot
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Normaliza e copia o Maven Wrapper para cache de dependências
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copia código-fonte e compila o pacote JAR de produção
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Estágio 2: Imagem final de execução hardened e otimizada
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Instala curl para HealthCheck confiável (evita erros de flags GNU no BusyBox wget)
RUN apk add --no-cache curl

# Criação de usuário seguro não-root (UID/GID 1001)
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring
USER spring:spring

# Copia apenas o artefato final compilado
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

# Variáveis de ambiente padrão da JVM para containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV SERVER_PORT=8080

EXPOSE 8080

# Monitoramento de Saúde Nativo para Easypanel / Traefik / Docker Swarm
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${SERVER_PORT:-8080}/api/health > /dev/null || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
