# Solución para Despliegue en Docker

## El Problema

El SDK de JavaScript usa `koffi` para cargar la librería compartida de Go, pero `koffi` requiere CMake para compilarse, lo que causa errores en contenedores Docker sin herramientas de build.

```
Error: CMake does not seem to be available
```

## Soluciones

### Opción 1: Incluir Herramientas de Build en Docker (Recomendado)

Agrega las dependencias necesarias a tu Dockerfile:

```dockerfile
FROM node:18-alpine

# Instalar dependencias de build
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cmake \
    linux-headers

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

CMD ["node", "index.js"]
```

**Para Ubuntu/Debian:**
```dockerfile
FROM node:18

# Instalar dependencias de build
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    cmake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "index.js"]
```

---

### Opción 2: Multi-stage Build (Más Eficiente)

Compila en una etapa y ejecuta en otra más ligera:

```dockerfile
# Etapa 1: Build
FROM node:18-alpine AS builder

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cmake \
    linux-headers

WORKDIR /app
COPY package*.json ./
RUN npm install --production=false

COPY . .

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copiar solo node_modules compilados y código
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY . .

CMD ["node", "index.js"]
```

---

### Opción 3: Usar Librería Pre-compilada (Sin koffi)

Si no puedes instalar herramientas de build, usa la librería Go directamente sin koffi:

#### Paso 1: Modificar package.json

```json
{
  "dependencies": {
    "prompt-to-query": "^1.0.0"
  },
  "optionalDependencies": {
    "koffi": "^2.9.0"
  }
}
```

#### Paso 2: Usar Modo HTTP

Inicia un servidor HTTP que expone la funcionalidad:

**server.js** (Go HTTP Server):
```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
)

type GenerateRequest struct {
    Prompt      string                 `json:"prompt"`
    LLMProvider string                 `json:"llm_provider"`
    APIKey      string                 `json:"api_key"`
    DBSchema    map[string]interface{} `json:"db_schema"`
    Model       string                 `json:"model"`
}

type GenerateResponse struct {
    Query interface{} `json:"query,omitempty"`
    Error string      `json:"error,omitempty"`
}

func main() {
    http.HandleFunc("/api/generate", handleGenerate)

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req GenerateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        json.NewEncoder(w).Encode(GenerateResponse{
            Error: "Invalid request: " + err.Error(),
        })
        return
    }

    // Aquí va tu lógica de generación de query
    // Por ahora, un ejemplo simple
    query := map[string]interface{}{
        "operation": "find",
        "collection": "users",
        "filter": map[string]interface{}{
            "status": "active",
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(GenerateResponse{
        Query: query,
    })
}
```

**Dockerfile para el servidor:**
```dockerfile
# Build Go server
FROM golang:1.21-alpine AS go-builder
WORKDIR /build
COPY core/ ./
RUN CGO_ENABLED=1 go build -o server cmd/server/main.go

# Node app
FROM node:18-alpine

WORKDIR /app

# Copiar servidor Go compilado
COPY --from=go-builder /build/server /usr/local/bin/

# Instalar dependencias Node (sin koffi)
COPY package*.json ./
RUN npm install --omit=optional

COPY . .

# Script de inicio
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
```

**docker-entrypoint.sh:**
```bash
#!/bin/sh
# Iniciar servidor Go en background
server &

# Esperar a que el servidor esté listo
sleep 2

# Iniciar aplicación Node
exec node index.js
```

**Usar en tu código:**
```javascript
const { PromptToQuery } = require('prompt-to-query');

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchemaPath: 'schema.json',
  mode: 'http',  // Forzar modo HTTP
  serverUrl: 'http://localhost:8080'
});

const query = await ptq.generateQuery('Get all active users');
```

---

### Opción 4: Usar Docker Compose (Microservicios)

Separa el SDK de Go como un servicio independiente:

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  prompt-to-query-server:
    build:
      context: ./go-server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - PROMPT_TO_QUERY_SERVER=http://prompt-to-query-server:8080
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      prompt-to-query-server:
        condition: service_healthy
```

---

## Comparación de Opciones

| Opción | Pros | Contras | Mejor Para |
|--------|------|---------|------------|
| **1. Build Tools** | Simple, funciona nativamente | Imagen más grande (~500MB) | Desarrollo, testing |
| **2. Multi-stage** | Imagen final pequeña (~150MB) | Build más lento | Producción |
| **3. HTTP Mode** | Sin dependencias de build | Requiere servidor adicional | Entornos restringidos |
| **4. Docker Compose** | Separación de concerns | Más complejo | Microservicios |

---

## Recomendación por Caso de Uso

### Desarrollo Local
```bash
# Usa Opción 1
docker build -t my-app -f Dockerfile.dev .
```

### Producción Simple
```bash
# Usa Opción 2 (Multi-stage)
docker build -t my-app -f Dockerfile.prod .
```

### Producción con Múltiples Apps
```bash
# Usa Opción 4 (Docker Compose)
docker-compose up -d
```

### CI/CD sin Docker (Heroku, Vercel, etc.)
```bash
# Usa Opción 3 (HTTP Mode)
# Despliega servidor Go separado
# Configura PROMPT_TO_QUERY_SERVER env var
```

---

## Troubleshooting

### Error: "Cannot find module 'koffi'"

**Solución:**
```bash
# Reinstalar con build tools
npm install koffi --build-from-source
```

### Error: "Library not found"

**Solución:**
```bash
# Compilar la librería Go
cd core
make build

# Copiar a ubicación correcta
cp build/libprompttoquery.* ../sdk/javascript/lib/
```

### Error: "Connection refused" (HTTP mode)

**Solución:**
```bash
# Verificar que el servidor está corriendo
curl http://localhost:8080/health

# Verificar variable de entorno
echo $PROMPT_TO_QUERY_SERVER
```

---

## Ejemplo Completo - Dockerfile Recomendado

```dockerfile
FROM node:18-alpine AS builder

# Instalar dependencias de compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cmake \
    linux-headers \
    go

# Build Go library
WORKDIR /build/go
COPY core/ ./
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
    go build -buildmode=c-shared \
    -o libprompttoquery.so \
    .

# Build Node dependencies
WORKDIR /build/node
COPY sdk/javascript/package*.json ./
RUN npm ci --production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copiar librería Go compilada
COPY --from=builder /build/go/libprompttoquery.so /usr/local/lib/
RUN ldconfig /usr/local/lib 2>/dev/null || true

# Copiar node_modules compilados
COPY --from=builder /build/node/node_modules ./node_modules

# Copiar código de la aplicación
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

---

## Variables de Entorno

```bash
# Para modo nativo
export LD_LIBRARY_PATH=/usr/local/lib

# Para modo HTTP
export PROMPT_TO_QUERY_SERVER=http://localhost:8080
export PROMPT_TO_QUERY_MODE=http

# API Keys
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Próximos Pasos

1. Elegir la opción que mejor se adapte a tu caso de uso
2. Crear el Dockerfile correspondiente
3. Probar localmente con `docker build` y `docker run`
4. Configurar CI/CD para build automatizado
5. Desplegar en tu plataforma preferida

---

## Soporte

Si tienes problemas:
1. Revisa los logs: `docker logs <container-id>`
2. Verifica las variables de entorno
3. Prueba en modo HTTP primero
4. Abre un issue en GitHub con detalles completos
