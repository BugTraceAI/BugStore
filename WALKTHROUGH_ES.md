# BugStore - Guia de Vulnerabilidades

> **Esta es una guia basada en pistas.** Nunca encontraras payloads completos, comandos de ataque listos para copiar, ni soluciones paso a paso. El objetivo es orientarte para que aprendas haciendo.

## Antes de Empezar

### Requisitos

- BugStore corriendo en local (ver [README.md](README.md) para la instalacion)
- Un navegador moderno con DevTools (Chrome/Firefox recomendado)
- `curl` o un cliente HTTP (Postman, Insomnia, Burp Suite)
- Conocimientos basicos de HTTP, HTML y como funcionan las aplicaciones web
- Opcional: `sqlmap`, `hashcat`, `jwt_tool`, Python 3

### Cuentas de Prueba

Estas cuentas se crean cuando se inicializa la base de datos:

| Usuario | Password | Rol | Email |
|---------|----------|-----|-------|
| admin | admin123 | admin | admin@bugstore.com |
| staff | staff123 | staff | staff@bugstore.com |
| user | user123 | user | user@bugstore.com |
| hacker_pro | 123456 | user | hacker@darkweb.com |

### Puntuacion

| Tier | Dificultad | Puntos por vuln |
|------|-----------|-----------------|
| 1 | Facil | 1 pt |
| 2 | Medio | 2 pts |
| 3 | Dificil | 3 pts |

**Puntuacion maxima: 40 puntos** (11 + 20 + 9)

### Como Usar Esta Guia

Cada vulnerabilidad tiene **3 pistas progresivas** escondidas detras de secciones colapsables. Intenta encontrar la vulnerabilidad por tu cuenta primero. Si te atascas, abre la Pista 1. Aun atascado? Abre la Pista 2. La Pista 3 te acerca mucho pero nunca te da la respuesta.

> **Nota:** 3 vulnerabilidades del diseno original (V-015: SSRF, V-016: XXE, V-017: Carga de archivos sin restricciones) aun no estan implementadas. Esta guia cubre las **24 vulnerabilidades activas**.

---

## Referencia Rapida

| ID | Nombre | Tier | OWASP | Objetivo |
|----|--------|------|-------|----------|
| V-001 | Inyeccion SQL en Busqueda de Productos | 1 | A03:2021 - Inyeccion | `/api/products`, `/api/forum` |
| V-002 | XSS Reflejado en Busqueda | 1 | A03:2021 - Inyeccion | Catalogo de productos |
| V-003 | XSS Almacenado en Resenas | 1 | A03:2021 - Inyeccion | `/api/reviews` |
| V-005 | Redireccion Abierta | 1 | A01:2021 - Control de Acceso Roto | `/api/redirect` |
| V-008 | Configuracion Insegura de Cookies | 1 | A05:2021 - Configuracion Incorrecta | Todas las cookies |
| V-009 | IDOR en Pedidos | 1 | A01:2021 - Control de Acceso Roto | `/api/orders` |
| V-010 | IDOR en Perfiles de Usuario | 1 | A01:2021 - Control de Acceso Roto | Endpoints de datos de usuario |
| V-014 | Recorrido de Ruta (Path Traversal) | 1 | A01:2021 - Control de Acceso Roto | `/api/products/{id}/image` |
| V-019 | Validacion de Entrada Inadecuada | 1 | A03:2021 - Inyeccion | `/api/auth/register` |
| V-025 | Sin Limite de Peticiones | 1 | A05:2021 - Configuracion Incorrecta | Todos los endpoints |
| V-030 | Componentes Vulnerables | 1 | A06:2021 - Componentes Vulnerables | Librerias del frontend |
| V-004 | Inyeccion de Plantilla del Lado Cliente | 2 | A03:2021 - Inyeccion | Pagina del blog |
| V-006 | Hash de Contrasena Debil (MD5) | 2 | A02:2021 - Fallos Criptograficos | Sistema de autenticacion |
| V-007 | Contaminacion de Prototipo | 2 | A08:2021 - Fallos de Integridad | Catalogo del frontend |
| V-011 | JWT Debil y Confusion de Algoritmo | 2 | A07:2021 - Fallos de Identificacion | Autenticacion JWT |
| V-012 | Inyeccion SQL Ciega | 2 | A03:2021 - Inyeccion | `/api/products` filtros de precio |
| V-013 | Inyeccion SQL via Cookie | 2 | A03:2021 - Inyeccion | Endpoint raiz `/` |
| V-018 | Asignacion Masiva | 2 | A01:2021 - Control de Acceso Roto | Envio de resenas |
| V-020 | Divulgacion de Info via GraphQL | 2 | A01:2021 - Control de Acceso Roto | `/api/graphql` |
| V-023 | Manipulacion de Precios | 2 | A04:2021 - Diseno Inseguro | `/api/checkout` |
| V-028 | Control de Acceso Roto (Admin) | 2 | A01:2021 - Control de Acceso Roto | `/api/admin` |
| V-021 | RCE via Health Check | 3 | A03:2021 - Inyeccion | `/api/health` |
| V-026 | Deserializacion Insegura | 3 | A08:2021 - Fallos de Integridad | `/api/user/preferences` |
| V-027 | Inyeccion de Plantilla del Servidor (SSTI) | 3 | A03:2021 - Inyeccion | `/api/admin/email-preview` |

---

## Tier 1 - Facil (1 punto cada una)

---

### V-001: Inyeccion SQL en Busqueda de Productos

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Facil (1 pt) |
| **Objetivo** | `/api/products?search=...` y `/api/forum/threads` |
| **Herramientas** | Navegador, curl, sqlmap |

