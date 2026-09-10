// Navegación compartida: cada enlace abre ahora un HTML independiente.
function actualizarContadorCarrito() {
  const contador = document.querySelector("#cart-count");
  if (!contador) return;
  const carrito = leerListaGuardada(clavesDatos.carrito) || [];
  let cantidad = 0;
  for (let i = 0; i < carrito.length; i++)
    cantidad += Number(carrito[i].cantidad) || 0;
  contador.textContent = cantidad;
}

// La sesión guarda solo el RUN; el perfil se consulta en la lista actual.
function usuarioDeSesion() {
  const sesion = leerDatoGuardado(clavesDatos.sesion, null);
  if (!sesion || !sesion.run) return null;
  const usuario = buscarPorCampo(obtenerUsuarios(), "run", sesion.run);
  if (!usuario || !usuario.activo) return null;
  return usuario;
}

function cerrarSesion() {
  if (!guardarDato(clavesDatos.sesion, null)) {
    alert("No se pudo cerrar la sesión. Inténtalo nuevamente.");
    return;
  }
  window.location.href = rutaFrontend("tienda/inicio-sesion.html");
}

const botonMenu = document.querySelector(".menu-button");
if (botonMenu) {
  botonMenu.addEventListener("click", function () {
    const navegacion = document.querySelector(".main-nav");
    const abierto = navegacion.classList.toggle("is-open");
    botonMenu.setAttribute("aria-expanded", String(abierto));
  });
}
const botonesSalir = document.querySelectorAll("[data-logout]");
for (let i = 0; i < botonesSalir.length; i++)
  botonesSalir[i].addEventListener("click", cerrarSesion);
const enlaceAdmin = document.querySelector("#nav-admin");
const sesionActual = usuarioDeSesion();
if (enlaceAdmin && sesionActual && sesionActual.tipoUsuario !== "Cliente") {
  enlaceAdmin.hidden = false;
  if (sesionActual.tipoUsuario === "Vendedor")
    enlaceAdmin.href = rutaFrontend("admin/productos/listado.html");
}

// "Mi cuenta" aparece sólo con sesión activa; entonces "Ingreso" se oculta.
const enlaceCuenta = document.querySelector("#nav-cuenta");
const enlaceIngreso = document.querySelector("#nav-ingreso");
const botonSalir = document.querySelector("#nav-salir");
if (enlaceCuenta) enlaceCuenta.hidden = !sesionActual;
if (enlaceIngreso) enlaceIngreso.hidden = Boolean(sesionActual);
if (botonSalir) botonSalir.hidden = !sesionActual;

// Contacto es un canal para clientes: los perfiles internos no lo necesitan.
const enlaceContacto = document.querySelector("#nav-contacto");
const perfilInterno =
  Boolean(sesionActual) && sesionActual.tipoUsuario !== "Cliente";
if (enlaceContacto) enlaceContacto.hidden = perfilInterno;

// En el panel administrativo el recuadro superior identifica a quien entró.
const chipUsuario = document.querySelector(".admin-user-chip");
if (chipUsuario && sesionActual) {
  const nombre = (
    sesionActual.nombre +
    " " +
    (sesionActual.apellidos || "")
  ).trim();
  chipUsuario.innerHTML =
    '<span aria-hidden="true">' +
    escaparHtml(nombre.charAt(0).toUpperCase()) +
    "</span>" +
    escaparHtml(nombre) +
    ' <small class="admin-user-rol">' +
    escaparHtml(sesionActual.tipoUsuario) +
    "</small>";
}

actualizarContadorCarrito();
window.addEventListener("storage", actualizarContadorCarrito);