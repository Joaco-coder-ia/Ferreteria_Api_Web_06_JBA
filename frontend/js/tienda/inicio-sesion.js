// Los perfiles iniciales y los creados desde admin usan demo123.
// Los usuarios registrados usan la contraseña que eligieron al registrarse.
const formularioAcceso = document.querySelector("#login-form");

function erroresAcceso() {
  return {
    correo: validarCorreo(formularioAcceso.elements.correo.value),
    clave: validarClave(formularioAcceso.elements.clave.value),
  };
}

activarValidacion(formularioAcceso, erroresAcceso);
const botonesDemo = document.querySelectorAll("[data-demo]");
const correosDemo = {
  admin: "admin@duoc.cl",
  vendedor: "vendedor@profesor.duoc.cl",
  cliente: "cliente@gmail.com",
};
for (let i = 0; i < botonesDemo.length; i++) {
  botonesDemo[i].addEventListener("click", function (evento) {
    formularioAcceso.elements.correo.value =
      correosDemo[evento.currentTarget.getAttribute("data-demo")];
    formularioAcceso.elements.clave.value = "demo123";
    mostrarErrores(formularioAcceso, erroresAcceso());
  });
}

formularioAcceso.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const boton = formularioAcceso.querySelector('button[type="submit"]');
  if (boton.disabled || !mostrarErrores(formularioAcceso, erroresAcceso()))
    return;
  const correo = formularioAcceso.elements.correo.value.trim().toLowerCase();
  const clave = formularioAcceso.elements.clave.value;
  const usuario = buscarPorCampo(obtenerUsuarios(), "correo", correo);
  const salida = document.querySelector("#login-error");
  if (!usuario || !usuario.activo) {
    mostrarMensaje(salida, "Correo o contraseña incorrectos.", true);
    return;
  }
  function terminar(coincide) {
    boton.disabled = false;
    if (!coincide) {
      mostrarMensaje(salida, "Correo o contraseña incorrectos.", true);
      return;
    }
    if (!guardarDato(clavesDatos.sesion, { run: usuario.run })) {
      mostrarMensaje(
        salida,
        "No se pudo guardar la sesión en este navegador.",
        true,
      );
      return;
    }
    let destino = "tienda/cuenta.html";
    if (usuario.tipoUsuario === "Administrador") destino = "admin/index.html";
    if (usuario.tipoUsuario === "Vendedor")
      destino = "admin/productos/listado.html";
    window.location.href = rutaFrontend(destino);
  }
  if (!usuario.claveHuella) {
    terminar(clave === "demo123");
    return;
  }
  boton.disabled = true;
  huellaClave(clave, usuario.sal)
    .then(function (huella) {
      terminar(huella === usuario.claveHuella);
    })
    .catch(function () {
      boton.disabled = false;
      mostrarMensaje(
        salida,
        "No se pudo comprobar la contraseña. Usa Live Server.",
        true,
      );
    });
});