El catalogo de productos tiene una funcion de busqueda. El foro tambien tiene busqueda. Ambos construyen sus consultas a la base de datos de forma insegura.

<details>
<summary>Pista 1</summary>

Intenta escribir caracteres especiales en el campo de busqueda. Que pasa cuando incluyes caracteres que tienen significado en lenguajes de consulta de bases de datos?

</details>

<details>
<summary>Pista 2</summary>

El backend construye sus consultas insertando directamente tu texto de busqueda en la cadena SQL. Piensa en lo que hace una comilla simple en la sintaxis SQL. Tambien mira el endpoint de busqueda del foro -- tiene el mismo patron.

</details>

<details>
<summary>Pista 3</summary>

Si puedes romper la consulta con un caracter de comilla y la aplicacion muestra un error, has confirmado el punto de inyeccion. Ahora investiga sobre inyeccion SQL basada en UNION para extraer datos de otras tablas. La base de datos tiene una tabla `users` con columnas interesantes.

</details>

**Que aprendiste?** La inyeccion SQL ocurre cuando la entrada del usuario se concatena directamente en las consultas SQL. La solucion siempre es usar consultas parametrizadas o un ORM con parametros vinculados.

---

### V-002: XSS Reflejado en Resultados de Busqueda

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Facil (1 pt) |
| **Objetivo** | Interfaz de busqueda del catalogo |
| **Herramientas** | DevTools del navegador |

Cuando buscas productos, el termino de busqueda se muestra de vuelta en la pagina. Pero como se muestra?

<details>
<summary>Pista 1</summary>

Busca algo que parezca HTML. La pagina lo renderiza como texto plano, o el navegador lo interpreta como HTML real?

</details>

<details>
<summary>Pista 2</summary>

El frontend usa una funcion de React que elude su proteccion integrada contra XSS. Mira como el componente de resultados renderiza el termino de busqueda. La palabra "dangerously" (peligrosamente) podria aparecer en el codigo fuente.

</details>

<details>
<summary>Pista 3</summary>

Si el navegador interpreta tu HTML, intenta usar una etiqueta de imagen con un manejador de error. Estos ejecutan JavaScript cuando la imagen no carga. Que podria robar un atacante con JavaScript ejecutandose en el navegador del usuario?

</details>

**Que aprendiste?** El XSS reflejado ocurre cuando la entrada del usuario se devuelve en la respuesta sin codificacion adecuada. En React, `dangerouslySetInnerHTML` es la via de escape que elude las protecciones por defecto.

---

### V-003: XSS Almacenado en Resenas

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Facil (1 pt) |
| **Objetivo** | Envio de resenas (`/api/reviews`) |
| **Herramientas** | Navegador, curl |

Las resenas de productos pueden incluir comentarios de texto. Se sanitizan esos comentarios antes de almacenarse y mostrarse a otros usuarios?

<details>
<summary>Pista 1</summary>

Envia una resena en cualquier producto. Incluye algo de HTML en el texto del comentario. Despues de enviarla, verifica si el HTML aparece como markup renderizado o como texto plano al ver el producto.

</details>

<details>
<summary>Pista 2</summary>

El componente de resenas tambien usa la funcion peligrosa de React que renderiza HTML crudo. Lo que escribas en tu comentario se guarda en la base de datos tal cual, y luego se muestra a cada usuario que vea ese producto.

</details>

<details>
<summary>Pista 3</summary>

A diferencia del XSS reflejado, este es persistente -- tu payload se ejecuta cada vez que alguien ve la pagina del producto. Piensa en que pasa cuando un administrador del sitio ve un producto con una resena maliciosa. Mira los datos de seed para un ejemplo de un payload XSS ya plantado en la base de datos.

</details>

**Que aprendiste?** El XSS almacenado es mas peligroso que el reflejado porque el payload persiste y afecta a cada usuario que ve la pagina. Siempre sanitiza el contenido generado por usuarios en el lado del servidor.

---

### V-005: Redireccion Abierta

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Facil (1 pt) |
| **Objetivo** | `/api/redirect?url=...` |
| **Herramientas** | Navegador, curl |

La aplicacion tiene un endpoint de redireccion. Su proposito es redirigir a los usuarios a otra URL. Pero valida a donde te envia?

<details>
<summary>Pista 1</summary>

Intenta llamar al endpoint de redireccion con una URL de un dominio externo. Te redirige ahi sin ningun control?

</details>

<details>
<summary>Pista 2</summary>

No hay lista blanca de dominios permitidos ni validacion del esquema de la URL. El endpoint redirige ciegamente a lo que le pases. Piensa en como esto podria usarse en una campana de phishing.

</details>

<details>
<summary>Pista 3</summary>

Un atacante podria crear un enlace como `http://bugstore.com/api/redirect?url=https://sitio-malicioso.com/login-falso` y enviarlo a usuarios. El enlace parece legitimo porque empieza con el dominio de confianza. Podrias tambien usar otros esquemas de URL ademas de http/https?

</details>

**Que aprendiste?** Las redirecciones abiertas permiten a los atacantes abusar de un dominio de confianza para phishing. La solucion es validar las URLs de destino contra una lista blanca de dominios permitidos.

---

### V-008: Configuracion Insegura de Cookies

| | |
|---|---|
| **OWASP** | A05:2021 - Configuracion Incorrecta de Seguridad |
| **Tier** | Facil (1 pt) |
| **Objetivo** | Todas las cookies de la aplicacion |
| **Herramientas** | DevTools del navegador (pestana Application) |

Las cookies llevan datos sensibles como identificadores de sesion. La seguridad de las cookies depende mucho de los flags con los que se crean.

<details>
<summary>Pista 1</summary>

