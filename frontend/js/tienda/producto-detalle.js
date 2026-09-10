// El código en la URL permite recargar y compartir un detalle específico.
const contenedorDetalle = document.querySelector("#product-detail");
cargarProductos(
  function (productos) {
    const codigo = parametroPagina("codigo").trim().toUpperCase();
    const producto = buscarPorCampo(productos, "codigo", codigo);
    if (!producto) {
      contenedorDetalle.innerHTML =
        "<h1>Producto no encontrado</h1><p>Vuelve al catálogo para seleccionar uno.</p>";
      return;
    }
    let desactivado = "";
    if (producto.stock < 1) desactivado = " disabled";
    contenedorDetalle.innerHTML =
      imagenProductoHtml(producto) +
      '<span class="category">' +
      escaparHtml(producto.categoria) +
      "</span>" +
      "<h1>" +
      escaparHtml(producto.nombre) +
      "</h1>" +
      "<p>" +
      escaparHtml(producto.descripcion || "Sin descripción adicional.") +
      "</p>" +
      "<p>" +
      escaparHtml(producto.marca || "") +
      " · " +
      escaparHtml(producto.unidad || "") +
      "</p>" +
      '<strong class="detail-price">' +
      formatearDinero(producto.precioVenta) +
      "</strong>" +
      "<p>Stock disponible: " +
      producto.stock +
      "</p>" +
      // El comprador elige cuántas unidades quiere antes de agregar.
      '<div class="detail-quantity">' +
      '<label for="detail-qty">Cantidad</label>' +
      '<button class="cart-qty-button" type="button" data-detail-dec aria-label="Quitar una unidad">&minus;</button>' +
      '<input id="detail-qty" class="quantity-input" type="number" min="1" step="1" value="1" max="' +
      producto.stock +
      '" data-add-quantity' +
      desactivado +
      ">" +
      '<button class="cart-qty-button" type="button" data-detail-inc aria-label="Agregar una unidad"' +
      desactivado +
      ">+</button>" +
      "</div>" +
      '<button class="button button-primary" type="button" data-add="' +
      escaparHtml(producto.codigo) +
      '"' +
      desactivado +
      ">Agregar al carrito</button>";
    document.title = producto.nombre + " | Ferretería Los Maestros";
    activarRespaldoImagenes();
  },
  function (mensaje) {
    contenedorDetalle.textContent = mensaje;
  },
);

// Los botones +/- ajustan el campo respetando el mínimo y el stock máximo.
document.addEventListener("click", function (evento) {
  const subir = evento.target.closest("[data-detail-inc]");
  const bajar = evento.target.closest("[data-detail-dec]");
  if (!subir && !bajar) return;
  const campo = document.querySelector("#detail-qty");
  if (!campo) return;
  const tope = Number(campo.max) || 1;
  let cantidad = Number(campo.value) || 1;
  cantidad += subir ? 1 : -1;
  if (cantidad < 1) cantidad = 1;
  if (cantidad > tope) cantidad = tope;
  campo.value = cantidad;
});