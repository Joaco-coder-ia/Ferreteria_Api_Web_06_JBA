# Ferretería Los Maestros

Proyecto frontend desarrollado para la Evaluación Parcial 1 de la asignatura
**DSY1104 - Desarrollo Fullstack II**.

## Descripción

Ferretería Los Maestros corresponde a la interfaz web de una tienda de
productos de ferretería. El proyecto busca ofrecer una navegación clara,
presentar un catálogo de productos y permitir la interacción del usuario con
formularios y un carrito de compras simulado.

La solución se desarrolla exclusivamente en el frontend. No utiliza backend,
base de datos ni pagos reales.

## Tecnologías

- HTML5 para la estructura semántica del contenido.
- CSS3 externo para la presentación y el diseño adaptable.
- JavaScript ES6+ para la interacción, validaciones y manejo de datos.
- JSON como fuente local del catálogo de productos.
- Git y GitHub para el control de versiones y el trabajo colaborativo.

## Alcance funcional

El proyecto contempla las siguientes funcionalidades:

- Página de inicio de la tienda.
- Catálogo y detalle de productos.
- Búsqueda y filtrado de productos.
- Carrito de compras simulado.
- Inicio de sesión y registro de usuarios.
- Formularios validados mediante JavaScript.
- Persistencia local de información no sensible mediante `localStorage`.
- Interfaz adaptable para computador, tablet y teléfono móvil.
- Vistas administrativas para la gestión simulada de productos y usuarios.

## Estructura definitiva del proyecto

```text
Ferreteria_API/
├── README.md
├── docs/
└── frontend/
    ├── index.html
    ├── tienda/
    │   ├── catalogo.html
    │   ├── producto-detalle.html
    │   ├── carrito.html
    │   ├── inicio-sesion.html
    │   ├── registro.html
    │   ├── cuenta.html
    │   ├── nosotros.html
    │   └── contacto.html
    ├── admin/
    │   ├── index.html
    │   ├── usuarios/
    │   │   ├── listado.html
    │   │   ├── nuevo.html
    │   │   ├── editar.html
    │   │   └── detalle.html
    │   └── productos/
    │       ├── listado.html
    │       ├── nuevo.html
    │       ├── editar.html
    │       └── detalle.html
    ├── css/
    │   └── styles.css
    ├── js/
    │   ├── app.js
    │   ├── compartido/
    │   │   ├── almacenamiento.js
    │   │   ├── utilidades.js
    │   │   └── regiones.js
    │   ├── tienda/
    │   │   ├── catalogo.js
    │   │   ├── producto-detalle.js
    │   │   ├── carrito.js
    │   │   ├── inicio-sesion.js
    │   │   ├── registro.js
    │   │   ├── cuenta.js
    │   │   └── contacto.js
    │   ├── admin/
    │   │   ├── admin.js
    │   │   ├── usuarios.js
    │   │   └── productos.js
    │   └── validaciones/
    │       ├── comunes.js
    │       ├── usuarios.js
    │       ├── productos.js
    │       └── contacto.js
    ├── data/
    │   └── productos.json
    └── assets/
        ├── img/
        │   └── productos/
        │       └── originales/
        └── logo/
```

- `README.md`: documentación general en la raíz del repositorio.
- `frontend/index.html`: página de inicio de la tienda.
- `frontend/tienda/`: páginas independientes de catálogo, detalle, carrito, inicio de sesión, registro, cuenta, nosotros y contacto.
- `frontend/admin/`: panel administrativo y páginas de listado, creación, edición y detalle organizadas por usuarios y productos.
- `frontend/css/styles.css`: hoja única con los estilos compartidos, de tienda y de administración, según la ERS.
- `frontend/js/app.js`: inicialización y navegación común.
- `frontend/js/compartido/`: almacenamiento en `localStorage`, utilidades y datos de regiones y comunas.
- `frontend/js/tienda/`: comportamiento de cada página pública que requiere JavaScript propio.
- `frontend/js/admin/`: inicialización del panel y gestión de usuarios y productos.
- `frontend/js/validaciones/`: reglas comunes y validaciones independientes para usuarios, productos y contacto.
- `frontend/data/productos.json`: fuente inicial del catálogo; los usuarios se mantienen en `localStorage`, sin `usuarios.json`.
- `frontend/assets/`: imágenes de productos y logotipos.

Esta es la estructura aplicada al proyecto. `docs/` conserva los documentos universitarios de referencia. Las imágenes originales se conservan en `frontend/assets/img/productos/originales/`. La carpeta `backend/` se incorporará en la raíz cuando comience el desarrollo de la API.

## Ejecución local

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Instalar la extensión **Live Server**.
4. Abrir `frontend/index.html` y seleccionar **Open with Live Server**.

También puede utilizarse cualquier servidor web estático. Se recomienda no
abrir el archivo únicamente con doble clic, porque la carga del archivo JSON
puede ser bloqueada por el navegador.

## Organización del código y comprobación

- Los HTML cargan primero utilidades, almacenamiento y `app.js`; después las validaciones y el código de su página.
- Se usan funciones con nombre, bucles `for` y comentarios. No se necesita un empaquetador ni instalar dependencias para ejecutar el sitio.
- `fetch` y la lectura de imágenes terminan después de iniciar la operación; los comentarios indican qué función recibe el resultado.
- Productos: el admin y la tienda leen `ep1-products`; el JSON inicializa el catálogo solo si no hay una lista guardada.
- Usuarios: el registro guarda perfiles Cliente en `ep1-users`. Los correos y RUN no pueden repetirse. La contraseña elegida se guarda como huella con una sal aleatoria mediante la API del navegador, dentro de `huellaClave`.
- Los perfiles iniciales y los creados desde admin usan `demo123`. Correos iniciales: `admin@duoc.cl`, `vendedor@profesor.duoc.cl` y `cliente@gmail.com`.
- La sesión usa `ep1-user`. Las sesiones antiguas sin RUN requieren volver a ingresar. El vendedor solo accede al listado y detalle de productos; el cliente accede a la tienda.
- El carrito usa `ep1-cart` y los pedidos `ep1-orders`. Los nuevos pedidos se vinculan al RUN del comprador; los antiguos sin propietario se conservan, pero no se muestran en cuentas de otros usuarios.
- Las regiones y comunas conservan el listado de muestra original; no es un catálogo completo de comunas.
- Blogs y gestión administrativa de órdenes quedan pendientes por decisión de alcance. Esta migración no implementa backend ni saldo de cuenta corriente.

Para revisar: crea una cuenta, inicia sesión, agrega un producto al carrito, cambia la cantidad, recarga y confirma un pedido. Con el perfil administrador, crea y edita productos y usuarios; comprueba el cambio de producto en el catálogo. Verifica que el vendedor no pueda abrir formularios administrativos.

## Consideraciones

- La autenticación corresponde a una simulación frontend.
- No deben ingresarse contraseñas ni datos personales reales.
- El carrito y la sesión simulada pueden almacenarse localmente en el navegador.
- El proyecto no procesa compras, pagos ni despachos reales.

## Integrantes

- [Completar nombre y apellido]
- [Completar nombre y apellido]
- [Completar nombre y apellido]

## Institución

Duoc UC - Escuela de Informática y Telecomunicaciones.