Abre DevTools, ve a la pestana Application (o Storage) e inspecciona las cookies. Mira los flags de cada cookie: HttpOnly, Secure, SameSite.

</details>

<details>
<summary>Pista 2</summary>

Si una cookie no tiene el flag `HttpOnly`, puede ser leida por JavaScript en el navegador. Si no tiene `Secure`, puede transmitirse por HTTP sin encriptar. Si no tiene `SameSite`, es vulnerable a Cross-Site Request Forgery.

</details>

<details>
<summary>Pista 3</summary>

Revisa la cookie `user_prefs` y las cookies de tracking. Ninguna tiene flags de seguridad adecuados. Intenta acceder a las cookies desde la consola del navegador usando `document.cookie`. Si existe una vulnerabilidad XSS (que la hay), un atacante podria robar estas cookies.

</details>

**Que aprendiste?** Las cookies siempre deben configurarse con `HttpOnly` (sin acceso por JS), `Secure` (solo HTTPS) y `SameSite` (proteccion CSRF). Los flags faltantes son una mala configuracion comun.

---

### V-009: IDOR en Pedidos

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Facil (1 pt) |
| **Objetivo** | `/api/orders/{id}` y `/api/orders/` |
| **Herramientas** | Navegador, curl |

El endpoint de pedidos te permite ver los detalles de un pedido. Pero verifica quien esta preguntando?

<details>
<summary>Pista 1</summary>

Inicia sesion como cualquier usuario y accede a tus pedidos. Luego intenta cambiar el ID del pedido en la URL a un numero diferente. Puedes ver el pedido de otra persona?

</details>

<details>
<summary>Pista 2</summary>

El endpoint acepta un ID de pedido y devuelve todos los detalles -- incluyendo direcciones de envio e informacion personal -- sin verificar que el pedido pertenezca al usuario solicitante. Ni siquiera necesitas estar logueado.

</details>

<details>
<summary>Pista 3</summary>

Prueba el endpoint de lista (`/api/orders/`) sin ninguna autenticacion. Tambien intenta pasar `?user_id=1` u otros IDs de usuario. La API no tiene ningun control de propiedad. Enumera los IDs de pedidos empezando desde 1 para ver todos los pedidos del sistema.

</details>

**Que aprendiste?** IDOR (Referencia Directa Insegura a Objetos) ocurre cuando una aplicacion usa entrada del usuario para acceder a objetos sin verificar autorizacion. Siempre verifica que el usuario solicitante es el dueno del recurso.

---

### V-010: IDOR en Perfiles de Usuario

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Facil (1 pt) |
| **Objetivo** | Puntos de acceso a datos de usuario |
| **Herramientas** | curl, navegador |

Los perfiles de usuario contienen informacion sensible como emails y roles. Puedes acceder a los datos de otros usuarios sin autorizacion?

<details>
<summary>Pista 1</summary>

La API REST tiene un endpoint de perfil. Pero hay otra API en la aplicacion que tambien expone datos de usuario? Piensa en que tecnologias usa la app ademas de REST.

</details>

<details>
<summary>Pista 2</summary>

La aplicacion tiene mas de un paradigma de API. Uno de ellos esta disenado para consultas flexibles y devuelve datos de usuario sin requerir autenticacion. Mira las rutas de API registradas en la aplicacion principal.

</details>

<details>
<summary>Pista 3</summary>

Hay un endpoint GraphQL. Expone una consulta `users` que devuelve todos los usuarios con sus IDs, nombres de usuario, emails y roles. No requiere autenticacion. Tambien tiene una mutacion que puede modificar datos de usuario para cualquier ID.

</details>

**Que aprendiste?** Las vulnerabilidades IDOR pueden existir en multiples superficies de API. Cuando una aplicacion tiene endpoints REST y GraphQL, cada uno necesita sus propias verificaciones de autorizacion.

---

### V-014: Recorrido de Ruta (Path Traversal)

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Facil (1 pt) |
| **Objetivo** | `/api/products/{id}/image?file=...` |
| **Herramientas** | curl, navegador |

Las imagenes de productos se sirven a traves de un endpoint de la API que toma un parametro de nombre de archivo. Como se usa ese nombre internamente?

<details>
<summary>Pista 1</summary>

Mira como se cargan las imagenes de productos. La URL incluye un parametro `file` con el nombre del archivo de imagen. Que pasa si cambias ese nombre?

</details>

<details>
<summary>Pista 2</summary>

El backend une el parametro `file` directamente a una ruta de directorio sin sanitizarlo. Hay secuencias de caracteres especiales que te permiten navegar hacia arriba en el arbol de directorios.

</details>

<details>
<summary>Pista 3</summary>

Usa secuencias de punto-punto-barra (`../`) en el parametro `file` para escapar del directorio de imagenes. Sabiendo que la aplicacion esta hecha en Python (FastAPI), piensa en que archivos interesantes podrias leer: codigo fuente de la aplicacion, archivos de configuracion, o incluso el archivo de la base de datos.

</details>

**Que aprendiste?** El path traversal ocurre cuando la entrada del usuario se usa para construir rutas de archivo sin sanitizacion. Siempre valida y sanitiza las rutas de archivo, y usa `os.path.normpath()` con verificaciones del directorio base.

---

### V-019: Validacion de Entrada Inadecuada

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Facil (1 pt) |
| **Objetivo** | `/api/auth/register` |
| **Herramientas** | curl, navegador |

Al crear una cuenta nueva, el endpoint de registro acepta un nombre de usuario. Pero hay restricciones sobre que caracteres acepta?

<details>
<summary>Pista 1</summary>

