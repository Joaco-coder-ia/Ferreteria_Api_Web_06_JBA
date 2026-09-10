// Este módulo se carga en catálogo, detalle y carrito para compartir la compra.
function avisarCarrito(mensaje, error) {
  mostrarMensaje(document.querySelector("#cart-status"), mensaje, error);
}

// Al volver al carrito usamos precios y stock actuales del catálogo.
function actualizarDatosCarrito(productos) {
  const guardados = leerListaGuardada(clavesDatos.carrito) || [];
  const carrito = [];
  for (let i = 0; i < guardados.length; i++) {
    const producto = buscarPorCampo(productos, "codigo", guardados[i].codigo);
    if (!producto || producto.stock < 1) continue;
    let cantidad = Number(guardados[i].cantidad);
    if (!Number.isFinite(cantidad) || cantidad < 1) continue;
    cantidad = Math.min(Math.floor(cantidad), Math.floor(producto.stock));
    const fila = copiarObjeto(producto);
    fila.cantidad = cantidad;
    carrito.push(fila);
  }
  return carrito;
}

function guardarCarrito(carrito) {
  if (!guardarDato(clavesDatos.carrito, carrito)) {
    avisarCarrito("No se pudo guardar el carrito en este navegador.", true);
    return false;
  }
  actualizarContadorCarrito();
  return true;
}

// cantidad es opcional: desde el catálogo se agrega de a una unidad.
function agregarAlCarrito(codigo, cantidad) {
  let pedidas = Number(cantidad);
  if (!Number.isFinite(pedidas) || pedidas < 1) pedidas = 1;
  pedidas = Math.floor(pedidas);
  cargarProductos(
    function (productos) {
      const producto = buscarPorCampo(productos, "codigo", codigo);
      if (!producto || producto.stock < 1) {
        avisarCarrito("Este producto no tiene stock disponible.", true);
        return;
      }
      const carrito = actualizarDatosCarrito(productos);
      const existente = buscarPorCampo(carrito, "codigo", codigo);
      if (existente) {
        if (existente.cantidad >= producto.stock) {
          avisarCarrito("Ya agregaste todo el stock disponible.", true);
          return;
        }
        existente.cantidad = Math.min(
          existente.cantidad + pedidas,
          producto.stock,
        );
      } else {
        const fila = copiarObjeto(producto);
        fila.cantidad = Math.min(pedidas, producto.stock);
        carrito.push(fila);
      }
      if (guardarCarrito(carrito)) {
        avisarCarrito("Producto agregado al carrito.", false);
        // Mostramos el panel lateral para confirmar visualmente la acción.
        if (typeof abrirPanelCarrito === "function") abrirPanelCarrito();
      }
    },
    function (mensaje) {
      avisarCarrito(mensaje, true);
    },
  );
}

function dibujarCarrito(carrito) {
  const contenedor = document.querySelector("#cart-content");
  if (!contenedor) return;
  if (!carrito.length) {
    contenedor.innerHTML =
      '<div class="empty"><h2>Tu carrito está vacío</h2><a href="catalogo.html">Ver catálogo</a></div>';
    return;
  }
  let filas = "";
  let total = 0;
  for (let i = 0; i < carrito.length; i++) {
    const producto = carrito[i];
    const subtotal = producto.precioVenta * producto.cantidad;
    total += subtotal;
    // La miniatura ayuda a reconocer el producto sin volver al catálogo.
    const miniatura = producto.imagen
      ? '<img class="cart-item-thumb" src="' +
        escaparHtml(rutaFrontend(producto.imagen)) +
        '" alt="' +
        escaparHtml(producto.nombre) +
        '">'
      : '<span class="cart-item-thumb cart-item-thumb-vacia"></span>';
    filas +=
      '<article class="cart-item">' +
      miniatura +
      "<div><h2>" +
      escaparHtml(producto.nombre) +
      "</h2>" +
      "<p>" +
      formatearDinero(producto.precioVenta) +
      '</p></div><div class="cart-item-actions">' +
      '<label>Cantidad<input class="quantity-input" type="number" min="0" max="' +
      producto.stock +
      '" step="1" value="' +
      producto.cantidad +
      '" data-quantity="' +
      escaparHtml(producto.codigo) +
      '"></label>' +
      "<strong>" +
      formatearDinero(subtotal) +
      "</strong>" +
      '<button class="text-button" type="button" data-remove="' +
      escaparHtml(producto.codigo) +
      '">Quitar</button></div></article>';
  }
  contenedor.innerHTML =
    '<div class="cart-layout"><div>' +
    filas +
    "</div>" +
    '<aside class="order-summary"><h2>Resumen del pedido</h2><p class="total-line">Total <strong>' +
    formatearDinero(total) +
    "</strong></p>" +
    '<form id="order-form"><fieldset><legend>Tipo de entrega</legend>' +
    '<label><input type="radio" name="delivery" value="Retiro en tienda" checked> Retiro en tienda</label>' +
    '<label><input type="radio" name="delivery" value="Despacho"> Despacho</label></fieldset>' +
    '<button class="button button-primary full" type="submit">Confirmar pedido</button></form></aside></div>';
  activarRespaldoImagenes();
}

