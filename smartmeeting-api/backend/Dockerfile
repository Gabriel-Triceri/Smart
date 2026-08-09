# ---- Etapa 1: build ------------------------------------------------------
# O JDK só é necessário para compilar; a imagem final leva apenas o JRE.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Copiar só o pom primeiro faz o Docker reaproveitar o cache das dependências
# quando apenas o código-fonte muda.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Etapa 2: runtime ----------------------------------------------------
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# curl é usado pelo healthcheck do compose; a imagem base não o traz.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Não rodar como root.
RUN useradd --system --create-home --shell /usr/sbin/nologin smartmeeting

COPY --from=build /build/target/*.jar app.jar

# O H2 grava em ./data/smartmeeting (ver spring.datasource.url), relativo ao
# WORKDIR. É este diretório que o compose monta como volume — sem isso os
# dados morrem junto com o container.
RUN mkdir -p /app/data && chown -R smartmeeting:smartmeeting /app

USER smartmeeting
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