Intenta registrar un usuario con caracteres inusuales en el nombre de usuario: etiquetas HTML, sintaxis SQL, o cadenas muy largas. La aplicacion rechaza alguno?

</details>

<details>
<summary>Pista 2</summary>

No hay validacion del lado del servidor en el campo de nombre de usuario. Acepta HTML, metacaracteres SQL y cualquier Unicode. Esto no causa un exploit inmediato por si solo, pero crea vectores de inyeccion almacenados.

</details>

<details>
<summary>Pista 3</summary>

Donde sea que el nombre de usuario se muestre despues (publicaciones del foro, resenas, panel de admin), el contenido inyectado podria ser renderizado. Piensa en esto como un punto de inyeccion secundario -- el registro es la entrada, pero el impacto ocurre en otro lugar.

</details>

**Que aprendiste?** La validacion de entrada debe ocurrir en cada punto de entrada. Aunque un campo no cause un exploit directamente, almacenar datos sin validar crea riesgos donde sea que esos datos se muestren o procesen despues.

---

### V-025: Sin Limite de Peticiones (Rate Limiting)

| | |
|---|---|
| **OWASP** | A05:2021 - Configuracion Incorrecta de Seguridad |
| **Tier** | Facil (1 pt) |
| **Objetivo** | Todos los endpoints (Level 0) |
| **Herramientas** | curl, Burp Suite Intruder |

Cuantas peticiones puedes enviar por segundo al endpoint de login? Hay algun limite?

<details>
<summary>Pista 1</summary>

Intenta enviar multiples peticiones rapidas al endpoint de login con diferentes passwords. La aplicacion alguna vez te frena o te bloquea?

</details>

<details>
<summary>Pista 2</summary>

En el nivel de dificultad 0, no hay absolutamente ningun rate limiting. Puedes enviar miles de peticiones por minuto sin ninguna limitacion. Esto hace que los ataques de fuerza bruta sean triviales.

</details>

<details>
<summary>Pista 3</summary>

El endpoint de login devuelve respuestas diferentes para credenciales validas vs invalidas, lo que permite enumeracion de cuentas. Combinado con la falta de rate limiting, un atacante podria ejecutar un ataque de diccionario. Intenta usar una lista de passwords comunes contra direcciones de email conocidas.

</details>

**Que aprendiste?** El rate limiting es esencial para proteger endpoints de autenticacion. Sin el, los ataques de fuerza bruta, credential stuffing y denegacion de servicio se vuelven triviales.

---

### V-030: Uso de Componentes Vulnerables

| | |
|---|---|
| **OWASP** | A06:2021 - Componentes Vulnerables y Desactualizados |
| **Tier** | Facil (1 pt) |
| **Objetivo** | Librerias JavaScript del frontend |
| **Herramientas** | Navegador (Ver Codigo Fuente), npm audit, retire.js |

Las aplicaciones web modernas dependen de librerias de terceros. Estan todas las librerias de BugStore actualizadas?

<details>
<summary>Pista 1</summary>

Ve el codigo fuente de la pagina o inspecciona los archivos JavaScript cargados. Busca numeros de version en comentarios o nombres de archivo. Revisa el directorio `legacy/` en particular.

</details>

<details>
<summary>Pista 2</summary>

La aplicacion incluye algunas librerias JavaScript legacy que tienen varios anos de antiguedad. Busca jQuery, Lodash y AngularJS. Cada una de estas versiones antiguas tiene CVEs conocidos (Vulnerabilidades y Exposiciones Comunes).

</details>

<details>
<summary>Pista 3</summary>

Busca especificamente: jQuery 2.1.4 (CVE-2015-9251), Lodash 4.17.15 (CVE-2019-10744 -- prototype pollution), y Angular 1.7.7 (CVE-2020-7676). Cruza las versiones que encuentres con la NVD (Base de Datos Nacional de Vulnerabilidades) o usa herramientas como `retire.js` para deteccion automatizada.

</details>

**Que aprendiste?** Siempre manten las dependencias actualizadas y auditalas regularmente. Herramientas como `npm audit`, `retire.js` y Dependabot pueden detectar automaticamente vulnerabilidades conocidas en tus dependencias.

---

## Tier 2 - Medio (2 puntos cada una)

---

### V-004: Inyeccion de Plantilla del Lado Cliente (Angular)

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Medio (2 pts) |
| **Objetivo** | Pagina del blog |
| **Herramientas** | Navegador |

La pagina del blog tiene un widget legacy construido con un framework JavaScript antiguo. Acepta entrada a traves de un parametro de URL.

<details>
<summary>Pista 1</summary>

Visita la pagina del blog y mira el codigo fuente HTML. Hay un widget en la barra lateral impulsado por un framework JavaScript muy conocido. Este widget lee un parametro de la URL.

</details>

<details>
<summary>Pista 2</summary>

El widget esta construido con AngularJS 1.x. Lee un parametro `legacy_q` de la URL y lo renderiza usando `trustAsHtml`. AngularJS 1.x tiene su propia sintaxis de expresiones de plantilla usando dobles llaves.

</details>

<details>
<summary>Pista 3</summary>

Las expresiones de AngularJS dentro de dobles llaves se evaluan en el contexto de Angular. En versiones antiguas (antes de que el sandbox estuviera bien asegurado), podias escapar del sandbox para ejecutar JavaScript arbitrario. Investiga "AngularJS sandbox escape" para la version 1.7.x.

</details>

**Que aprendiste?** La inyeccion de plantilla del lado cliente ocurre cuando los frameworks evaluan expresiones controladas por el usuario. Los frameworks JavaScript legacy son especialmente peligrosos porque sus mecanismos de sandbox frecuentemente eran vulnerables.