function mostrarCarrito() {
  if (!document.querySelector("#cart-content")) return;
  cargarProductos(
    function (productos) {
      const carrito = actualizarDatosCarrito(productos);
      guardarCarrito(carrito);
      dibujarCarrito(carrito);
    },
    function (mensaje) {
      avisarCarrito(mensaje, true);
    },
  );
}

function cambiarCantidad(codigo, cantidad) {
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    avisarCarrito(
      "La cantidad debe ser un número entero, igual o mayor a cero.",
      true,
    );
    mostrarCarrito();
    return;
  }
  cargarProductos(
    function (productos) {
      const carrito = actualizarDatosCarrito(productos);
      const nuevos = [];
      for (let i = 0; i < carrito.length; i++) {
        const producto = carrito[i];
        if (producto.codigo === codigo)
          producto.cantidad = Math.min(cantidad, producto.stock);
        if (producto.cantidad > 0) nuevos.push(producto);
      }
      if (guardarCarrito(nuevos)) dibujarCarrito(nuevos);
    },
    function (mensaje) {
      avisarCarrito(mensaje, true);
    },
  );
}

document.addEventListener("click", function (evento) {
  const agregar = evento.target.closest("[data-add]");
  if (agregar) {
    // En el detalle existe un campo de cantidad; en el catálogo no.
    const campo = document.querySelector("[data-add-quantity]");
    const cantidad = campo ? Number(campo.value) : 1;
    agregarAlCarrito(agregar.getAttribute("data-add"), cantidad);
  }
  const quitar = evento.target.closest("[data-remove]");
  if (quitar) cambiarCantidad(quitar.getAttribute("data-remove"), 0);
});
document.addEventListener("change", function (evento) {
  const codigo = evento.target.getAttribute("data-quantity");
  if (codigo) cambiarCantidad(codigo, Number(evento.target.value));
});

let confirmandoPedido = false;
document.addEventListener("submit", function (evento) {
  if (evento.target.id !== "order-form") return;
  evento.preventDefault();
  if (confirmandoPedido) return;
  const usuario = usuarioDeSesion();
  if (!usuario) {
    avisarCarrito(
      "Inicia sesión antes de confirmar el pedido. Tu carrito se conserva.",
      true,
    );
    return;
  }
  const entrega = evento.target.elements.delivery.value;
  if (entrega !== "Retiro en tienda" && entrega !== "Despacho") return;
  confirmandoPedido = true;
  cargarProductos(
    function (productos) {
      const carrito = actualizarDatosCarrito(productos);
      let total = 0;
      for (let i = 0; i < carrito.length; i++)
        total += carrito[i].precioVenta * carrito[i].cantidad;
      if (!carrito.length) {
        confirmandoPedido = false;
        mostrarCarrito();
        avisarCarrito("No quedan productos disponibles en el carrito.", true);
        return;
      }
      const anteriores = leerListaGuardada(clavesDatos.pedidos) || [];
      const pedidos = anteriores.slice();
      pedidos.unshift({
        id: "PED-" + Date.now(),
        runUsuario: usuario.run,
        total: total,
        delivery: entrega,
        productos: carrito,
      });
      if (!guardarDato(clavesDatos.pedidos, pedidos)) {
        confirmandoPedido = false;
        avisarCarrito(
          "No se pudo guardar el pedido. El carrito se conserva.",
          true,
        );
        return;
      }
      if (!guardarCarrito([])) {
        guardarDato(clavesDatos.pedidos, anteriores);
        confirmandoPedido = false;
        return;
      }
      document.querySelector("#cart-content").innerHTML =
        '<div class="empty"><h2>Pedido recibido</h2>' +
        '<p>Tu solicitud quedó guardada en este navegador.</p><a href="cuenta.html">Ver mi cuenta</a></div>';
      confirmandoPedido = false;
    },
    function (mensaje) {
      confirmandoPedido = false;
      avisarCarrito(mensaje, true);
    },
  );
});
mostrarCarrito();