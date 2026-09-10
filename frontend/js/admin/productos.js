// Este archivo muestra productos y conecta sus formularios con las validaciones.
function renderizarProductos(productos) {
  const cuerpo = document.querySelector("#admin-products-body");
  if (!cuerpo) return;
  let filas = "";
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    const consulta = "?codigo=" + encodeURIComponent(producto.codigo);
    let editar = "";
    if (puedeEditarAdmin())
      editar = ' · <a href="editar.html' + consulta + '">Editar</a>';
    filas +=
      "<tr><td>" +
      escaparHtml(producto.codigo) +
      "</td>" +
      "<td>" +
      escaparHtml(producto.nombre) +
      "</td><td>" +
      escaparHtml(producto.categoria) +
      "</td>" +
      "<td>" +
      formatearDinero(producto.precioVenta) +
      "</td><td>" +
      producto.stock +
      "</td>" +
      "<td>" +
      badge(estadoProducto(producto), producto.stock <= producto.stockMinimo) +
      "</td>" +
      '<td><a href="detalle.html' +
      consulta +
      '">Ver</a>' +
      editar +
      "</td></tr>";
  }
  cuerpo.innerHTML = filas;
  document.querySelector("#admin-products-count").textContent =
    productos.length + " productos disponibles en la fuente local.";
}

function renderizarDetalleProducto(productos) {
  const detalles = document.querySelector("#admin-product-details");
  if (!detalles) return;
  const codigo = parametroPagina("codigo").trim().toUpperCase();
  const producto = buscarPorCampo(productos, "codigo", codigo);
  if (!producto) {
    document.querySelector("#admin-product-visual").hidden = true;
    document.querySelector("#admin-product-edit-link").hidden = true;
    detalles.innerHTML =
      "<div><dt>Producto no encontrado</dt><dd>Vuelve al listado para seleccionar uno.</dd></div>";
    return;
  }
  document.querySelector("#admin-product-breadcrumb").textContent = codigo;
  document.querySelector("#admin-product-title").textContent = producto.nombre;
  document.querySelector("#admin-product-edit-link").href =
    "editar.html?codigo=" + encodeURIComponent(codigo);
  document.querySelector("#admin-product-edit-link").hidden =
    !puedeEditarAdmin();
  const imagen = document.querySelector("#admin-product-image");
  const respaldo = document.querySelector("#admin-product-image-fallback");
  imagen.alt = producto.nombre;
  function sinImagen() {
    imagen.hidden = true;
    respaldo.hidden = false;
  }
  imagen.addEventListener("error", sinImagen);
  const ruta = rutaImagen(producto.imagen);
  if (ruta) imagen.src = ruta;
  else sinImagen();
  const etiquetas = [
    "Código",
    "Categoría",
    "Subcategoría",
    "Marca",
    "Unidad",
    "Descripción",
  ];
  const campos = [
    "codigo",
    "categoria",
    "subcategoria",
    "marca",
    "unidad",
    "descripcion",
  ];
  let contenido = "";
  for (let i = 0; i < campos.length; i++) {
    contenido +=
      "<div><dt>" +
      etiquetas[i] +
      "</dt><dd>" +
      escaparHtml(producto[campos[i]] || "No informado") +
      "</dd></div>";
  }
  contenido +=
    "<div><dt>Precio de venta</dt><dd>" +
    formatearDinero(producto.precioVenta) +
    "</dd></div>" +
    "<div><dt>Stock disponible</dt><dd>" +
    producto.stock +
    " unidades</dd></div>" +
    "<div><dt>Stock crítico</dt><dd>" +
    producto.stockMinimo +
    " unidades</dd></div>" +
    "<div><dt>Estado</dt><dd>" +
    badge(estadoProducto(producto), producto.stock <= producto.stockMinimo) +
    "</dd></div>";
  detalles.innerHTML = contenido;
}

// FileReader termina después: usamos una función para recibir la imagen leída.
function leerImagen(archivo, recibir, informarError) {
  if (!archivo) {
    recibir("");
    return;
  }
  const lector = new FileReader();
  lector.onload = function () {
    recibir(lector.result);
  };
  lector.onerror = function () {
    informarError("No se pudo leer la imagen.");
  };
  lector.readAsDataURL(archivo);
}