---

### V-006: Hash de Contrasena Debil (MD5)

| | |
|---|---|
| **OWASP** | A02:2021 - Fallos Criptograficos |
| **Tier** | Medio (2 pts) |
| **Objetivo** | Sistema de autenticacion |
| **Herramientas** | hashcat, john, CrackStation |

La aplicacion almacena las contrasenas de los usuarios como hashes. Pero no todos los algoritmos de hash son iguales.

<details>
<summary>Pista 1</summary>

Si puedes extraer datos de la base de datos (a traves de otras vulnerabilidades), mira los hashes de contrasena. En que formato estan? Que tan largos son? Tienen un salt anadido?

</details>

<details>
<summary>Pista 2</summary>

Los hashes tienen 32 caracteres hexadecimales y no tienen salt. Este es un algoritmo de hash muy conocido que se considera completamente roto para almacenamiento de contrasenas. Existen bases de datos completas de hashes pre-calculados en internet.

</details>

<details>
<summary>Pista 3</summary>

La aplicacion usa MD5 sin ningun salt. Puedes identificar hashes MD5 por su longitud de 32 caracteres hex. Intenta pegar el hash en una base de datos online como CrackStation, o usa hashcat con modo 0 y un wordlist comun como rockyou.txt.

</details>

**Que aprendiste?** MD5 no es adecuado para hashear contrasenas. Es rapido (lo cual es malo para contrasenas), no tiene salt integrado, y existen miles de millones de hashes pre-calculados. Usa bcrypt, scrypt o Argon2 para almacenamiento de contrasenas.

---

### V-007: Contaminacion de Prototipo (Prototype Pollution)

| | |
|---|---|
| **OWASP** | A08:2021 - Fallos de Integridad de Software y Datos |
| **Tier** | Medio (2 pts) |
| **Objetivo** | Catalogo de productos del frontend |
| **Herramientas** | DevTools del navegador |

El catalogo de productos acepta parametros de filtro desde la URL. Esos parametros se parsean y se fusionan en objetos en el frontend.

<details>
<summary>Pista 1</summary>

Mira los parametros de URL que acepta la pagina del catalogo. Hay un parametro `filter` que acepta JSON. Encuentra el codigo JavaScript que procesa este filtro.

</details>

<details>
<summary>Pista 2</summary>

El frontend tiene una funcion `deepMerge()` que fusiona objetos recursivamente. No protege contra nombres de propiedades especiales de JavaScript que pueden modificar la cadena de prototipos de todos los objetos.

</details>

<details>
<summary>Pista 3</summary>

En JavaScript, cada objeto hereda de `Object.prototype`. Si puedes establecer una propiedad en `__proto__`, se vuelve disponible en TODOS los objetos de la aplicacion. Piensa en que propiedades la aplicacion verifica para autorizacion (como `isAdmin`) e intenta establecerlas a traves de la cadena de prototipos via el parametro de filtro.

</details>

**Que aprendiste?** La contaminacion de prototipo es una vulnerabilidad especifica de JavaScript donde un atacante modifica `Object.prototype`, afectando a todos los objetos. Siempre filtra claves como `__proto__`, `constructor` y `prototype` al fusionar objetos controlados por el usuario.

---

### V-011: JWT Debil y Confusion de Algoritmo

| | |
|---|---|
| **OWASP** | A07:2021 - Fallos de Identificacion y Autenticacion |
| **Tier** | Medio (2 pts) |
| **Objetivo** | Tokens de autenticacion JWT |
| **Herramientas** | jwt.io, jwt_tool, Python |

La aplicacion usa JSON Web Tokens (JWT) para autenticacion. Pero la seguridad de un JWT depende de su secreto y los algoritmos que acepta.

<details>
<summary>Pista 1</summary>

Despues de iniciar sesion, mira tu token de autenticacion. Es un JWT -- puedes decodificarlo en jwt.io sin saber el secreto. Examina el header y el payload. Que algoritmo se esta usando?

</details>

<details>
<summary>Pista 2</summary>

El secreto de firma no es criptograficamente aleatorio -- es una cadena adivinable relacionada con el nombre de la aplicacion y el ano. Herramientas como `jwt_tool` pueden hacer fuerza bruta a secretos debiles. Tambien mira que algoritmos acepta el servidor durante la verificacion.

</details>

<details>
<summary>Pista 3</summary>

El servidor acepta el algoritmo `"none"` durante la verificacion de tokens, lo que significa que tokens sin firma podrian ser aceptados. Ademas, el secreto sigue un patron predecible: piensa en nombre de la app + guion bajo + palabra clave + guion bajo + ano. Si puedes falsificar un token con `"role": "admin"`, obtienes acceso de administrador.

</details>

**Que aprendiste?** La seguridad de JWT depende de: (1) secretos fuertes y aleatorios (32+ bytes), (2) validacion estricta de algoritmo (nunca aceptar `"none"`), y (3) verificacion adecuada de claims. JWTs debiles equivalen a no tener autenticacion.

---

### V-012: Inyeccion SQL Ciega

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Medio (2 pts) |
| **Objetivo** | `/api/products?min_price=...&max_price=...` |
| **Herramientas** | curl, sqlmap, Python |

El catalogo de productos tiene filtros de precio. A diferencia del campo de busqueda (V-001), estos no devuelven errores SQL visibles. Pero son seguros?

<details>
<summary>Pista 1</summary>

Los parametros de filtro de precio esperan valores numericos, pero que pasa si envias sintaxis SQL no numerica? Los resultados no mostraran un error directo en la respuesta, pero el comportamiento podria cambiar.

</details>

<details>
<summary>Pista 2</summary>

