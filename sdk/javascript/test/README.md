# Tests - PromptToQuery JavaScript SDK

Este directorio contiene los tests para el SDK de JavaScript.

## Ejecutar Tests

```bash
# Tests básicos (sin API keys)
npm test

# Tests con integración OpenAI
OPENAI_API_KEY=sk-... npm test

# Tests con integración Anthropic
ANTHROPIC_API_KEY=... npm test

# Tests con ambos proveedores
OPENAI_API_KEY=sk-... ANTHROPIC_API_KEY=... npm test
```

## Tipos de Tests

### Tests Básicos (Siempre se ejecutan)

1. **Module Loading**: Verifica que el módulo se carga correctamente
2. **Error Handling**: Verifica que los errores se manejan apropiadamente
3. **Constructor Validation**: Verifica validación de parámetros
4. **Library Detection**: Verifica que las librerías nativas estén disponibles

### Tests de Integración (Requieren API keys)

5. **OpenAI Integration**: Verifica inicialización con OpenAI
6. **Anthropic Integration**: Verifica inicialización con Anthropic
7. **Query Generation**: Verifica generación de queries (omitido por defecto para evitar costos)

## Estructura de Tests

```javascript
// test.js
const { PromptToQuery, PromptToQueryError } = require('../src/index.js');

test('test name', () => {
  // test implementation
});
```

## Agregar Nuevos Tests

Para agregar un nuevo test:

```javascript
test('should do something', () => {
  // Arrange
  const input = 'test input';

  // Act
  const result = someFunction(input);

  // Assert
  if (result !== expectedResult) {
    throw new Error('Test failed');
  }
});
```

## CI/CD

Los tests básicos deben pasar antes de publicar:

```json
{
  "scripts": {
    "prepublishOnly": "npm test"
  }
}
```

## Notas

- Los tests de integración están omitidos por defecto para evitar costos de API
- Los tests básicos no requieren conexión a internet
- Los tests verifican la funcionalidad core sin llamadas a LLMs reales
