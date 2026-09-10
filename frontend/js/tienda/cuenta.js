// La cuenta muestra distinta información según el rol del usuario conectado.
const contenidoCuenta = document.querySelector("#account-content");
const usuarioCuenta = usuarioDeSesion();

// Los identificadores guardan la fecha de creación (PREFIJO-marcaDeTiempo).
function fechaDelPedido(id) {
  const partes = String(id).split("-");
  const marca = Number(partes[partes.length - 1]);
  if (!Number.isFinite(marca) || marca <= 0) return "Sin fecha";
  return new Date(marca).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Una línea de datos del perfil; se omite si el campo viene vacío.
function filaPerfil(etiqueta, valor) {
  if (!valor) return "";
  return (
    '<div class="perfil-fila"><span>' +
    escaparHtml(etiqueta) +
    "</span><strong>" +
    escaparHtml(valor) +
    "</strong></div>"
  );
}

// Tarjeta de identificación común a todos los roles.
function tarjetaPerfil(usuario) {
  const nombreCompleto = (
    usuario.nombre +
    " " +
    (usuario.apellidos || "")
  ).trim();
  return (
    '<article class="account-card perfil-card">' +
    '<div class="perfil-encabezado">' +
    '<span class="perfil-avatar" aria-hidden="true">' +
    escaparHtml(nombreCompleto.charAt(0).toUpperCase()) +
    "</span>" +
    "<div><h2>" +
    escaparHtml(nombreCompleto) +
    "</h2>" +
    '<span class="perfil-rol">' +
    escaparHtml(usuario.tipoUsuario) +
    "</span></div></div>" +
    '<div class="perfil-datos">' +
    filaPerfil("RUN", usuario.run) +
    filaPerfil("Correo", usuario.correo) +
    filaPerfil("Teléfono", usuario.telefono) +
    filaPerfil("Fecha de nacimiento", usuario.fechaNacimiento) +
    filaPerfil("Región", usuario.region) +
    filaPerfil("Comuna", usuario.comuna) +
    "</div></article>"
  );
}

// Los perfiles internos ven sus accesos de gestión, no datos de compra.
function panelInterno(usuario) {
  const esAdmin = usuario.tipoUsuario === "Administrador";
  const destino = esAdmin
    ? "admin/index.html"
    : "admin/productos/listado.html";
  const descripcion = esAdmin
    ? "Tienes acceso completo a la administración de productos y usuarios."
    : "Puedes gestionar el catálogo de productos y revisar el stock.";
  return (
    '<article class="account-card">' +
    "<h2>Acceso de " +
    escaparHtml(usuario.tipoUsuario.toLowerCase()) +
    "</h2>" +
    '<p class="cuenta-descripcion">' +
    descripcion +
    "</p>" +
    '<div class="button-row">' +
    '<a class="button button-primary" href="' +
    rutaFrontend(destino) +
    '">Ir al panel de administración</a>' +
    "</div></article>"
  );
}

// Dirección registrada que se usa al elegir despacho a domicilio.
function tarjetaDespacho(usuario) {
  let contenido = "";
  if (usuario.direccion) {
    contenido =
      '<div class="perfil-datos">' +
      filaPerfil("Dirección", usuario.direccion) +
      filaPerfil("Comuna", usuario.comuna) +
      filaPerfil("Región", usuario.region) +
      "</div>";
  } else {
    contenido =
      '<p class="cuenta-descripcion">Todavía no registras una dirección de despacho.</p>';
  }
  return (
    '<article class="account-card">' +
    "<h2>Dirección de despacho</h2>" +
    contenido +
    "</article>"
  );
}

// Los contratistas registran además los datos de su empresa.
function tarjetaEmpresa(usuario) {
  if (!usuario.esContratista || !usuario.empresa) return "";
  return (
    '<article class="account-card">' +
    "<h2>Datos de la empresa</h2>" +
    '<div class="perfil-datos">' +
    filaPerfil("Razón social", usuario.empresa.razonSocial) +
    filaPerfil("RUT", usuario.empresa.rut) +
    filaPerfil("Dirección", usuario.empresa.direccion) +
    "</div></article>"
  );
}

// Cada pedido se muestra con su detalle de productos y cantidades.
function tarjetaPedido(pedido) {
  let lineas = "";
  const productos = pedido.productos || [];
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i];
    lineas +=
      "<li><span>" +
      escaparHtml(producto.nombre) +
      "</span>" +
      '<span class="pedido-cantidad">x' +
      producto.cantidad +
      "</span>" +
      "<span>" +
      formatearDinero(producto.precioVenta * producto.cantidad) +
      "</span></li>";
  }
  if (!lineas) lineas = "<li>Sin detalle de productos.</li>";
  return (
    '<article class="pedido-card">' +
    '<div class="pedido-encabezado">' +
    "<div><h3>" +
    escaparHtml(pedido.id) +
    "</h3>" +
    '<p class="pedido-fecha">' +
    fechaDelPedido(pedido.id) +
    "</p></div>" +
    '<span class="pedido-entrega">' +
    escaparHtml(pedido.delivery) +
    "</span></div>" +
    '<ul class="pedido-lista">' +
    lineas +
    "</ul>" +
    '<p class="pedido-total">Total <strong>' +
    formatearDinero(pedido.total) +
    "</strong></p></article>"
  );
}