Esta es una inyeccion SQL ciega -- los resultados no contienen los datos extraidos directamente. En su lugar, necesitas inferir informacion basandote en el comportamiento de la aplicacion: cambia la respuesta segun una condicion verdadero/falso? O cambia el tiempo de respuesta?

</details>

<details>
<summary>Pista 3</summary>

Intenta expresiones condicionales en el parametro de precio. Puedes usar funciones especificas de la base de datos para introducir retrasos cuando una condicion es verdadera (inyeccion ciega basada en tiempo). Extrae datos un caracter a la vez verificando condiciones contra el contenido de la base de datos. Herramientas como `sqlmap` pueden automatizar este proceso.

</details>

**Que aprendiste?** La inyeccion SQL ciega es mas dificil de explotar pero igual de peligrosa que la visible. La solucion es la misma: consultas parametrizadas. Herramientas automatizadas como sqlmap pueden detectar y explotar puntos de inyeccion ciega eficientemente.

---

### V-013: Inyeccion SQL via Cookie

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Medio (2 pts) |
| **Objetivo** | Endpoint raiz (`/`), cookie TrackingId |
| **Herramientas** | DevTools del navegador, curl, Burp Suite |

No todos los puntos de inyeccion estan en parametros de URL o campos de formulario. A veces se esconden en cabeceras HTTP o cookies.

<details>
<summary>Pista 1</summary>

Cuando visitas la URL raiz de la aplicacion, se establece automaticamente una cookie en tu navegador. Inspecciona tus cookies y encuentra una que parezca codificada (no texto plano). Que codificacion esta usando?

</details>

<details>
<summary>Pista 2</summary>

La cookie `TrackingId` esta codificada en Base64. Cuando el servidor la recibe, decodifica el valor y lo usa en una consulta SQL. La consulta se ejecuta silenciosamente en segundo plano -- no veras errores, pero el punto de inyeccion es real.

</details>

<details>
<summary>Pista 3</summary>

Crea tu propio valor, codificalo en Base64, y establecelo como la cookie `TrackingId`. El valor decodificado se inserta en una consulta SQL que busca en la tabla `products`. Como el resultado de la consulta no se te muestra, este es otro punto de inyeccion ciega -- usa tecnicas basadas en tiempo u observa diferencias de comportamiento.

</details>

**Que aprendiste?** La inyeccion SQL puede ocurrir a traves de cualquier entrada controlada por el usuario, incluyendo cookies, cabeceras HTTP y otros canales inesperados. Nunca confies en ningun dato del cliente, sin importar como llega.

---

### V-018: Asignacion Masiva (Mass Assignment)

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Medio (2 pts) |
| **Objetivo** | Envio de resenas (`/api/reviews`) |
| **Herramientas** | curl, Burp Suite |

Cuando envias datos a una API, que pasa si incluyes campos extra que el formulario normalmente no envia?

<details>
<summary>Pista 1</summary>

El formulario de envio de resenas solo muestra campos para puntuacion y comentario. Pero que campos acepta realmente la API? Intenta enviar claves JSON adicionales en tu peticion POST que no sean parte del formulario normal.

</details>

<details>
<summary>Pista 2</summary>

El modelo de la API de resenas define un campo que controla si una resena se publica inmediatamente o requiere moderacion. El frontend no expone este campo, pero el backend lo acepta si lo incluyes en tu peticion.

</details>

<details>
<summary>Pista 3</summary>

Al enviar una resena, anade `"is_approved": true` a tu payload JSON. El backend confia ciegamente en este campo, permitiendote saltarte el sistema de moderacion de resenas. Piensa en que otros endpoints de la API podrian aceptar campos inesperados -- el endpoint de perfil tambien vale la pena investigar.

</details>

**Que aprendiste?** La asignacion masiva ocurre cuando una API vincula datos de la peticion directamente a objetos internos sin filtrar. Siempre define explicitamente que campos pueden ser actualizados por los usuarios.

---

### V-020: Divulgacion de Informacion via GraphQL e IDOR

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Medio (2 pts) |
| **Objetivo** | `/api/graphql` |
| **Herramientas** | Navegador, curl, GraphQL Playground |

La aplicacion tiene una API GraphQL junto a su API REST. GraphQL es poderoso, pero requiere un control de acceso cuidadoso.

<details>
<summary>Pista 1</summary>

Visita el endpoint GraphQL en tu navegador. Muchas implementaciones de GraphQL incluyen un explorador interactivo (GraphiQL). Si esta disponible, usalo para descubrir que consultas y mutaciones hay disponibles. Si no, intenta enviar una consulta de introspeccion.

</details>

<details>
<summary>Pista 2</summary>

Los resolvers de GraphQL no tienen ninguna verificacion de autenticacion. Cualquier consulta o mutacion puede ser ejecutada por cualquiera. Intenta consultar todos los usuarios o todos los pedidos -- obtendras resultados completos incluyendo campos sensibles como emails y roles.

</details>

<details>
<summary>Pista 3</summary>

Mas alla de leer datos, mira las mutaciones disponibles. Hay una mutacion que puede modificar datos de usuario para cualquier ID. Puedes cambiar la informacion de perfil de cualquier usuario sin estar logueado. Esta es una vulnerabilidad IDOR a traves de la API GraphQL.

</details>

**Que aprendiste?** Las APIs GraphQL necesitan el mismo control de acceso que las APIs REST. Cada resolver debe verificar autenticacion y autorizacion. La introspeccion deberia estar deshabilitada en produccion.

---

### V-023: Manipulacion de Precios (Cliente de Confianza)

