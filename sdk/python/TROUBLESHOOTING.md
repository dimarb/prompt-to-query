# Troubleshooting Guide - Python SDK Publishing

## Common Publishing Errors

### Error: 403 Forbidden - Invalid or non-existent authentication

```
HTTPError: 403 Forbidden from https://test.pypi.org/legacy/
Invalid or non-existent authentication information
```

**Causa:** Falta autenticación o token inválido.

**Solución:**

#### Opción 1: Usar token directamente en el comando

```bash
# Para Test PyPI
twine upload --repository testpypi dist/* -u __token__ -p pypi-YOUR_TEST_TOKEN

# Para PyPI
twine upload dist/* -u __token__ -p pypi-YOUR_PYPI_TOKEN
```

#### Opción 2: Configurar ~/.pypirc

1. Crea o edita `~/.pypirc`:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-YOUR_PYPI_TOKEN

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-YOUR_TEST_TOKEN
```

2. Protege el archivo:
```bash
chmod 600 ~/.pypirc
```

3. Ahora puedes usar:
```bash
twine upload --repository testpypi dist/*
twine upload dist/*
```

#### Opción 3: Dejar que twine pregunte

```bash
twine upload --repository testpypi dist/*
# Username: __token__
# Password: [pega tu token aquí]
```

**Importante:**
- El username SIEMPRE es `__token__` (literal)
- El password es tu token que empieza con `pypi-`
- Para Test PyPI usa `--repository testpypi`

---

## Error: Package already exists

```
HTTPError: 400 Bad Request from https://upload.pypi.org/legacy/
File already exists
```

**Causa:** Ya publicaste esa versión.

**Solución:** Incrementa el número de versión en:
- `setup.py`
- `pyproject.toml`
- `prompt_to_query/__init__.py`

```bash
# Ejemplo: cambiar de 1.0.0 a 1.0.1
# Luego rebuild
python -m build
twine upload dist/*
```

**Nota:** PyPI no permite sobrescribir versiones por seguridad.

---

## Error: Invalid distribution filename

```
HTTPError: 400 Bad Request
Invalid distribution filename
```

**Causa:** Nombre de archivo no cumple con PEP 440.

**Solución:**
1. Verifica que el nombre en `setup.py` no tenga caracteres especiales
2. Usa solo letras, números, guiones y guiones bajos
3. Rebuild el paquete

---

## Error: Missing required metadata

```
error: Missing required meta-data: name or version
```

**Causa:** Falta información en `setup.py` o `pyproject.toml`.

**Solución:**
1. Verifica que `name` y `version` estén definidos
2. Asegúrate de que sean consistentes entre archivos
3. Rebuild

---

## Warning: No files found matching

```
warning: no files found matching 'scripts/*.sh'
```

**Causa:** MANIFEST.in busca archivos que no existen.

**Solución:** Este es solo un warning, no afecta la publicación. Para eliminarlo:

```ini
# Edita MANIFEST.in y comenta o elimina:
# include scripts/*.sh
```

---

## Error: Library not found when importing

```
PromptToQueryError: Library not found for Darwin arm64
```

**Causa:** Los binarios no están en el paquete o en la ubicación correcta.

**Solución:**

1. Verifica que los binarios existan:
```bash
ls -lh prompt_to_query/lib/
```

2. Rebuild incluyendo binarios:
```bash
# Copia binarios si es necesario
cp ../../sdk/javascript/lib/*.dylib prompt_to_query/lib/
cp ../../sdk/javascript/lib/*.so prompt_to_query/lib/
cp ../../sdk/javascript/lib/*.dll prompt_to_query/lib/

# Rebuild
python -m build
```

3. Verifica que estén en el paquete:
```bash
python -m zipfile -l dist/*.whl | grep -E "\.so|\.dylib|\.dll"
```

---

## Error: Docker not found

```
❌ Docker not found. Install Docker to build for all platforms.
```

**Causa:** Docker no está instalado o no está en el PATH.

**Solución:**

1. Instala Docker Desktop:
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/engine/install/

2. Verifica instalación:
```bash
docker --version
```

3. Si solo quieres la plataforma actual:
```bash
python scripts/build-native.py  # sin --all
```

---

## Error: Module 'build' not found

```
No module named build
```

**Causa:** No tienes instaladas las herramientas de build.

**Solución:**

```bash
pip install --upgrade pip
pip install build twine setuptools wheel
```

---

## Error: README.md not found

```
error: [Errno 2] No such file or directory: 'README.md'
```

**Causa:** `pyproject.toml` referencia README que no existe en el directorio.

**Solución:**

1. Verifica que README.md existe:
```bash
ls -la README.md
```

2. Si usa path relativo incorrecto, edita `pyproject.toml`:
```toml
readme = "README.md"  # no "../../README.md"
```

---

## GitHub Actions Failures

### Build job fails

**Causa:** Error compilando binarios nativos.

**Solución:**
1. Revisa los logs en GitHub Actions
2. Verifica que el código Go compile localmente
3. Verifica que todas las dependencias estén disponibles

### Publish job fails - 403 Forbidden

**Causa:** Token de PyPI no configurado o inválido.

**Solución:**
1. Verifica que `PYPI_TOKEN` exista en GitHub Secrets
2. Regenera el token en PyPI si es necesario
3. Actualiza el secret en GitHub

### Artifacts not found

**Causa:** Job de build no completó correctamente.

**Solución:**
1. Verifica que todos los build jobs pasaron
2. Revisa logs de cada platform build
3. Verifica que los artifacts se subieron correctamente

---

## Build Warnings (Ignorables)

Estos warnings son normales y no afectan la funcionalidad:

```
SetuptoolsDeprecationWarning: `project.license` as a TOML table is deprecated
```
Esto se refiere a una nueva forma de especificar licencias. El paquete funciona bien.

```
warning: no previously-included files matching '__pycache__' found
```
Normal, significa que no hay archivos de cache para excluir.

```
Package 'prompt_to_query.lib' is absent from the packages configuration
```
Normal, `lib/` no es un paquete Python, solo contiene binarios.

---

## Verificación Pre-Publicación

Antes de publicar, verifica:

```bash
# 1. Build exitoso
python -m build

# 2. Twine check pasa
python -m twine check dist/*

# 3. Binarios incluidos
python -m zipfile -l dist/*.whl | grep -E "\.so|\.dylib|\.dll"

# 4. Instalación local funciona
pip install dist/*.whl
python -c "from prompt_to_query import PromptToQuery; print('OK')"

# 5. Versión correcta
python -c "from prompt_to_query import __version__; print(__version__)"
```

Si todos estos pasos pasan, estás listo para publicar.

---

## Obtener Ayuda

Si ninguna solución funciona:

1. **Revisa logs completos:** Busca el mensaje de error completo
2. **Consulta documentación oficial:**
   - PyPI: https://pypi.org/help/
   - Twine: https://twine.readthedocs.io/
   - Packaging: https://packaging.python.org/
3. **GitHub Issues:** https://github.com/dimarborda/prompt-to-query/issues

---

## Comandos Útiles de Diagnóstico

```bash
# Verificar instalación de herramientas
pip list | grep -E "build|twine|setuptools|wheel"

# Ver estructura del paquete
python -m zipfile -l dist/*.whl

# Ver metadata del paquete
python -m pip show prompt-to-query

# Limpiar y rebuild
make clean
python -m build

# Test de import
python -c "import prompt_to_query; print(dir(prompt_to_query))"

# Ver donde se instaló
python -c "import prompt_to_query; print(prompt_to_query.__file__)"
```
