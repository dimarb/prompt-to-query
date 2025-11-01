# Guía Rápida de Publicación

## TL;DR - Publicar a NPM desde tu Mac

```bash
cd sdk/javascript

# 1. Construir para todas las plataformas (usa Docker)
npm run build:all

# 2. Verificar que todas las bibliotecas estén listas
ls -lh lib/

# 3. Probar
npm test

# 4. Publicar
npm publish
```

## Lo que hace `npm run build:all`

El script automáticamente:

1. **Construye para macOS** (AMD64 y ARM64) - Nativamente
2. **Construye para Linux** (AMD64 y ARM64) - Usando Docker
3. **Construye para Windows** (AMD64) - Usando Docker con mingw-w64

## Resultado

Después de ejecutar `npm run build:all`, tendrás en `lib/`:

```
lib/
├── libprompttoquery_darwin_amd64.dylib  (6.2 MB) - macOS Intel
├── libprompttoquery_darwin_arm64.dylib  (5.8 MB) - macOS Apple Silicon
├── libprompttoquery_linux_amd64.so      (7.3 MB) - Linux x64
├── libprompttoquery_linux_arm64.so      (6.9 MB) - Linux ARM64
└── prompttoquery_windows_amd64.dll      (12 MB)  - Windows x64
```

## Solución al Error Original

El error que recibías:

```
Native library not found. Searched in:
  - /app/node_modules/prompt-to-query/lib/libprompttoquery_linux_arm64.so
Platform: linux, Architecture: arm64
```

Se resuelve porque ahora **todas las bibliotecas se incluyen en el paquete NPM**, no solo la de tu Mac.

## Verificar antes de Publicar

```bash
# Ver qué archivos se incluirán
npm pack --dry-run

# Crear el paquete
npm pack

# Inspeccionar el contenido
tar -tzf prompt-to-query-*.tgz | grep lib/

# Deberías ver todas las bibliotecas:
# package/lib/libprompttoquery_darwin_amd64.dylib
# package/lib/libprompttoquery_darwin_arm64.dylib
# package/lib/libprompttoquery_linux_amd64.so
# package/lib/libprompttoquery_linux_arm64.so
# package/lib/prompttoquery_windows_amd64.dll
```

## Scripts Disponibles

- `npm run build:native` - Construye solo para tu plataforma actual
- `npm run build:all` - Construye para TODAS las plataformas (usa Docker)
- `npm test` - Ejecuta tests
- `npm publish` - Publica (automáticamente ejecuta `build:all` y `test`)

## Requisitos

- **Go 1.21+** (tienes 1.24.4 ✅)
- **Docker** (instalado ✅)
- **Node.js 14+**

## Troubleshooting

### Error: "Docker not found"

```bash
# Instala Docker Desktop desde https://docker.com
# O verifica que esté corriendo:
docker ps
```

### Error: "permission denied: build-native.sh"

```bash
chmod +x scripts/build-native.sh
```

### Quiero solo construir para Linux

```bash
# Puedes ejecutar directamente:
./scripts/build-native.sh --all

# O editar el script para comentar las plataformas que no necesites
```

## Flujo de Trabajo Completo

```bash
# 1. Hacer cambios al código
vim src/index.js

# 2. Incrementar versión
npm version patch  # 1.0.1 -> 1.0.2

# 3. Construir todo
npm run build:all

# 4. Verificar
npm pack
tar -tzf prompt-to-query-*.tgz | grep lib/

# 5. Probar localmente (opcional)
cd /tmp
npm install /Users/dimarborda/2025/prompt-to-query/sdk/javascript/prompt-to-query-*.tgz

# 6. Publicar
npm publish

# 7. Limpiar
rm prompt-to-query-*.tgz
```

## Notas Importantes

1. **Docker debe estar corriendo** antes de ejecutar `npm run build:all`
2. **La primera vez tarda más** porque descarga las imágenes de Docker
3. **Las compilaciones siguientes son más rápidas** porque las imágenes ya están en caché
4. **No hagas commit de `lib/`** - está en `.gitignore` y se construye en tiempo de publicación
5. **El script `prepublishOnly` automáticamente ejecuta `build:all`** cuando haces `npm publish`

## Tiempo de Compilación

En tu Mac:
- Primera vez: ~5-10 minutos (descarga imágenes Docker)
- Siguientes veces: ~2-3 minutos

## Alternativa: GitHub Actions

Si prefieres no compilar localmente, puedes usar GitHub Actions (ver `PUBLISHING.md`).

## Soporte

- GitHub Issues: https://github.com/dimarborda/prompt-to-query/issues
- Email: dimarborda@gmail.com