| | |
|---|---|
| **OWASP** | A04:2021 - Diseno Inseguro |
| **Tier** | Medio (2 pts) |
| **Objetivo** | `/api/checkout/process` |
| **Herramientas** | DevTools del navegador (pestana Network), curl, Burp Suite |

El proceso de checkout implica calcular un precio total y enviar el pedido. Pero quien calcula el total?

<details>
<summary>Pista 1</summary>

Anade algunos articulos al carrito y procede al checkout. Abre la pestana Network en DevTools e intercepta la peticion de checkout. Examina el payload JSON enviado al servidor. Hay un campo `total`?

</details>

<details>
<summary>Pista 2</summary>

El frontend calcula el total y lo envia al backend en la peticion de checkout. El backend usa este total proporcionado por el cliente directamente al crear el pedido, en lugar de calcularlo a partir de los articulos del carrito en el servidor.

</details>

<details>
<summary>Pista 3</summary>

Intercepta la peticion de checkout y modifica el campo `total` a una cantidad mucho menor (como 0.01). El servidor creara el pedido con tu total modificado sin problemas. Esta es una vulnerabilidad clasica de "cliente de confianza" donde la logica de negocio se implementa solo en el lado del cliente.

</details>

**Que aprendiste?** Nunca confies en calculos del lado del cliente para operaciones sensibles. Precios, totales, descuentos y cualquier valor critico del negocio deben calcularse y validarse en el servidor.

---

### V-028: Control de Acceso Roto (Endpoints de Admin)

| | |
|---|---|
| **OWASP** | A01:2021 - Control de Acceso Roto |
| **Tier** | Medio (2 pts) |
| **Objetivo** | `/api/admin/*` |
| **Herramientas** | curl, navegador |

El area de administracion tiene varios endpoints. Estan todos debidamente protegidos?

<details>
<summary>Pista 1</summary>

La mayoria de los endpoints de admin requieren autenticacion y verificacion de rol. Pero los desarrolladores a veces olvidan proteger los endpoints de debug o diagnostico. Intenta descubrir rutas admin mas alla de las visibles en la interfaz.

</details>

<details>
<summary>Pista 2</summary>

Hay un endpoint de debug bajo el prefijo admin que no tiene ningun middleware de autenticacion. Devuelve informacion sensible incluyendo direcciones de email. El nombre del endpoint es descriptivo -- te dice que es vulnerable directamente en su URL.

</details>

<details>
<summary>Pista 3</summary>

Intenta acceder a `/api/admin/vulnerable-debug-stats` sin ningun token de autenticacion. Devuelve emails de administradores y estadisticas internas. Comparalo con otros endpoints de admin como `/api/admin/stats` que si requiere autenticacion. Este es un patron comun: endpoints de debug dejados sin proteccion en produccion.

</details>

**Que aprendiste?** El control de acceso debe ser consistente en TODOS los endpoints. Los endpoints de debug y diagnostico frecuentemente se olvidan durante las revisiones de seguridad. En produccion, deben eliminarse por completo o protegerse con la misma autenticacion que otros endpoints de admin.

---

## Tier 3 - Dificil (3 puntos cada una)

---

### V-021: Ejecucion Remota de Codigo (RCE) via Health Check

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Dificil (3 pts) |
| **Objetivo** | `/api/health` |
| **Herramientas** | curl (con token de admin) |

El endpoint de health check parece inocente. Pero acepta algun parametro?

<details>
<summary>Pista 1</summary>

Visita el endpoint de health normalmente -- devuelve el estado del sistema. Ahora mira que parametros de consulta acepta. Hay un parametro opcional que no esta documentado en la interfaz. Necesitaras acceso de admin para usarlo.

</details>

<details>
<summary>Pista 2</summary>

El endpoint tiene un parametro `cmd` que solo es accesible con privilegios de admin. Si ya obtuviste acceso de admin a traves de otras vulnerabilidades (V-011, V-018, o la cadena de ataque V-001 -> V-006), puedes usar este parametro. El valor del parametro se pasa a una funcion del sistema.

</details>

<details>
<summary>Pista 3</summary>

El valor del parametro `cmd` se pasa directamente al `subprocess` de Python con `shell=True`. Esto significa que el servidor ejecuta cualquier comando del sistema que envies. Esto es Ejecucion Remota de Codigo completa -- la clase de vulnerabilidad mas critica. Primero, encadena otras vulnerabilidades para obtener acceso de admin, luego usa este endpoint.

</details>

**Que aprendiste?** RCE (Ejecucion Remota de Codigo) es la vulnerabilidad de mayor severidad. Nunca pases entrada del usuario a comandos del sistema. Usa APIs seguras en lugar de ejecucion de shell, y siempre valida la entrada contra una lista blanca. Esta vulnerabilidad tambien demuestra como funcionan las cadenas de ataque: primero necesitas acceso de admin.

---

### V-026: Deserializacion Insegura (Pickle)

| | |
|---|---|
| **OWASP** | A08:2021 - Fallos de Integridad de Software y Datos |
| **Tier** | Dificil (3 pts) |
| **Objetivo** | `/api/user/preferences` |
| **Herramientas** | Python, curl |

El sistema de preferencias de usuario usa cookies para almacenar y recuperar configuraciones. Pero como se serializan esas configuraciones?

<details>
<summary>Pista 1</summary>

Establece tus preferencias a traves de la API, luego inspecciona la cookie `user_prefs`. Esta codificada en Base64. Decodificala -- en que formato estan los datos? No es JSON.

</details>

<details>
<summary>Pista 2</summary>

La aplicacion usa el modulo `pickle` de Python para serializar y deserializar preferencias. Pickle es un formato de serializacion poderoso que puede representar objetos Python arbitrarios. Cuando el servidor lee la cookie, deserializa lo que haya en ella usando `pickle.loads()`.

