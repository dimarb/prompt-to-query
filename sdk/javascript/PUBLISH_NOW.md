# 🚀 Publicación Final - prompt-to-query

## Estado Actual

✅ **Paquete completamente preparado y listo**

- ✅ Tests pasando (4/4)
- ✅ Librería nativa incluida (6.1 MB)
- ✅ Autenticado en npm como `dimarborda`
- ⏳ Pendiente: Código OTP para publicación

## Paso Final: Publicar con OTP

Ejecuta este comando con tu código de autenticación de 6 dígitos:

```bash
cd /Users/dimarborda/2025/prompt-to-query/sdk/javascript
npm publish --access public --otp=XXXXXX
```

Reemplaza `XXXXXX` con el código actual de tu app de autenticación (Google Authenticator, Authy, etc.).

## Qué Incluye el Paquete

```
📦 prompt-to-query@1.0.0 (2.5 MB comprimido, 6.1 MB descomprimido)
├── README.md (8.4 kB)
├── lib/libprompttoquery.dylib (6.1 MB) ← Librería nativa
├── package.json (1.3 kB)
├── scripts/postinstall.js (4.1 kB)
├── src/index.d.ts (3.9 kB) ← TypeScript definitions
└── src/index.js (6.9 kB)
```

## Verificación Post-Publicación

Una vez publicado exitosamente, verifica con:

```bash
# Ver información del paquete
npm info prompt-to-query

# Instalar en un proyecto de prueba
mkdir test-install && cd test-install
npm init -y
npm install prompt-to-query

# Probar el paquete
node -e "const {PromptToQuery} = require('prompt-to-query'); console.log('✅ Instalado!');"
```

## Ejemplo de Uso para Usuarios

```javascript
const { PromptToQuery } = require('prompt-to-query');

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchemaPath: './schema.json'
});

const query = await ptq.generateQuery('Get all active users');
console.log(query);
```

## Post-Publicación Recomendada

### 1. Crear Git Tag

```bash
cd /Users/dimarborda/2025/prompt-to-query
git tag -a v1.0.0 -m "Release v1.0.0 - Initial npm release with koffi"
git push origin v1.0.0
```

### 2. Crear GitHub Release

1. Ir a: https://github.com/dimarborda/prompt-to-query/releases/new
2. Seleccionar tag: `v1.0.0`
3. Título: "v1.0.0 - Initial Release"
4. Descripción:

```markdown
# prompt-to-query v1.0.0

Primera versión pública del SDK JavaScript/Node.js para convertir lenguaje natural a queries de MongoDB usando IA.

## 🎉 Características

- ✅ Compatible con Node.js 14-22+
- ✅ Soporte para OpenAI (GPT-4, GPT-3.5) y Anthropic (Claude)
- ✅ Instalación sin compilación (usa koffi en lugar de ffi-napi)
- ✅ TypeScript definitions incluidas
- ✅ Librería nativa incluida para macOS (ARM64)
- ✅ Documentación completa

## 📦 Instalación

\`\`\`bash
npm install prompt-to-query
\`\`\`

## 🚀 Uso Rápido

\`\`\`javascript
const { PromptToQuery } = require('prompt-to-query');

const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchemaPath: './schema.json'
});

const query = await ptq.generateQuery('Get all active users');
console.log(query);
\`\`\`

## 📚 Documentación

- [README completo](https://github.com/dimarborda/prompt-to-query/blob/main/sdk/javascript/README.md)
- [Guía de publicación](https://github.com/dimarborda/prompt-to-query/blob/main/sdk/javascript/PUBLISHING.md)
- [Notas de migración](https://github.com/dimarborda/prompt-to-query/blob/main/sdk/javascript/MIGRATION.md)

## 🔧 Cambios Técnicos

- Migración de `ffi-napi` a `koffi` para mejor compatibilidad
- Inclusión de librerías nativas en el paquete
- Tests automatizados
- Script de post-instalación para verificación
\`\`\`

5. Publicar release

### 3. Anunciar en README Principal

Actualizar el README principal del proyecto para mencionar que el paquete está disponible en npm:

```markdown
## Instalación

### JavaScript/Node.js

\`\`\`bash
npm install prompt-to-query
\`\`\`
```

## 📊 Métricas para Seguimiento

Una vez publicado, puedes ver estadísticas en:

- **npm**: https://www.npmjs.com/package/prompt-to-query
- **npm stats**: https://npm-stat.com/charts.html?package=prompt-to-query
- **GitHub**: https://github.com/dimarborda/prompt-to-query

## 🐛 Si Algo Sale Mal

### Error: Package already exists

Si el nombre `prompt-to-query` ya está tomado:

```bash
# Opción 1: Usar scope
npm init --scope=@dimarborda
# Cambia el nombre en package.json a: "@dimarborda/prompt-to-query"

# Opción 2: Elegir otro nombre
# Edita package.json y cambia "name" a algo como:
# - "mongodb-prompt-query"
# - "natural-query-mongodb"
# - "llm-to-mongodb"
```

### Error: Library too large

Si npm rechaza el paquete por tamaño:

```bash
# Ver distribución de archivos
npm pack --dry-run

# El límite de npm es 10 MB, estamos en 2.5 MB, así que no debería haber problema
```

### Despublicar (solo primeras 72 horas)

```bash
npm unpublish prompt-to-query@1.0.0

# Mejor alternativa: deprecar
npm deprecate prompt-to-query@1.0.0 "Versión con bugs, usar 1.0.1"
```

## ✅ Checklist Final

Antes de publicar, verifica:

- [x] Tests pasando
- [x] Librería nativa incluida
- [x] package.json correcto
- [x] README completo
- [x] TypeScript definitions
- [x] .npmignore configurado
- [x] Autenticado en npm
- [ ] Código OTP listo
- [ ] `npm publish --access public --otp=XXXXXX`

---

**Preparado**: 2024-10-30
**Autor**: Dimar Borda
**Versión**: 1.0.0
