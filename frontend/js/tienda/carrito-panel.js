// Panel lateral del carrito. Se abre al agregar un producto desde cualquier página.
// El panel se inyecta una sola vez para no repetir el mismo HTML en cada archivo.
function crearPanelCarrito() {
  if (document.querySelector("#cart-panel")) return;
  const panel = document.createElement("aside");
  panel.id = "cart-panel";
  panel.className = "cart-panel";
  panel.setAttribute("aria-label", "Carrito de compras");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML =
    '<div class="cart-panel-header">' +
    "<h2>Mi carrito</h2>" +
    '<button class="cart-panel-close" type="button" data-cart-close aria-label="Cerrar carrito">&times;</button>' +
    "</div>" +
    '<div class="cart-panel-body" id="cart-panel-body"></div>' +
    '<div class="cart-panel-footer" id="cart-panel-footer"></div>';
  document.body.appendChild(panel);
}

// El panel no bloquea la página: se puede seguir navegando y agregando productos.
function abrirPanelCarrito() {
  crearPanelCarrito();
  dibujarPanelCarrito();
  const panel = document.querySelector("#cart-panel");
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
}

function cerrarPanelCarrito() {
  const panel = document.querySelector("#cart-panel");
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
}

function panelEstaAbierto() {
  const panel = document.querySelector("#cart-panel");
  return panel !== null && panel.classList.contains("is-open");
}

// Cada fila muestra miniatura, nombre, controles de cantidad y subtotal.
function filaPanelCarrito(producto) {
  const subtotal = producto.precioVenta * producto.cantidad;
  const codigo = escaparHtml(producto.codigo);
  const topeAlcanzado = producto.cantidad >= producto.stock ? " disabled" : "";
  const imagen = producto.imagen
    ? '<img class="cart-panel-thumb" src="' +
      escaparHtml(rutaFrontend(producto.imagen)) +
      '" alt="' +
      escaparHtml(producto.nombre) +
      '">'
    : '<span class="cart-panel-thumb cart-panel-thumb-vacia"></span>';
  return (
    '<article class="cart-panel-item">' +
    imagen +
    '<div class="cart-panel-info">' +
    "<h3>" +
    escaparHtml(producto.nombre) +
    "</h3>" +
    '<div class="cart-panel-qty">' +
    '<button class="cart-qty-button" type="button" data-cart-dec="' +
    codigo +
    '" aria-label="Quitar una unidad">&minus;</button>' +
    '<span class="cart-qty-valor">' +
    producto.cantidad +
    "</span>" +
    '<button class="cart-qty-button" type="button" data-cart-inc="' +
    codigo +
    '" aria-label="Agregar una unidad"' +
    topeAlcanzado +
    ">+</button>" +
    "</div>" +
    "<p>Subtotal: " +
    formatearDinero(subtotal) +
    "</p>" +
    "</div>" +
    '<button class="cart-panel-remove" type="button" data-cart-remove="' +
    codigo +
    '">Eliminar</button>' +
    "</article>"
  );
}

function dibujarPanelCarrito() {
  const cuerpo = document.querySelector("#cart-panel-body");
  const pie = document.querySelector("#cart-panel-footer");
  if (!cuerpo || !pie) return;
  cargarProductos(
    function (productos) {
      const carrito = actualizarDatosCarrito(productos);
      if (!carrito.length) {
        cuerpo.innerHTML =
          '<p class="cart-panel-vacio">Todavía no agregas productos.</p>';
        pie.innerHTML =
          '<button class="button button-outline full" type="button" data-cart-close>Seguir comprando</button>';
        return;
      }
      let filas = "";
      let total = 0;
      for (let i = 0; i < carrito.length; i++) {
        filas += filaPanelCarrito(carrito[i]);
        total += carrito[i].precioVenta * carrito[i].cantidad;
      }
      cuerpo.innerHTML = filas;
      pie.innerHTML =
        '<p class="cart-panel-total">Total <strong>' +
        formatearDinero(total) +
        "</strong></p>" +
        '<button class="button button-outline full" type="button" data-cart-close>Seguir comprando</button>' +
        '<button class="button button-outline full" type="button" data-cart-clear>Vaciar carrito</button>' +
        '<a class="button button-primary full" href="' +
        rutaFrontend("tienda/carrito.html") +
        '">Ir al carrito</a>';
      activarRespaldoImagenes();
    },
    function (mensaje) {
      cuerpo.innerHTML =
        '<p class="cart-panel-vacio">' + escaparHtml(mensaje) + "</p>";
      pie.innerHTML = "";
    },
  );
}

// Suma o resta unidades respetando el stock disponible del producto.
function ajustarCantidadPanel(codigo, paso) {
  cargarProductos(
    function (productos) {
      const carrito = actualizarDatosCarrito(productos);
      const nuevos = [];
      for (let i = 0; i < carrito.length; i++) {
        const producto = carrito[i];
        if (producto.codigo === codigo) {
          let cantidad = producto.cantidad + paso;
          if (cantidad > producto.stock) cantidad = producto.stock;
          producto.cantidad = cantidad;
        }
        if (producto.cantidad > 0) nuevos.push(producto);
      }
      if (guardarCarrito(nuevos)) {
        dibujarPanelCarrito();
        if (document.querySelector("#cart-content")) dibujarCarrito(nuevos);
      }
    },
    function (mensaje) {
      avisarCarrito(mensaje, true);
    },
  );
}

// Vaciar deja el carrito en cero y refresca el panel y el contador del menú.
function vaciarCarritoDesdePanel() {
  if (!guardarDato(clavesDatos.carrito, [])) return;
  actualizarContadorCarrito();
  dibujarPanelCarrito();
  if (document.querySelector("#cart-content")) mostrarCarrito();
}

document.addEventListener("click", function (evento) {
  if (evento.target.closest("[data-cart-close]")) cerrarPanelCarrito();
  if (evento.target.closest("[data-cart-clear]")) vaciarCarritoDesdePanel();

  const subir = evento.target.closest("[data-cart-inc]");
  if (subir) ajustarCantidadPanel(subir.getAttribute("data-cart-inc"), 1);

  const bajar = evento.target.closest("[data-cart-dec]");
  if (bajar) ajustarCantidadPanel(bajar.getAttribute("data-cart-dec"), -1);

  const eliminar = evento.target.closest("[data-cart-remove]");
  if (eliminar)
    ajustarCantidadPanel(eliminar.getAttribute("data-cart-remove"), -99999);

  // Si el panel está abierto y se agrega desde el catálogo, se refresca solo.
  if (evento.target.closest("[data-add]") && panelEstaAbierto()) {
    window.setTimeout(dibujarPanelCarrito, 80);
  }
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") cerrarPanelCarrito();
});