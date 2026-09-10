// Cada función se ejecuta solamente si existe su contenedor en la página.
function renderizarUsuarios() {
  const cuerpo = document.querySelector("#admin-users-body");
  if (!cuerpo) return;
  const usuarios = obtenerUsuarios();
  let filas = "";
  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];
    const consulta = "?run=" + encodeURIComponent(usuario.run);
    let estado = "Inactivo";
    if (usuario.activo) estado = "Activo";
    filas +=
      "<tr><td>" +
      escaparHtml(usuario.run) +
      "</td>" +
      "<td>" +
      escaparHtml(usuario.nombre + " " + usuario.apellidos) +
      "</td>" +
      "<td>" +
      escaparHtml(usuario.correo) +
      "</td>" +
      "<td>" +
      escaparHtml(usuario.tipoUsuario) +
      "</td>" +
      "<td>" +
      badge(estado, !usuario.activo) +
      "</td>" +
      '<td><a href="detalle.html' +
      consulta +
      '">Ver</a> · ' +
      '<a href="editar.html' +
      consulta +
      '">Editar</a></td></tr>';
  }
  cuerpo.innerHTML = filas;
  document.querySelector("#admin-users-count").textContent =
    usuarios.length + " perfiles guardados en este navegador.";
}

function renderizarDetalleUsuario() {
  const detalles = document.querySelector("#admin-user-details");
  if (!detalles) return;
  const run = normalizarRun(parametroPagina("run"));
  const usuario = buscarPorCampo(obtenerUsuarios(), "run", run);
  if (!usuario) {
    detalles.innerHTML =
      "<div><dt>Usuario no encontrado</dt><dd>Vuelve al listado y selecciona un perfil existente.</dd></div>";
    document.querySelector("#admin-user-edit-link").hidden = true;
    return;
  }
  document.querySelector("#admin-user-breadcrumb").textContent = usuario.run;
  document.querySelector("#admin-user-title").textContent =
    usuario.nombre + " " + usuario.apellidos;
  document.querySelector("#admin-user-edit-link").href =
    "editar.html?run=" + encodeURIComponent(usuario.run);
  const etiquetas = [
    "RUN",
    "Nombre",
    "Apellidos",
    "Correo",
    "Fecha de nacimiento",
    "Perfil",
    "Región",
    "Comuna",
    "Dirección",
  ];
  const campos = [
    "run",
    "nombre",
    "apellidos",
    "correo",
    "fechaNacimiento",
    "tipoUsuario",
    "region",
    "comuna",
    "direccion",
  ];
  let contenido = "";
  for (let i = 0; i < campos.length; i++) {
    contenido +=
      "<div><dt>" +
      etiquetas[i] +
      "</dt><dd>" +
      escaparHtml(usuario[campos[i]] || "No informado") +
      "</dd></div>";
  }
  let estado = "Inactivo";
  if (usuario.activo) estado = "Activo";
  contenido +=
    "<div><dt>Estado</dt><dd>" + badge(estado, !usuario.activo) + "</dd></div>";
  detalles.innerHTML = contenido;
}

function iniciarFormularioUsuario() {
  const formulario = document.querySelector(
    "#admin-user-create-form, #admin-user-edit-form",
  );
  if (!formulario) return;
  const esEdicion = formulario.id === "admin-user-edit-form";
  let runOriginal = "";
  if (esEdicion) runOriginal = normalizarRun(parametroPagina("run"));
  const usuario = buscarPorCampo(obtenerUsuarios(), "run", runOriginal);
  if (esEdicion && !usuario) {
    mostrarMensajeFormulario(
      formulario,
      "No se encontró el usuario solicitado.",
    );
    formulario.querySelector('button[type="submit"]').disabled = true;
    return;
  }
  if (usuario) {
    cargarRegiones(formulario, usuario.region, usuario.comuna);
    const campos = [
      "run",
      "nombre",
      "apellidos",
      "correo",
      "fechaNacimiento",
      "tipoUsuario",
      "direccion",
    ];
    for (let i = 0; i < campos.length; i++) {
      formulario.elements[campos[i]].value = usuario[campos[i]] || "";
    }
    formulario.querySelector(".admin-button-secondary").href =
      "detalle.html?run=" + encodeURIComponent(runOriginal);
  } else {
    cargarRegiones(formulario, "", "");
  }
  function revisar() {
    return validarUsuario(
      datosUsuarioDesdeFormulario(formulario),
      obtenerUsuarios(),
      runOriginal,
    );
  }
  activarValidacion(formulario, revisar);
  formulario.elements.run.addEventListener("blur", function () {
    formulario.elements.run.value = normalizarRun(
      formulario.elements.run.value,
    );
    establecerError(formulario.elements.run, revisar().run || "");
  });
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!mostrarErrores(formulario, revisar())) return;
    const datosFormulario = datosUsuarioDesdeFormulario(formulario);
    let datos = {};
    if (usuario) datos = copiarObjeto(usuario);
    const nombres = Object.keys(datosFormulario);
    for (let i = 0; i < nombres.length; i++)
      datos[nombres[i]] = datosFormulario[nombres[i]];
    // Editar el nombre o correo no debe reactivar un usuario inactivo.
    datos.activo = true;
    if (usuario) datos.activo = usuario.activo;
    const lista = obtenerUsuarios();
    if (
      !guardarRegistro(clavesDatos.usuarios, lista, "run", runOriginal, datos)
    ) {
      mostrarMensajeFormulario(
        formulario,
        "No fue posible guardar el usuario. Puedes reintentarlo.",
      );
      return;
    }
    const sesion = leerDatoGuardado(clavesDatos.sesion, null);
    if (sesion && sesion.run === runOriginal)
      guardarDato(clavesDatos.sesion, { run: datos.run });
    window.location.href = "detalle.html?run=" + encodeURIComponent(datos.run);
  });
}

if (adminAutorizado) {
  renderizarUsuarios();
  renderizarDetalleUsuario();
  iniciarFormularioUsuario();
}
