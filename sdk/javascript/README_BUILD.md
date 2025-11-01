# Building Native Libraries

## Quick Start

Para publicar el paquete con soporte para múltiples plataformas:

```bash
# Opción 1: Publicar usando GitHub Actions (Recomendado)
git tag v1.0.2
git push origin main --tags

# Opción 2: Build local (solo construye para tu plataforma actual)
npm run build:native
npm publish
```

## El Problema

El error que viste:

```
Native library not found. Searched in:
  - /app/node_modules/prompt-to-query/lib/libprompttoquery_linux_arm64.so
  ...
Platform: linux, Architecture: arm64
```

Ocurre porque el paquete NPM no incluía la biblioteca compilada para `linux arm64`. Solo incluía la biblioteca de la plataforma donde se publicó (probablemente macOS).

## La Solución

Hemos implementado 3 soluciones:

### 1. Script de Build Automático

El script `scripts/build-native.sh` automáticamente:
- Compila para la plataforma actual
- Intenta compilar para otras plataformas si tienes las herramientas necesarias
- Copia todas las bibliotecas a `lib/`

```bash
npm run build:native
```

### 2. GitHub Actions Workflow

El archivo `.github/workflows/build-and-publish.yml` construye para TODAS las plataformas:
- Linux AMD64 y ARM64
- macOS AMD64 y ARM64 (Intel y Apple Silicon)
- Windows AMD64

Cuando creas un tag (ej: `v1.0.2`), automáticamente:
1. Compila para todas las plataformas
2. Ejecuta tests
3. Publica a NPM con todas las bibliotecas

### 3. Script `prepublishOnly` Actualizado

Ahora `package.json` incluye:

```json
{
  "scripts": {
    "build:native": "./scripts/build-native.sh",
    "prepublishOnly": "npm run build:native && npm test"
  }
}
```

Esto significa que `npm publish` automáticamente:
1. Ejecuta `build:native` (construye bibliotecas)
2. Ejecuta tests
3. Publica

## Uso Recomendado

### Para Publicar (Producción)

**Usa GitHub Actions:**

```bash
# 1. Incrementa la versión
cd sdk/javascript
npm version patch  # o minor, o major

# 2. Push el tag
git push origin main --tags

# 3. GitHub Actions se encarga del resto
# Puedes ver el progreso en: https://github.com/TU_USUARIO/prompt-to-query/actions
```

### Para Desarrollo Local

**Build solo para tu plataforma:**

```bash
cd sdk/javascript
npm run build:native
npm test
```

## Verificación

Después de publicar, verifica que el paquete incluya todas las bibliotecas:

```bash
# Descarga el paquete sin instalarlo
npm pack

# Lista los contenidos
tar -tzf prompt-to-query-*.tgz | grep lib/

# Deberías ver:
# package/lib/libprompttoquery_linux_amd64.so
# package/lib/libprompttoquery_linux_arm64.so
# package/lib/libprompttoquery_darwin_amd64.dylib
# package/lib/libprompttoquery_darwin_arm64.dylib
# package/lib/prompttoquery_windows_amd64.dll
```

## Estructura del Paquete

```
sdk/javascript/
├── lib/                          # Bibliotecas nativas (ignorado en git)
│   ├── libprompttoquery_linux_amd64.so
│   ├── libprompttoquery_linux_arm64.so
│   ├── libprompttoquery_darwin_amd64.dylib
│   ├── libprompttoquery_darwin_arm64.dylib
│   └── prompttoquery_windows_amd64.dll
├── scripts/
│   ├── build-native.sh           # Script de build
│   └── postinstall.js            # Post-install checks
├── src/
│   └── index.js                  # SDK principal
└── package.json
```

## Instalación de Herramientas de Cross-Compilation (Opcional)

Si quieres compilar para otras plataformas localmente:

### En macOS
```bash
# macOS puede compilar para amd64 y arm64 nativamente
xcode-select --install
```

### En Linux (Ubuntu/Debian)
```bash
# Para compilar para Windows
sudo apt-get install -y mingw-w64

# Para ARM64 (si estás en AMD64)
sudo apt-get install -y gcc-aarch64-linux-gnu
```

## Notas Importantes

1. **El directorio `lib/` está en `.gitignore`** - Las bibliotecas se construyen en tiempo de build, no se versionan
2. **GitHub Actions es la forma recomendada** - Garantiza que todas las plataformas estén soportadas
3. **Cada plataforma/arquitectura necesita su propia biblioteca** - No hay binarios universales
4. **koffi es opcional** - Si la instalación de koffi falla, el SDK puede funcionar en modo HTTP (si lo implementas)

## Troubleshooting

### Error: "Native library not found"

**Causa:** El paquete no incluye la biblioteca para la plataforma del usuario.

**Solución:** Publicar usando GitHub Actions para incluir todas las plataformas.

### Error: "permission denied: ./scripts/build-native.sh"

**Solución:**
```bash
chmod +x scripts/build-native.sh
```

### Build falla con "no C compiler"

**Solución:** Instala las herramientas de compilación:
- macOS: `xcode-select --install`
- Linux: `sudo apt-get install build-essential`
- Windows: Instala MinGW-w64

## Preguntas Frecuentes

**P: ¿Debo incluir las bibliotecas en git?**
R: No, las bibliotecas se construyen en tiempo de publicación. Solo versionamos el código fuente.

**P: ¿Puedo publicar desde mi Mac?**
R: Sí, pero solo incluirá bibliotecas de macOS. Usa GitHub Actions para soporte completo.

**P: ¿Qué pasa si un usuario está en una plataforma no soportada?**
R: El SDK mostrará un error claro indicando que la plataforma no está soportada.

**P: ¿Cómo actualizo la versión de Go del core?**
R: Actualiza `GetVersion()` en `core/src/main.go` para mantenerlo sincronizado con `package.json`.