// Estado de cuenta: los pedidos son cargos y los abonos, pagos registrados.
// El contratista paga el saldo del mes al cierre del período.
function tarjetaCuentaCorriente(pedidos) {
  const abonos = leerListaGuardada(clavesDatos.abonos) || [];
  const movimientos = [];

  for (let i = 0; i < pedidos.length; i++) {
    movimientos.push({
      marca: Number(String(pedidos[i].id).replace("PED-", "")) || 0,
      documento: pedidos[i].id,
      glosa: "Compra en tienda",
      cargo: Number(pedidos[i].total) || 0,
      abono: 0,
    });
  }
  for (let i = 0; i < abonos.length; i++) {
    if (abonos[i].runUsuario !== usuarioCuenta.run) continue;
    movimientos.push({
      marca: Number(abonos[i].fecha) || 0,
      documento: abonos[i].id || "ABONO",
      glosa: abonos[i].glosa || "Pago recibido",
      cargo: 0,
      abono: Number(abonos[i].monto) || 0,
    });
  }

  if (!movimientos.length) {
    return (
      '<article class="account-card account-card-ancha">' +
      "<h2>Cuenta corriente</h2>" +
      '<p class="cuenta-descripcion">Aún no registras movimientos en tu cuenta.</p>' +
      "</article>"
    );
  }

  // Del más antiguo al más nuevo para que el saldo se acumule correctamente.
  movimientos.sort(function (a, b) {
    return a.marca - b.marca;
  });

  let filas = "";
  let saldo = 0;
  let cargosDelMes = 0;
  const hoy = new Date();
  for (let i = 0; i < movimientos.length; i++) {
    const movimiento = movimientos[i];
    saldo += movimiento.cargo - movimiento.abono;
    const fecha = new Date(movimiento.marca);
    if (
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    ) {
      cargosDelMes += movimiento.cargo;
    }
    filas +=
      "<tr><td>" +
      fechaDelPedido(movimiento.documento) +
      "</td><td>" +
      escaparHtml(movimiento.documento) +
      "</td><td>" +
      escaparHtml(movimiento.glosa) +
      "</td><td>" +
      (movimiento.cargo ? formatearDinero(movimiento.cargo) : "—") +
      "</td><td>" +
      (movimiento.abono ? formatearDinero(movimiento.abono) : "—") +
      "</td><td>" +
      formatearDinero(saldo) +
      "</td></tr>";
  }

  // El pago vence el último día del mes en curso.
  const vencimiento = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const textoVencimiento = vencimiento.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const estado = saldo > 0 ? "Con saldo pendiente" : "Al día";
  const claseEstado = saldo > 0 ? " cuenta-estado-pendiente" : "";

  return (
    '<article class="account-card account-card-ancha">' +
    '<div class="cuenta-encabezado">' +
    "<h2>Cuenta corriente</h2>" +
    '<span class="cuenta-estado' +
    claseEstado +
    '">' +
    estado +
    "</span>" +
    "</div>" +
    '<p class="cuenta-descripcion">Las compras se cargan a tu cuenta y se pagan al cierre de cada mes.</p>' +
    '<div class="resumen-grid">' +
    "<div><b>" +
    formatearDinero(saldo) +
    "</b><small>Saldo pendiente</small></div>" +
    "<div><b>" +
    formatearDinero(cargosDelMes) +
    "</b><small>Cargos del mes</small></div>" +
    "<div><b>" +
    textoVencimiento +
    "</b><small>Vence el</small></div>" +
    "</div>" +
    '<div class="tabla-scroll"><table class="tabla-cuenta">' +
    "<thead><tr><th>Fecha</th><th>Documento</th><th>Detalle</th>" +
    "<th>Cargo</th><th>Abono</th><th>Saldo</th></tr></thead>" +
    "<tbody>" +
    filas +
    "</tbody></table></div>" +
    "</article>"
  );
}

if (!usuarioCuenta) {
  contenidoCuenta.innerHTML =
    '<div class="empty"><h2>Inicia sesión para continuar</h2>' +
    "<p>Necesitas una sesión activa para ver tu perfil.</p>" +
    '<a class="button button-primary" href="inicio-sesion.html">Ingresar</a></div>';
} else if (usuarioCuenta.tipoUsuario !== "Cliente") {
  // Administrador y Vendedor: sólo datos personales y su acceso de gestión.
  contenidoCuenta.innerHTML =
    tarjetaPerfil(usuarioCuenta) + panelInterno(usuarioCuenta);
} else {
  // Cliente: datos, despacho, historial de pedidos y cuenta corriente.
  const todos = leerListaGuardada(clavesDatos.pedidos) || [];
  const pedidos = [];
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].runUsuario === usuarioCuenta.run) pedidos.push(todos[i]);
  }

  let historial = "";
  for (let i = 0; i < pedidos.length; i++)
    historial += tarjetaPedido(pedidos[i]);
  if (!historial) {
    historial =
      '<div class="empty"><h3>Todavía no tienes pedidos confirmados</h3>' +
      "<p>Cuando confirmes una compra, aparecerá aquí con su detalle.</p>" +
      '<a class="button button-primary" href="catalogo.html">Ir al catálogo</a></div>';
  }

  contenidoCuenta.innerHTML =
    tarjetaPerfil(usuarioCuenta) +
    tarjetaDespacho(usuarioCuenta) +
    tarjetaEmpresa(usuarioCuenta) +
    '<article class="account-card account-card-ancha"><h2>Historial de pedidos</h2>' +
    historial +
    "</article>" +
    // La cuenta corriente es exclusiva del perfil contratista.
    (usuarioCuenta.esContratista ? tarjetaCuentaCorriente(pedidos) : "");
}