function iniciarFormularioProducto(productos) {
  const formulario = document.querySelector(
    "#admin-product-create-form, #admin-product-edit-form",
  );
  if (!formulario) return;
  const esEdicion = formulario.id === "admin-product-edit-form";
  let codigoOriginal = "";
  if (esEdicion)
    codigoOriginal = parametroPagina("codigo").trim().toUpperCase();
  const producto = buscarPorCampo(productos, "codigo", codigoOriginal);
  const boton = formulario.querySelector('button[type="submit"]');
  if (esEdicion && !producto) {
    mostrarMensajeFormulario(
      formulario,
      "No se encontró el producto solicitado.",
    );
    boton.disabled = true;
    return;
  }
  if (producto) {
    const campos = ["codigo", "nombre", "descripcion", "categoria"];
    for (let i = 0; i < campos.length; i++)
      formulario.elements[campos[i]].value = producto[campos[i]];
    formulario.elements.precio.value = producto.precioVenta;
    formulario.elements.stock.value = producto.stock;
    formulario.elements.stockCritico.value = producto.stockMinimo;
    let nombreImagen = "Sin imagen";
    if (producto.imagen)
      nombreImagen =
        "Imagen actual conservada; selecciona otra para reemplazarla.";
    formulario.querySelector(".admin-current-image").textContent = nombreImagen;
    formulario.querySelector(".admin-button-secondary").href =
      "detalle.html?codigo=" + encodeURIComponent(codigoOriginal);
  }
  function listaActual() {
    return normalizarProductos(
      leerListaGuardada(clavesDatos.productos) || productos,
    );
  }
  function revisar() {
    const datos = datosProductoDesdeFormulario(formulario);
    const archivo = formulario.elements.imagen.files[0];
    const errores = validarProducto(
      datos,
      listaActual(),
      codigoOriginal,
      archivo,
    );
    // El navegador deja el valor vacío si se escribe un número incompleto.
    const nombres = ["precio", "stock", "stockCritico"];
    for (let i = 0; i < nombres.length; i++) {
      if (formulario.elements[nombres[i]].validity.badInput)
        errores[nombres[i]] = "Completa un número válido.";
    }
    return errores;
  }
  activarValidacion(formulario, revisar);
  let guardando = false;
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (guardando || !mostrarErrores(formulario, revisar())) return;
    const datos = datosProductoDesdeFormulario(formulario);
    guardando = true;
    boton.disabled = true;
    function fallo(mensaje) {
      guardando = false;
      boton.disabled = false;
      mostrarMensajeFormulario(formulario, mensaje);
    }
    leerImagen(
      formulario.elements.imagen.files[0],
      function (imagen) {
        // Volvemos a comprobar duplicados tras leer la imagen y antes de guardar.
        const actuales = listaActual();
        const errores = validarProducto(datos, actuales, codigoOriginal);
        if (!mostrarErrores(formulario, errores)) {
          fallo("Revisa los campos antes de guardar.");
          return;
        }
        let actualizado = {};
        if (producto) actualizado = copiarObjeto(producto);
        actualizado.codigo = datos.codigo;
        actualizado.nombre = datos.nombre;
        actualizado.descripcion = datos.descripcion;
        actualizado.precioVenta = Number(datos.precio);
        actualizado.stock = Number(datos.stock);
        actualizado.stockMinimo = Number(datos.stockCritico);
        actualizado.categoria = datos.categoria;
        actualizado.subcategoria = actualizado.subcategoria || "";
        actualizado.marca = actualizado.marca || "";
        actualizado.unidad = actualizado.unidad || "";
        actualizado.imagen = imagen || actualizado.imagen || "";
        if (
          !guardarRegistro(
            clavesDatos.productos,
            actuales,
            "codigo",
            codigoOriginal,
            actualizado,
          )
        ) {
          fallo("No fue posible guardar el producto. Puedes reintentarlo.");
          return;
        }
        window.location.href =
          "detalle.html?codigo=" + encodeURIComponent(datos.codigo);
      },
      fallo,
    );
  });
}

// Bloqueamos Guardar hasta tener el catálogo; un fallo siempre queda visible.
const botonProducto = document.querySelector(
  '.admin-form button[type="submit"]',
);
if (botonProducto) botonProducto.disabled = true;
if (adminAutorizado)
  cargarProductos(
    function (productos) {
      if (botonProducto) botonProducto.disabled = false;
      renderizarProductos(productos);
      renderizarDetalleProducto(productos);
      iniciarFormularioProducto(productos);
    },
    function (mensaje) {
      const salida = document.querySelector("#admin-load-error");
      mostrarMensaje(
        salida,
        mensaje + " Abre el proyecto con Live Server.",
        true,
      );
    },
  );
