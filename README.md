# Prompt to Query SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?logo=node.js&logoColor=white)](https://nodejs.org)

**Convierte lenguaje natural a queries de MongoDB usando IA**

SDK multiplataforma de alto rendimiento que traduce prompts en lenguaje natural a queries válidas de MongoDB usando Large Language Models (OpenAI GPT o Anthropic Claude).

---

## Características

- **Alto Rendimiento**: Core en Go compilado a librerías nativas (.so/.dll/.dylib)
- **Multiplataforma**: Soporta Linux, macOS y Windows (AMD64 y ARM64)
- **Multilenguaje**: SDKs para Python y JavaScript/Node.js
- **Múltiples LLMs**: Compatible con OpenAI (GPT-4, GPT-3.5) y Anthropic (Claude)
- **Type-Safe**: Validación de tipos basada en el esquema de la base de datos
- **Fácil de Usar**: API simple y consistente en todos los lenguajes

## Quick Start

```bash
# Clonar e instalar
git clone https://github.com/dimarborda/prompt-to-query.git
cd prompt-to-query
./scripts/setup.sh

# Configurar API key
export OPENAI_API_KEY="tu-key"

# Ejecutar ejemplo
python examples/python/example.py
```

Ver [QUICKSTART.md](QUICKSTART.md) para guía completa.

## 💼 Para Ejecutivos y Gerentes

¿Interesado en entender el valor de negocio de esta tecnología?

- 📊 **[Ver Ilustración Ejecutiva](docs/business-concept.svg)** - Concepto visual simple
- 📄 **[Resumen Ejecutivo](docs/EXECUTIVE_SUMMARY.md)** - Casos de uso, ROI y beneficios
- 🎯 **[Pitch de 1 Página](docs/ONE_PAGE_PITCH.md)** - Todo lo esencial en un vistazo

**TL;DR:** Pregunta a tus datos en lenguaje natural, obtén respuestas en segundos, toma mejores decisiones.

## Uso

### Python
```python
from prompt_to_query import PromptToQuery

# Inicializar con esquema de DB y API key
ptq = PromptToQuery(
    llm_provider="openai",  # o "anthropic"
    api_key="your-api-key",
    db_schema_path="schema.json"
)

# Convertir prompt a query
query = ptq.generate_query("Dame todos los usuarios activos del último mes")
print(query)  # {'find': 'users', 'filter': {'status': 'active', ...}}
```

### JavaScript
```javascript
const { PromptToQuery } = require('prompt-to-query');

// Inicializar
const ptq = new PromptToQuery({
  llmProvider: 'openai',  // o 'anthropic'
  apiKey: 'your-api-key',
  dbSchemaPath: 'schema.json'
});

// Convertir prompt a query
const query = await ptq.generateQuery('Dame todos los usuarios activos del último mes');
console.log(query);
```

## Arquitectura

```
┌─────────────────────────────────────────┐
│  Aplicación (Python/JavaScript)        │
│  └─ Ejecuta queries en MongoDB         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  SDK (Python/JavaScript)                │
│  └─ API de alto nivel                   │
└──────────────┬──────────────────────────┘
               │ FFI/ctypes/ffi-napi
┌──────────────▼──────────────────────────┐
│  Core Go (.so/.dll/.dylib)              │
│  ├─ Conexión LLM APIs                   │
│  ├─ Prompt engineering                  │
│  └─ Generación queries                  │
└─────────────────────────────────────────┘
```

Ver [ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles completos.

## Compilación

```bash
# Compilar para la plataforma actual
make build

# Compilar para todas las plataformas
make all

# Ver todas las opciones
make help
```

Ver [BUILD.md](docs/BUILD.md) para instrucciones detalladas de compilación y cross-compilation.

## Documentación

- [QUICKSTART.md](QUICKSTART.md) - Guía de inicio rápido (5 minutos)
- [USAGE.md](docs/USAGE.md) - Guía completa de uso
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Diseño del sistema
- [BUILD.md](docs/BUILD.md) - Instrucciones de compilación
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Estructura del proyecto
- [CHANGELOG.md](CHANGELOG.md) - Historial de versiones

## Ejemplos de Queries

| Prompt | Query Generada |
|--------|----------------|
| "Get all active users" | `{operation: "find", collection: "users", filter: {status: "active"}}` |
| "Count orders from last month" | `{operation: "count", collection: "orders", filter: {...}}` |
| "Top 10 products by sales" | `{operation: "find", collection: "products", sort: {sales: -1}, limit: 10}` |

Ver más ejemplos en [USAGE.md](docs/USAGE.md).

## Plataformas Soportadas

| OS | AMD64 | ARM64 |
|----|-------|-------|
| Linux | ✅ | ✅ |
| macOS | ✅ | ✅ |
| Windows | ✅ | ✅ |

## Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

MIT License - ver [LICENSE](LICENSE) para detalles

## Soporte

- **Issues**: [GitHub Issues](https://github.com/dimarborda/prompt-to-query/issues)
- **Documentación**: Carpeta `docs/`
- **Ejemplos**: Carpeta `examples/`

---

Hecho con ❤️ usando Go, Python y JavaScript
