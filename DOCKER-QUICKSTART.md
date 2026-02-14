# 🐛 Guía Rápida: Levantar BugStore con Docker

## Opción 1: Inicio Rápido (Recomendado)

```bash
# 1. Construir la imagen Docker
docker build -t bugstore:latest .

# 2. Ejecutar el contenedor
docker run -d \
  --name bugstore \
  -p 8080:8080 \
  -e BUGSTORE_DIFFICULTY=0 \
  -e BUGSTORE_AUTO_SEED=true \
  bugstore:latest

# 3. Ver los logs
docker logs -f bugstore

# 4. Acceder a la aplicación
# Abre tu navegador en: http://localhost:8080
```

## Opción 2: Con Persistencia de Datos

```bash
# Crear un volumen para persistir la base de datos
docker volume create bugstore-data

# Ejecutar con volumen
docker run -d \
  --name bugstore \
  -p 8080:8080 \
  -e BUGSTORE_DIFFICULTY=0 \
  -e BUGSTORE_AUTO_SEED=true \
  -v bugstore-data:/data \
  bugstore:latest
```

## Opción 3: Con Docker Compose

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  bugstore:
    build: .
    container_name: bugstore
    ports:
      - "8080:8080"
    environment:
      - BUGSTORE_DIFFICULTY=0
      - BUGSTORE_AUTO_SEED=true
      - DATABASE_URL=sqlite:////data/bugstore.db
    volumes:
      - bugstore-data:/data
    restart: unless-stopped

volumes:
  bugstore-data:
```

Luego ejecuta:

```bash
docker-compose up -d
docker-compose logs -f
```

## Comandos Útiles

```bash
# Ver contenedores en ejecución
docker ps

# Detener BugStore
docker stop bugstore

# Iniciar BugStore
docker start bugstore

# Reiniciar BugStore
docker restart bugstore

# Ver logs en tiempo real
docker logs -f bugstore

# Acceder al contenedor (shell)
docker exec -it bugstore bash

# Eliminar el contenedor
docker stop bugstore
docker rm bugstore

# Eliminar la imagen
docker rmi bugstore:latest

# Limpiar todo (contenedor + volumen)
docker stop bugstore
docker rm bugstore
docker volume rm bugstore-data
```

## Variables de Entorno

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `BUGSTORE_DIFFICULTY` | 0 | Nivel de dificultad (0, 1, 2) |
| `BUGSTORE_AUTO_SEED` | false | Auto-poblar DB con datos de prueba |
| `BUGSTORE_WAF_ENABLED` | false | Activar WAF (solo Level 2) |
| `PORT` | 8080 | Puerto de la aplicación |
| `DATABASE_URL` | sqlite:////data/bugstore.db | URL de la base de datos |

## Niveles de Dificultad

### Level 0 (Recomendado para empezar)
```bash
docker run -d --name bugstore -p 8080:8080 \
  -e BUGSTORE_DIFFICULTY=0 \
  -e BUGSTORE_AUTO_SEED=true \
  bugstore:latest
```
- Sin protecciones
- Errores verbosos
- Endpoint de debug activo: `/api/debug/vulns`

### Level 1 (Intermedio)
```bash
docker run -d --name bugstore -p 8080:8080 \
  -e BUGSTORE_DIFFICULTY=1 \
  -e BUGSTORE_AUTO_SEED=true \
  bugstore:latest
```
- Filtros básicos
- Rate limiting: 100 req/min
- Errores genéricos

### Level 2 (Avanzado)
```bash
docker run -d --name bugstore -p 8080:8080 \
  -e BUGSTORE_DIFFICULTY=2 \
  -e BUGSTORE_WAF_ENABLED=true \
  -e BUGSTORE_AUTO_SEED=true \
  bugstore:latest
```
- WAF activo (OWASP CRS)
- CSP + HSTS
- Rate limiting: 30 req/min

## Verificación

Una vez que el contenedor esté corriendo:

```bash
# 1. Verificar que está corriendo
curl http://localhost:8080/

# 2. Ver vulnerabilidades (solo Level 0)
curl http://localhost:8080/api/debug/vulns | jq

# 3. Probar login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bugstore.local","password":"admin123"}'
```

## Acceso Web

- **Aplicación**: http://localhost:8080
- **Dashboard de Scoring**: http://localhost:8080/scoring
- **API Docs**: http://localhost:8080/docs (FastAPI Swagger)
- **Debug API**: http://localhost:8080/api/debug/vulns (solo Level 0)

## Credenciales por Defecto

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@bugstore.local | admin123 |
| Staff | carlos@bugstore.local | staff2024 |
| User | john@bugstore.local | password123 |
| User | jane@bugstore.local | ilovemantis |

## Solución de Problemas

### El contenedor no inicia
```bash
# Ver logs completos
docker logs bugstore

# Verificar que el puerto 8080 esté libre
sudo lsof -i :8080
```

### Resetear la base de datos
```bash
# Detener y eliminar contenedor
docker stop bugstore
docker rm bugstore

# Eliminar volumen
docker volume rm bugstore-data

# Volver a crear
docker run -d --name bugstore -p 8080:8080 \
  -e BUGSTORE_AUTO_SEED=true \
  -v bugstore-data:/data \
  bugstore:latest
```

### Error de construcción
```bash
# Limpiar caché de Docker
docker system prune -a

# Reconstruir sin caché
docker build --no-cache -t bugstore:latest .
```

## ⚠️ Advertencia de Seguridad

**NUNCA expongas este contenedor a internet**. Contiene 30 vulnerabilidades deliberadas:
- SQL Injection
- XSS (Reflected y Stored)
- Remote Code Execution (RCE)
- Server-Side Template Injection (SSTI)
- Insecure Deserialization
- Y 25 más...

**Solo para uso en entornos de prueba locales.**
