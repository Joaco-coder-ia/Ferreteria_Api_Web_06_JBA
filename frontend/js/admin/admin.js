// Control visual de roles para esta demostración local, sin backend.
// Usuarios y productos consultan este resultado antes de iniciar.
let adminAutorizado = false;

function puedeEditarAdmin() {
  const usuario = usuarioDeSesion();
  return usuario !== null && usuario.tipoUsuario === "Administrador";
}

function iniciarAdmin() {
  const usuario = usuarioDeSesion();
  const pagina = document.body.getAttribute("data-pagina");
  let permitido = false;
  if (usuario && usuario.tipoUsuario === "Administrador") permitido = true;
  if (usuario && usuario.tipoUsuario === "Vendedor") {
    permitido =
      pagina === "admin-productos-listado" ||
      pagina === "admin-productos-detalle";
  }
  if (!permitido) {
    document.querySelector(".admin-shell").hidden = true;
    const aviso = document.createElement("main");
    aviso.className = "content-section";
    aviso.innerHTML =
      "<h1>Acceso restringido</h1><p>Inicia sesión con un perfil autorizado.</p>" +
      '<a href="' +
      rutaFrontend("tienda/inicio-sesion.html") +
      '">Ir al inicio de sesión</a>';
    document.body.append(aviso);
    return;
  }
  adminAutorizado = true;
  document.querySelector(".admin-user-chip").textContent =
    usuario.nombre + " · " + usuario.tipoUsuario;
  const enlaces = document.querySelectorAll("[data-solo-admin]");
  for (let i = 0; i < enlaces.length; i++)
    enlaces[i].hidden = !puedeEditarAdmin();
  if (pagina !== "admin-inicio") return;
  document.querySelector("#admin-user-count").textContent =
    obtenerUsuarios().length;
  cargarProductos(
    function (productos) {
      let criticos = 0;
      for (let i = 0; i < productos.length; i++) {
        if (productos[i].stock <= productos[i].stockMinimo) criticos++;
      }
      document.querySelector("#admin-product-count").textContent =
        productos.length;
      document.querySelector("#admin-critical-count").textContent = criticos;
    },
    function (mensaje) {
      mostrarMensaje(
        document.querySelector("#admin-load-error"),
        mensaje,
        true,
      );
    },
  );
}
iniciarAdmin();
