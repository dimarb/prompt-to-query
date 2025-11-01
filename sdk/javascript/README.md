# Prompt to Query - JavaScript/Node.js SDK

[![npm version](https://badge.fury.io/js/prompt-to-query.svg)](https://www.npmjs.com/package/prompt-to-query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?logo=node.js&logoColor=white)](https://nodejs.org)

SDK de alto rendimiento para convertir lenguaje natural en queries de MongoDB usando IA (OpenAI GPT o Anthropic Claude).

## Características

- **Alto Rendimiento**: Core nativo en Go para máxima velocidad
- **Multiplataforma**: Soporta Linux, macOS y Windows (AMD64 y ARM64)
- **Múltiples LLMs**: Compatible con OpenAI (GPT-4, GPT-3.5) y Anthropic (Claude)
- **Type-Safe**: Incluye definiciones TypeScript
- **Detección de Columnas**: Genera automáticamente títulos legibles para las columnas de resultados
- **Fácil de Usar**: API simple y consistente

## Instalación

```bash
npm install prompt-to-query
# o
yarn add prompt-to-query
```

## Requisitos

- Node.js >= 14.0.0 (recomendado >= 16.0.0)
- Una API key de OpenAI o Anthropic
- Las librerías nativas se incluyen para las siguientes plataformas:
  - Linux (AMD64, ARM64) - glibc y musl (Alpine)
  - macOS (AMD64/Intel, ARM64/Apple Silicon)
  - Windows (AMD64, ARM64)

**Nota técnica**: Este paquete usa [koffi](https://github.com/Koromix/koffi) para FFI (Foreign Function Interface), una librería moderna compatible con Node.js 14-22+.

## Uso Rápido

### JavaScript

```javascript
const { PromptToQuery } = require('prompt-to-query');

async function main() {
  // Inicializar el SDK
  const ptq = new PromptToQuery({
    llmProvider: 'openai',  // o 'anthropic'
    apiKey: process.env.OPENAI_API_KEY,
    dbSchemaPath: './schema.json'
  });

  // Generar query desde lenguaje natural
  const result = await ptq.generateQuery('Get all active users from last month');
  console.log('Query:', result.query);
  // Output: { operation: 'find', collection: 'users', filter: { ... } }

  console.log('Column Titles:', result.columnTitles);
  // Output: ['User Name', 'Email', 'Status', 'Registration Date']

  // Obtener versión del SDK
  console.log('SDK Version:', ptq.getVersion());
}

main().catch(console.error);
```

### TypeScript

```typescript
import { PromptToQuery, PromptToQueryError } from 'prompt-to-query';

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  dbSchemaPath: './schema.json'
});

try {
  const result = await ptq.generateQuery('Count orders from last week');
  console.log('Query:', result.query);
  console.log('Columns:', result.columnTitles);
} catch (error) {
  if (error instanceof PromptToQueryError) {
    console.error('SDK Error:', error.message);
  }
}
```

## Configuración

### Opciones del Constructor

```javascript
new PromptToQuery({
  llmProvider: string,      // 'openai' o 'anthropic' (requerido)
  apiKey: string,          // Tu API key (requerido)
  dbSchema?: object,       // Esquema de DB como objeto (opcional)
  dbSchemaPath?: string,   // Path al archivo JSON del esquema (opcional)
  model?: string,          // Modelo específico a usar (opcional)
  libPath?: string         // Path personalizado a la librería nativa (opcional)
})
```

**Nota**: Debes proporcionar o bien `dbSchema` o bien `dbSchemaPath`.

### Esquema de Base de Datos

Crea un archivo `schema.json` que describa tu base de datos MongoDB:

```json
{
  "users": {
    "fields": {
      "name": "string",
      "email": "string",
      "status": "string",
      "created_at": "date",
      "last_login": "date"
    }
  },
  "products": {
    "fields": {
      "name": "string",
      "price": "number",
      "category": "string",
      "stock": "number"
    }
  }
}
```

## API

### `new PromptToQuery(config)`

Crea una nueva instancia del SDK.

**Parámetros:**
- `config` (Object): Objeto de configuración (ver arriba)

**Throws:**
- `PromptToQueryError`: Si la inicialización falla
- `Error`: Si la configuración es inválida

### `generateQuery(prompt): Promise<Object>`

Genera una query de MongoDB desde un prompt en lenguaje natural.

**Parámetros:**
- `prompt` (string): Descripción en lenguaje natural de la query deseada

**Returns:**
- `Promise<Object>`: Objeto con las siguientes propiedades:
  - `query`: Objeto de query de MongoDB con:
    - `operation`: "find", "aggregate", o "count"
    - `collection`: Nombre de la colección
    - `filter`: Filtro de query (para find/count)
    - `pipeline`: Pipeline de agregación (para aggregate)
    - `projection`, `sort`, `limit`, `skip`: Parámetros opcionales
  - `columnTitles`: Array de strings con títulos legibles para las columnas

**Throws:**
- `PromptToQueryError`: Si la generación de query falla

**Ejemplo:**

```javascript
const result = await ptq.generateQuery('Top 10 products by price');
console.log(result.query);
// {
//   operation: 'find',
//   collection: 'products',
//   sort: { price: -1 },
//   limit: 10
// }

console.log(result.columnTitles);
// ['Product Name', 'Price', 'Category', 'Stock']
```

### `getVersion(): string`

Obtiene la versión del SDK.

**Returns:**
- `string`: String de versión

## Ejemplos

### Ejemplo 1: Query Simple

```javascript
const result = await ptq.generateQuery('Get all active users');
console.log(result.query);
// { operation: 'find', collection: 'users', filter: { status: 'active' } }

console.log(result.columnTitles);
// ['Name', 'Email', 'Status', 'Created At']
```

### Ejemplo 2: Query con Filtros Complejos

```javascript
const result = await ptq.generateQuery(
  'Find products with price greater than 100 dollars'
);
console.log(result.query);
// {
//   operation: 'find',
//   collection: 'products',
//   filter: { price: { $gt: 100 } }
// }

console.log(result.columnTitles);
// ['Product Name', 'Price', 'Category']
```

### Ejemplo 3: Query de Agregación

```javascript
const result = await ptq.generateQuery(
  'Get top 10 products by sales with their categories'
);
console.log(result.query);
// {
//   operation: 'aggregate',
//   collection: 'products',
//   pipeline: [
//     { $sort: { sales: -1 } },
//     { $limit: 10 },
//     { $project: { name: 1, sales: 1, category: 1 } }
//   ]
// }

console.log(result.columnTitles);
// ['Product Name', 'Sales', 'Category']
```

### Ejemplo 4: Query de Conteo

```javascript
const result = await ptq.generateQuery('Count orders from last month');
console.log(result.query);
// {
//   operation: 'count',
//   collection: 'orders',
//   filter: { created_at: { $gte: ISODate('...') } }
// }

console.log(result.columnTitles);
// ['Total Orders']
```

### Ejemplo 5: Manejo de Errores

```javascript
try {
  const result = await ptq.generateQuery('invalid query');
  console.log(result.query);
  console.log(result.columnTitles);
} catch (error) {
  if (error instanceof PromptToQueryError) {
    console.error('Error del SDK:', error.message);
  } else {
    console.error('Error inesperado:', error);
  }
}
```

## Uso con Docker

El SDK es totalmente compatible con Docker y soporta tanto Alpine Linux (musl) como distribuciones basadas en Debian/Ubuntu (glibc).

### Docker con Alpine Linux

```dockerfile
FROM node:18-alpine

# Instalar dependencias de compilación para koffi
RUN apk add --no-cache python3 make g++ cmake linux-headers

WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código de la aplicación
COPY . .

# Variables de entorno
ENV OPENAI_API_KEY=your-api-key

CMD ["node", "app.js"]
```

### Docker con Ubuntu/Debian

```dockerfile
FROM node:18

# Instalar dependencias de compilación
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

ENV OPENAI_API_KEY=your-api-key

CMD ["node", "app.js"]
```

### Docker Multi-stage Build

Para optimizar el tamaño de la imagen:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

RUN apk add --no-cache python3 make g++ cmake linux-headers

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar solo node_modules y código
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV OPENAI_API_KEY=your-api-key

CMD ["node", "app.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./schema.json:/app/schema.json:ro
    ports:
      - "3000:3000"
    restart: unless-stopped

  mongodb:
    image: mongo:7
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

### Notas sobre Docker

1. **Detección automática**: El SDK detecta automáticamente si está corriendo en Alpine Linux y usa la librería nativa correcta (musl vs glibc)

2. **Dependencias de compilación**: Son necesarias solo durante `npm install` para compilar koffi. Puedes eliminarlas en builds multi-stage para reducir el tamaño final

3. **Variables de entorno**: Siempre usa variables de entorno para las API keys, nunca las incluyas en el código o Dockerfile

4. **Volúmenes**: Monta el archivo `schema.json` como read-only para evitar modificaciones accidentales

## Proveedores LLM

### OpenAI

```javascript
const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',  // opcional, por defecto: gpt-3.5-turbo
  dbSchemaPath: './schema.json'
});
```

**Modelos soportados:**
- `gpt-4`
- `gpt-4-turbo-preview`
- `gpt-3.5-turbo` (por defecto)

### Anthropic Claude

```javascript
const ptq = new PromptToQuery({
  llmProvider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus-20240229',  // opcional
  dbSchemaPath: './schema.json'
});
```

**Modelos soportados:**
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229` (por defecto)
- `claude-3-haiku-20240307`

## Solución de Problemas

### Error: "Library not found"

Si ves este error, significa que la librería nativa no se encuentra. Soluciones:

1. Verifica que tu plataforma sea compatible
2. Reinstala el paquete: `npm install --force prompt-to-query`
3. Especifica un path personalizado:

```javascript
const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: 'your-key',
  dbSchemaPath: './schema.json',
  libPath: '/path/to/libprompttoquery.so'
});
```

### Error: "Initialization failed"

Verifica:
- Que tu API key sea válida
- Que el archivo de esquema exista y sea JSON válido
- Que el provider sea 'openai' o 'anthropic'

### Error de Compilación en Node.js 20+

Si experimentas errores de compilación con versiones anteriores que usaban `ffi-napi`, el paquete ahora usa **koffi** que es:

- Compatible con Node.js 14-22+
- No requiere compilación nativa compleja
- Más rápido y moderno
- Mejor mantenido

### Error: "CMake does not seem to be available" (Docker/Alpine)

**Solución**: Instala las dependencias de compilación antes de `npm install`:

**Alpine:**
```bash
apk add --no-cache python3 make g++ cmake linux-headers
```

**Ubuntu/Debian:**
```bash
apt-get install -y python3 make g++ cmake
```

**macOS:**
```bash
brew install cmake
```

Luego reconstruye:
```bash
npm rebuild koffi
```

## Características Avanzadas

### Detección Automática de Columnas

El SDK incluye detección inteligente de columnas que genera títulos legibles para los resultados:

```javascript
const result = await ptq.generateQuery('Show me user names and emails');

// La query incluye solo los campos necesarios
console.log(result.query);
// {
//   operation: 'find',
//   collection: 'users',
//   projection: { name: 1, email: 1 }
// }

// Los títulos son legibles para humanos
console.log(result.columnTitles);
// ['User Name', 'Email']
```

Esto es especialmente útil para:
- Generar tablas dinámicas en interfaces de usuario
- Exportar datos a CSV/Excel con headers apropiados
- Mostrar resultados en dashboards

### Uso del Esquema como Objeto

En lugar de un archivo, puedes pasar el esquema directamente:

```javascript
const schema = {
  users: {
    fields: {
      name: 'string',
      email: 'string',
      age: 'number'
    }
  }
};

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchema: schema  // En lugar de dbSchemaPath
});
```

## Rendimiento

- **Modo Nativo**: Usa FFI para llamar directamente a la librería Go compilada (más rápido)
- **Detección Alpine**: Automática con fallback a diferentes versiones de libc
- **Caché**: El SDK mantiene el estado internamente para llamadas subsecuentes más rápidas

## Seguridad

- Nunca incluyas API keys en el código o control de versiones
- Usa variables de entorno (`process.env`) para credenciales
- El SDK valida todas las queries generadas antes de retornarlas
- No ejecuta queries automáticamente - siempre tienes control

## Plataformas Soportadas

| OS | AMD64 | ARM64 | Alpine (musl) |
|----|-------|-------|---------------|
| Linux | ✅ | ✅ | ✅ |
| macOS | ✅ | ✅ | N/A |
| Windows | ✅ | ✅ | N/A |

## Licencia

MIT

## Soporte

- **Issues**: [GitHub Issues](https://github.com/dimarb/prompt-to-query/issues)
- **Documentación completa**: [GitHub](https://github.com/dimarb/prompt-to-query)
- **Ejemplos**: Ver directorio `examples/`

---

Hecho con ❤️ usando Go + Node.js
