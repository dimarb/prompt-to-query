# Soporte para Alpine Linux

## Resumen

El paquete `prompt-to-query` ahora incluye bibliotecas compiladas específicamente para Alpine Linux (musl libc), además de las versiones estándar de Linux (glibc).

## El Problema Original

```
Failed to load shared library: Error loading shared library libresolv.so.2:
No such file or directory (needed by /app/node_modules/prompt-to-query/lib/libprompttoquery_linux_arm64.so)
```

Este error ocurría porque:
- **Alpine Linux** usa `musl` como biblioteca C estándar
- **Ubuntu/Debian/RHEL** usan `glibc` como biblioteca C estándar
- Las bibliotecas compiladas con glibc NO funcionan en Alpine

## La Solución

Ahora el paquete incluye **7 bibliotecas** en total:

```
lib/
├── libprompttoquery_darwin_amd64.dylib         # macOS Intel
├── libprompttoquery_darwin_arm64.dylib         # macOS Apple Silicon
├── libprompttoquery_linux_amd64.so             # Linux x64 (Ubuntu/Debian) - glibc
├── libprompttoquery_linux_amd64_musl.so        # Linux x64 (Alpine) - musl ✨
├── libprompttoquery_linux_arm64.so             # Linux ARM64 (Ubuntu/Debian) - glibc
├── libprompttoquery_linux_arm64_musl.so        # Linux ARM64 (Alpine) - musl ✨
└── prompttoquery_windows_amd64.dll             # Windows x64
```

## Detección Automática

El SDK detecta automáticamente si está corriendo en Alpine y usa la biblioteca correcta:

```javascript
// En src/index.js
_isAlpine() {
  // Revisa /etc/alpine-release
  // O ejecuta ldd --version para detectar musl
}
```

## Compatibilidad

### ✅ Funciona en:

**Alpine Linux:**
- `node:18-alpine`
- `node:20-alpine`
- Contenedores Alpine personalizados

**Ubuntu/Debian:**
- `node:18`, `node:20`
- Ubuntu 20.04, 22.04, 24.04
- Debian 11, 12

**Otras distribuciones Linux:**
- CentOS, RHEL, Fedora
- Amazon Linux
- Cualquier distribución con glibc

**macOS:**
- Intel (x64)
- Apple Silicon (ARM64)

**Windows:**
- Windows 10/11 (x64)

### ⚠️ Limitaciones Conocidas

1. **koffi en Alpine**: Hay un issue conocido con koffi (la biblioteca FFI) en Alpine con ciertos kernels. Si encuentras un segmentation fault:

   **Solución temporal:**
   ```dockerfile
   # En tu Dockerfile, usa una imagen base de Ubuntu en lugar de Alpine
   FROM node:18  # en lugar de node:18-alpine
   ```

2. **Dependencias de build**: En Alpine necesitas instalar herramientas de compilación para koffi:
   ```dockerfile
   RUN apk add --no-cache python3 make g++ cmake linux-headers
   ```

## Ejemplos de Uso

### Docker con Alpine

```dockerfile
FROM node:18-alpine

# Instalar dependencias para koffi
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cmake \
    linux-headers

WORKDIR /app

# Instalar prompt-to-query
RUN npm install prompt-to-query

COPY . .

CMD ["node", "index.js"]
```

### Docker con Ubuntu (Recomendado)

```dockerfile
FROM node:18

WORKDIR /app

# No necesita dependencias adicionales
RUN npm install prompt-to-query

COPY . .

CMD ["node", "index.js"]
```

### Verificar qué biblioteca se está usando

```javascript
const { PromptToQuery } = require('prompt-to-query');
const os = require('os');

console.log('Platform:', os.platform());
console.log('Architecture:', os.arch());

// El SDK automáticamente elegirá la biblioteca correcta
const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchemaPath: './schema.json'
});

console.log('Version:', ptq.getVersion());
```

## Troubleshooting

### Error: "Segmentation fault" en Alpine

**Causa**: Problema con koffi en Alpine.

**Solución 1** - Usar Ubuntu en lugar de Alpine:
```dockerfile
FROM node:18  # en lugar de node:18-alpine
```

**Solución 2** - Verificar que tienes todas las dependencias:
```bash
apk add --no-cache python3 make g++ cmake linux-headers
```

**Solución 3** - Usar una versión más reciente de Alpine:
```dockerfile
FROM node:20-alpine  # Alpine 3.19+
```

### Error: "Native library not found"

**Causa**: El paquete no incluye la biblioteca para tu plataforma.

**Solución**: Verifica que tienes la versión correcta del paquete:
```bash
npm list prompt-to-query
# Debe ser >= 1.0.2 (con soporte Alpine)
```

### Verificar si estás en Alpine

```bash
# En el contenedor
if [ -f /etc/alpine-release ]; then
    echo "Running on Alpine $(cat /etc/alpine-release)"
else
    echo "Not Alpine"
fi

# Verificar libc
ldd --version
# Alpine muestra: musl libc (...)
# Ubuntu muestra: ldd (Ubuntu GLIBC 2.31-0ubuntu9.16) 2.31
```

## Construcción Manual

Si necesitas compilar las bibliotecas manualmente:

```bash
cd sdk/javascript

# Compilar todas las bibliotecas (incluye Alpine/musl)
npm run build:all

# Las bibliotecas estarán en lib/
ls -lh lib/
```

## Tamaño del Paquete

- **Paquete total**: ~25 MB comprimido, ~55 MB descomprimido
- **Cada biblioteca**: 6-12 MB

El SDK solo carga la biblioteca necesaria para tu plataforma, así que el overhead de memoria es solo de una biblioteca.

## Referencias

- [Issue de koffi en Alpine](https://github.com/Koromix/koffi/issues)
- [Diferencias entre musl y glibc](https://wiki.musl-libc.org/functional-differences-from-glibc.html)
- [Alpine Linux FAQ](https://wiki.alpinelinux.org/wiki/FAQ)

## Soporte

Si encuentras problemas:
1. Abre un issue en: https://github.com/dimarborda/prompt-to-query/issues
2. Incluye:
   - Versión de Node.js: `node --version`
   - Distribución Linux: `cat /etc/os-release`
   - Mensaje de error completo
