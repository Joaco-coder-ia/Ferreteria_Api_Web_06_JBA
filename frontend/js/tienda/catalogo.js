// Catálogo, filtros y resumen de inicio. La compra se controla en carrito.js.
let productosCatalogo = [];

function crearTarjetaProducto(producto) {
  let desactivado = "";
  let stock = "Stock disponible: " + producto.stock;
  if (producto.stock < 1) {
    desactivado = " disabled";
    stock = "Sin stock disponible";
  }
  const detalle =
    rutaFrontend("tienda/producto-detalle.html?codigo=") +
    encodeURIComponent(producto.codigo);
  return (
    '<article class="product-card">' +
    imagenProductoHtml(producto) +
    '<span class="category">' +
    escaparHtml(producto.categoria) +
    "</span>" +
    "<h2>" +
    escaparHtml(producto.nombre) +
    "</h2>" +
    "<p>" +
    escaparHtml(producto.marca || "") +
    " · " +
    escaparHtml(producto.unidad || "") +
    "</p>" +
    '<strong class="price">' +
    formatearDinero(producto.precioVenta) +
    "</strong>" +
    '<p class="stock">' +
    stock +
    '</p><div class="button-row">' +
    '<a class="small-button" href="' +
    detalle +
    '">Ver detalle</a>' +
    '<button class="small-button" type="button" data-add="' +
    escaparHtml(producto.codigo) +
    '"' +
    desactivado +
    ">Agregar</button>" +
    "</div></article>"
  );
}

function mostrarCatalogo() {
  const grilla = document.querySelector("#product-grid");
  if (!grilla) return;
  const texto = document.querySelector("#search").value.trim().toLowerCase();
  const categoria = document.querySelector("#category").value;
  const soloStock = document.querySelector("#stock-only").checked;
  let tarjetas = "";
  let total = 0;
  for (let i = 0; i < productosCatalogo.length; i++) {
    const producto = productosCatalogo[i];
    const informacion = (
      producto.codigo +
      " " +
      producto.nombre +
      " " +
      (producto.marca || "")
    ).toLowerCase();
    if (texto && informacion.indexOf(texto) === -1) continue;
    if (categoria !== "Todas" && categoria !== producto.categoria) continue;
    if (soloStock && producto.stock < 1) continue;
    tarjetas += crearTarjetaProducto(producto);
    total++;
  }
  if (!tarjetas)
    tarjetas =
      '<div class="empty"><h2>Sin resultados</h2><p>Prueba otra búsqueda o categoría.</p></div>';
  grilla.innerHTML = tarjetas;
  document.querySelector("#catalog-status").textContent =
    total + " productos · datos locales de demostración";
  activarRespaldoImagenes();
}

cargarProductos(
  function (productos) {
    productosCatalogo = productos;
    const categorias = [];
    let conStock = 0;
    for (let i = 0; i < productos.length; i++) {
      if (categorias.indexOf(productos[i].categoria) === -1)
        categorias.push(productos[i].categoria);
      if (productos[i].stock > 0) conStock++;
    }
    categorias.sort();
    const selector = document.querySelector("#category");
    if (selector) {
      for (let i = 0; i < categorias.length; i++)
        selector.add(new Option(categorias[i], categorias[i]));
      mostrarCatalogo();
    }
    const total = document.querySelector("#hero-total");
    if (total) {
      total.textContent = productos.length;
      document.querySelector("#hero-categorias").textContent =
        categorias.length;
      document.querySelector("#hero-stock").textContent = conStock;
    }
  },
  function (mensaje) {
    mostrarMensaje(
      document.querySelector("#catalog-status, #home-status"),
      mensaje,
      true,
    );
  },
);

const filtros = document.querySelector("#filter-form");
if (filtros) {
  filtros.addEventListener("input", mostrarCatalogo);
  // input también cubre los select y checkbox. Repetir en change borraría
  // el botón recién pulsado al salir del campo de búsqueda.
  filtros.addEventListener("submit", function (evento) {
    evento.preventDefault();
  });
}