</details>

<details>
<summary>Pista 3</summary>

La deserializacion de pickle en Python puede ejecutar codigo arbitrario durante el proceso de unpickling. El metodo `__reduce__` en una clase define que codigo se ejecuta durante la deserializacion. Necesitas crear un objeto Python, serializarlo con pickle, codificarlo en Base64 y establecerlo como la cookie `user_prefs`. Cuando el servidor lea la cookie, tu codigo se ejecuta.

</details>

**Que aprendiste?** Nunca deserialices datos no confiables con formatos inseguros como pickle de Python, serializacion de Java, o unserialize de PHP. Estos formatos permiten ejecucion de codigo durante la deserializacion. Siempre usa formatos seguros de solo datos como JSON.

---

### V-027: Inyeccion de Plantilla del Servidor (SSTI)

| | |
|---|---|
| **OWASP** | A03:2021 - Inyeccion |
| **Tier** | Dificil (3 pts) |
| **Objetivo** | `/api/admin/email-preview` |
| **Herramientas** | curl (con token de admin) |

El panel de admin tiene una funcion de vista previa de plantillas de email. Las plantillas usan un motor de renderizado para generar contenido dinamico. Que pasa cuando la entrada del usuario se trata como una plantilla?

<details>
<summary>Pista 1</summary>

El endpoint de vista previa de email acepta un cuerpo de plantilla y lo renderiza. Esto esta pensado para previsualizar plantillas de email con variables como `{{ user.name }}`. Pero que pasa si envias otros tipos de expresiones de plantilla?

</details>

<details>
<summary>Pista 2</summary>

La aplicacion usa Jinja2 para el renderizado de plantillas, sin sandbox. Las expresiones de Jinja2 pueden acceder a objetos de Python y sus atributos. Si puedes navegar la jerarquia de objetos, puedes alcanzar funciones peligrosas. Investiga "Jinja2 SSTI" para conocer las tecnicas.

</details>

<details>
<summary>Pista 3</summary>

En Jinja2, puedes recorrer la jerarquia de clases de objetos Python usando `__class__`, `__init__`, `__globals__` y otros atributos dunder. El objetivo es alcanzar un modulo como `os` o `subprocess` para ejecutar comandos del sistema. Esto es esencialmente RCE a traves del motor de plantillas. Necesitas acceso de admin primero, que puedes obtener a traves de otras vulnerabilidades.

</details>

**Que aprendiste?** La Inyeccion de Plantilla del Servidor es extremadamente peligrosa porque frecuentemente lleva a RCE. Nunca renderices entrada del usuario como una plantilla. Si necesitas permitir personalizacion de plantillas, usa un entorno de renderizado con sandbox y restringe las funciones disponibles.

---

## Bonus: Cadenas de Ataque

Las vulnerabilidades individuales son peligrosas, pero el verdadero poder viene de encadenarlas. Aqui tienes tres cadenas de ataque para explorar.

### Cadena 1: De Invitado a Admin a RCE

Empezando como usuario no autenticado, puedes obtener acceso completo al sistema?

<details>
<summary>Direccion</summary>

Comienza extrayendo datos de credenciales de la base de datos (Tier 1). Luego rompe la proteccion criptografica de esas credenciales (Tier 2). Una vez que tengas acceso de admin, busca endpoints que interactuen con el sistema operativo (Tier 3).

</details>

### Cadena 2: De Usuario a Admin Sin Ataques a la Base de Datos

Puedes escalar privilegios sin usar inyeccion SQL?

<details>
<summary>Direccion</summary>

Piensa en APIs que aceptan campos extra que no deberian (Tier 2), o mecanismos de autenticacion con debilidades explotables (Tier 2). Una vez que tengas acceso de admin, el sistema de plantillas te espera (Tier 3).

</details>

### Cadena 3: XSS a Robo de Cuenta

Un payload almacenado en una resena puede llevar al secuestro completo de la sesion?

<details>
<summary>Direccion</summary>

Un payload persistente (Tier 1) combinado con configuracion insegura de cookies (Tier 1) significa que cuando un usuario privilegiado ve la pagina infectada, su sesion puede ser robada. Usa la sesion robada para cualquier accion de admin.

</details>

---

## Glosario

| Termino | Definicion |
|---------|-----------|
| **SQLi** | Inyeccion SQL -- insertar codigo SQL a traves de la entrada del usuario |
| **XSS** | Cross-Site Scripting -- inyectar scripts del lado del cliente en paginas web |
| **IDOR** | Referencia Directa Insegura a Objetos -- acceder a objetos sin autorizacion |
| **SSTI** | Inyeccion de Plantilla del Servidor -- inyectar codigo en plantillas del servidor |
| **RCE** | Ejecucion Remota de Codigo -- ejecutar comandos arbitrarios en el servidor |
| **CSRF** | Falsificacion de Peticion entre Sitios -- enganar a usuarios para realizar acciones no deseadas |
| **JWT** | JSON Web Token -- un formato compacto de token para autenticacion |
| **OWASP** | Open Web Application Security Project -- organizacion de estandares de seguridad |
| **CVE** | Common Vulnerabilities and Exposures -- identificador estandarizado de vulnerabilidades |

## Recursos

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackTricks](https://book.hacktricks.xyz/)
- [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [CrackStation (Busqueda de Hashes)](https://crackstation.net/)
- [jwt.io (Debugger JWT)](https://jwt.io/)
- [Documentacion de BugTraceAI](https://github.com/BugTraceAI/BugTraceAI/wiki)

---

*Construido con proposito por [BugTraceAI](https://bugtraceai.com). Feliz caceria.*
