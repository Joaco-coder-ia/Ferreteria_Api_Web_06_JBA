// Registro local: los campos de persona y sus reglas se comparten con admin.
// El tipo de cuenta decide si además se piden los datos de la empresa.
const formularioRegistro = document.querySelector("#register-form");
const bloqueEmpresa = document.querySelector("#empresa-bloque");
const selectorTipoCuenta = formularioRegistro.elements.tipoCuenta;
cargarRegiones(formularioRegistro, "", "");

function esContratista() {
  return selectorTipoCuenta.value === "Contratista";
}

// El bloque de empresa sólo participa en la validación cuando está visible.
function alternarBloqueEmpresa() {
  const contratista = esContratista();
  bloqueEmpresa.hidden = !contratista;
  const campos = ["empresaRut", "empresaRazon", "empresaDireccion"];
  for (let i = 0; i < campos.length; i++) {
    const campo = formularioRegistro.elements[campos[i]];
    campo.required = contratista;
    if (!contratista) {
      campo.value = "";
      establecerError(campo, "");
    }
  }
}

// El teléfono es opcional, pero si se completa debe tener un formato válido.
function validarTelefono(valor) {
  const limpio = String(valor).replace(/[\s.-]/g, "");
  if (!limpio) return "";
  if (!/^\+?\d{8,12}$/.test(limpio))
    return "Ingresa un teléfono válido, entre 8 y 12 dígitos.";
  return "";
}

function erroresRegistro() {
  const datos = datosUsuarioDesdeFormulario(formularioRegistro);
  const errores = validarUsuario(datos, obtenerUsuarios(), "");
  errores.clave = validarClave(formularioRegistro.elements.clave.value);
  errores.telefono = validarTelefono(
    formularioRegistro.elements.telefono.value,
  );
  if (
    formularioRegistro.elements.clave.value !==
    formularioRegistro.elements.confirmacion.value
  ) {
    errores.confirmacion = "Las contraseñas deben coincidir.";
  }
  if (esContratista()) {
    const rut = normalizarRun(formularioRegistro.elements.empresaRut.value);
    if (!runValido(rut))
      errores.empresaRut = "Ingresa un RUT de empresa válido.";
    errores.empresaRazon = validarTexto(
      formularioRegistro.elements.empresaRazon.value,
      "La razón social",
      100,
      true,
    );
    errores.empresaDireccion = validarTexto(
      formularioRegistro.elements.empresaDireccion.value,
      "La dirección de la empresa",
      300,
      true,
    );
  }
  return errores;
}

activarValidacion(formularioRegistro, erroresRegistro);
selectorTipoCuenta.addEventListener("change", alternarBloqueEmpresa);
alternarBloqueEmpresa();

// Al salir del campo dejamos el RUN sin puntos ni guion, como se almacena.
formularioRegistro.elements.run.addEventListener("blur", function () {
  formularioRegistro.elements.run.value = normalizarRun(
    formularioRegistro.elements.run.value,
  );
});
formularioRegistro.elements.empresaRut.addEventListener("blur", function () {
  formularioRegistro.elements.empresaRut.value = normalizarRun(
    formularioRegistro.elements.empresaRut.value,
  );
});

formularioRegistro.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const boton = formularioRegistro.querySelector('button[type="submit"]');
  if (boton.disabled || !mostrarErrores(formularioRegistro, erroresRegistro()))
    return;
  const usuario = datosUsuarioDesdeFormulario(formularioRegistro);
  usuario.activo = true;
  usuario.sal = crypto.randomUUID();
  usuario.telefono = formularioRegistro.elements.telefono.value.trim();

  // El contratista sigue siendo Cliente; se distingue por sus datos de empresa.
  usuario.esContratista = esContratista();
  if (usuario.esContratista) {
    usuario.empresa = {
      rut: normalizarRun(formularioRegistro.elements.empresaRut.value),
      razonSocial: formularioRegistro.elements.empresaRazon.value.trim(),
      direccion: formularioRegistro.elements.empresaDireccion.value.trim(),
    };
  }

  boton.disabled = true;
  const salida = document.querySelector("#register-message");
  huellaClave(formularioRegistro.elements.clave.value, usuario.sal)
    .then(function (huella) {
      const actuales = obtenerUsuarios();
      if (
        !mostrarErrores(formularioRegistro, validarUsuario(usuario, actuales, ""))
      )
        return;
      usuario.claveHuella = huella;
      if (!guardarRegistro(clavesDatos.usuarios, actuales, "run", "", usuario)) {
        mostrarMensaje(
          salida,
          "No se pudo guardar tu cuenta. Puedes reintentarlo.",
          true,
        );
        return;
      }
      formularioRegistro.reset();
      formularioRegistro.elements.comuna.innerHTML =
        '<option value="">Selecciona una comuna</option>';
      alternarBloqueEmpresa();
      mostrarMensaje(
        salida,
        "Cuenta creada en este navegador. Ya puedes iniciar sesión.",
        false,
      );
    })
    .catch(function () {
      mostrarMensaje(
        salida,
        "No se pudo crear la cuenta. Abre el proyecto con Live Server.",
        true,
      );
    })
    .finally(function () {
      boton.disabled = false;
    });
});