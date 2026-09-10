// Ventana de acceso: el enlace "Ingreso" abre este modal sin cambiar de página.
// La página inicio-sesion.html se mantiene como respaldo y acceso directo.
function crearModalAcceso() {
  if (document.querySelector("#login-modal")) return;

  const fondo = document.createElement("div");
  fondo.id = "login-overlay";
  fondo.className = "modal-overlay";
  fondo.hidden = true;

  const modal = document.createElement("div");
  modal.id = "login-modal";
  modal.className = "modal-caja";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "login-modal-titulo");
  modal.hidden = true;
  modal.innerHTML =
    '<button class="modal-cerrar" type="button" data-login-close aria-label="Cerrar">&times;</button>' +
    '<div class="modal-marca">' +
    '<strong>Los Maestros</strong>' +
    "<small>Ferretería y construcción</small>" +
    "</div>" +
    '<h2 id="login-modal-titulo">Inicia sesión para comprar</h2>' +
    '<p class="modal-texto">Usa tu cuenta para revisar pedidos y confirmar tus compras.</p>' +
    '<div class="demo-users">' +
    '<button type="button" data-modal-demo="admin">Administrador</button>' +
    '<button type="button" data-modal-demo="vendedor">Vendedor</button>' +
    '<button type="button" data-modal-demo="cliente">Contratista demo</button>' +
    "</div>" +
    '<form id="modal-login-form" novalidate>' +
    '<label for="modal-login-email">Correo electrónico</label>' +
    '<input id="modal-login-email" name="correo" type="email" maxlength="100" required>' +
    '<label for="modal-login-password">Contraseña</label>' +
    '<input id="modal-login-password" name="clave" type="password" minlength="4" maxlength="10" required>' +
    '<p id="modal-login-error" class="form-error" role="alert"></p>' +
    '<button class="button button-primary full" type="submit">Ingresar</button>' +
    "</form>" +
    '<p class="form-help">Clave demo: <strong>demo123</strong></p>' +
    '<p class="form-help">¿Cliente nuevo? ' +
    '<a class="text-button" href="' +
    rutaFrontend("tienda/registro.html") +
    '">Crear una cuenta</a></p>';

  document.body.appendChild(fondo);
  document.body.appendChild(modal);
  prepararFormularioModal();
}

function abrirModalAcceso() {
  crearModalAcceso();
  document.querySelector("#login-overlay").hidden = false;
  document.querySelector("#login-modal").hidden = false;
  document.body.classList.add("modal-abierto");
  const campo = document.querySelector("#modal-login-email");
  if (campo) campo.focus();
}

function cerrarModalAcceso() {
  const modal = document.querySelector("#login-modal");
  if (!modal) return;
  modal.hidden = true;
  document.querySelector("#login-overlay").hidden = true;
  document.body.classList.remove("modal-abierto");
}

// Reutiliza las mismas reglas de validación del formulario de la página.
function prepararFormularioModal() {
  const formulario = document.querySelector("#modal-login-form");
  if (!formulario) return;

  function erroresModal() {
    return {
      correo: validarCorreo(formulario.elements.correo.value),
      clave: validarClave(formulario.elements.clave.value),
    };
  }

  activarValidacion(formulario, erroresModal);

  const correosDemo = {
    admin: "admin@duoc.cl",
    vendedor: "vendedor@profesor.duoc.cl",
    cliente: "cliente@gmail.com",
  };
  const botones = document.querySelectorAll("[data-modal-demo]");
  for (let i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function (evento) {
      formulario.elements.correo.value =
        correosDemo[evento.currentTarget.getAttribute("data-modal-demo")];
      formulario.elements.clave.value = "demo123";
      mostrarErrores(formulario, erroresModal());
    });
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const boton = formulario.querySelector('button[type="submit"]');
    if (boton.disabled || !mostrarErrores(formulario, erroresModal())) return;
    const correo = formulario.elements.correo.value.trim().toLowerCase();
    const clave = formulario.elements.clave.value;
    const usuario = buscarPorCampo(obtenerUsuarios(), "correo", correo);
    const salida = document.querySelector("#modal-login-error");
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
}

document.addEventListener("click", function (evento) {
  // El enlace de ingreso abre la ventana en vez de cambiar de página.
  const enlace = evento.target.closest('a[href*="inicio-sesion.html"]');
  if (enlace && !document.querySelector("#login-form")) {
    evento.preventDefault();
    abrirModalAcceso();
    return;
  }
  if (evento.target.closest("[data-login-close]")) cerrarModalAcceso();
  if (evento.target.closest("#login-overlay")) cerrarModalAcceso();
});

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") cerrarModalAcceso();
});
