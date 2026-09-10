// Validación del RUN chileno mediante su dígito verificador.
function normalizarRun(run) {
  return String(run)
    .replace(/[.\-\s]/g, "")
    .toUpperCase();
}

function runValido(run) {
  const limpio = normalizarRun(run);
  if (!/^\d{6,8}[\dK]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador++;
    if (multiplicador > 7) multiplicador = 2;
  }
  const resto = 11 - (suma % 11);
  let esperado = String(resto);
  if (resto === 11) esperado = "0";
  if (resto === 10) esperado = "K";
  return limpio.slice(-1) === esperado;
}

function validarUsuario(datos, usuarios, runOriginal) {
  const errores = {};
  if (!runValido(datos.run))
    errores.run = "Ingresa un RUN válido, entre 7 y 9 caracteres.";
  errores.nombre = validarTexto(datos.nombre, "El nombre", 50, true);
  errores.apellidos = validarTexto(datos.apellidos, "El apellido", 100, true);
  errores.correo = validarCorreo(datos.correo);
  errores.direccion = validarTexto(datos.direccion, "La dirección", 300, true);
  const roles = ["Administrador", "Vendedor", "Cliente"];
  if (roles.indexOf(datos.tipoUsuario) === -1)
    errores.tipoUsuario = "Selecciona un tipo de usuario.";
  const comunas = comunasPorRegion[datos.region];
  if (!comunas) errores.region = "Selecciona una región.";
  if (!comunas || comunas.indexOf(datos.comuna) === -1)
    errores.comuna = "Selecciona una comuna de la región.";
  if (datos.fechaNacimiento) {
    const fecha = new Date(datos.fechaNacimiento + "T00:00:00");
    if (isNaN(fecha.getTime()) || fecha > new Date()) {
      errores.fechaNacimiento =
        "Ingresa una fecha de nacimiento válida, no futura.";
    }
  }
  for (let i = 0; i < usuarios.length; i++) {
    if (
      normalizarRun(usuarios[i].run) === datos.run &&
      datos.run !== runOriginal
    ) {
      errores.run = "Ya existe un usuario registrado con este RUN.";
    }
    if (
      usuarios[i].correo.toLowerCase() === datos.correo &&
      normalizarRun(usuarios[i].run) !== runOriginal
    ) {
      errores.correo = "Ya existe un usuario registrado con este correo.";
    }
  }
  return errores;
}

// Admin y registro comparten los campos de persona. El perfil público es Cliente.
function datosUsuarioDesdeFormulario(formulario) {
  const campos = formulario.elements;
  let tipoUsuario = "Cliente";
  if (campos.tipoUsuario) tipoUsuario = campos.tipoUsuario.value;
  return {
    run: normalizarRun(campos.run.value),
    nombre: campos.nombre.value.trim(),
    apellidos: campos.apellidos.value.trim(),
    correo: campos.correo.value.trim().toLowerCase(),
    fechaNacimiento: campos.fechaNacimiento.value,
    tipoUsuario: tipoUsuario,
    region: campos.region.value,
    comuna: campos.comuna.value,
    direccion: campos.direccion.value.trim(),
  };
}
