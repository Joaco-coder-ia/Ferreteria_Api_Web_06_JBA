// Las reglas devuelven texto vacío cuando el valor es válido.
function validarCorreo(correo) {
  correo = correo.trim().toLowerCase();
  if (!correo) return "El correo es obligatorio.";
  if (correo.length > 100) return "El correo admite hasta 100 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return "Ingresa un correo válido.";
  const dominio = correo.split("@")[1];
  if (
    dominio !== "duoc.cl" &&
    dominio !== "profesor.duoc.cl" &&
    dominio !== "gmail.com"
  ) {
    return "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  }
  return "";
}

function validarClave(clave) {
  if (clave.length < 4 || clave.length > 10)
    return "La contraseña debe tener entre 4 y 10 caracteres.";
  return "";
}

function validarTexto(valor, nombre, maximo, obligatorio) {
  if (obligatorio && !valor.trim()) return nombre + " es obligatorio.";
  if (valor.trim().length > maximo)
    return nombre + " admite hasta " + maximo + " caracteres.";
  return "";
}

// Mostrar el error está separado de decidir si el dato es válido.
function establecerError(campo, mensaje) {
  if (!campo) return;
  let salida = document.getElementById(campo.id + "-error");
  if (!salida) {
    salida = document.createElement("small");
    salida.id = campo.id + "-error";
    salida.className = "admin-field-error";
    campo.insertAdjacentElement("afterend", salida);
    const descripcion = campo.getAttribute("aria-describedby") || "";
    campo.setAttribute(
      "aria-describedby",
      (descripcion + " " + salida.id).trim(),
    );
  }
  campo.classList.toggle("is-invalid", Boolean(mensaje));
  campo.setAttribute("aria-invalid", String(Boolean(mensaje)));
  salida.textContent = mensaje;
  salida.hidden = !mensaje;
}

// Un mismo recorrido sirve para formularios públicos y administrativos.
function mostrarErrores(formulario, errores) {
  const campos = formulario.querySelectorAll("input, select, textarea");
  let primero = null;
  for (let i = 0; i < campos.length; i++) {
    const mensaje = errores[campos[i].name] || "";
    establecerError(campos[i], mensaje);
    if (mensaje && primero === null) primero = campos[i];
  }
  if (primero) {
    primero.focus();
    return false;
  }
  return true;
}

function activarValidacion(formulario, revisar) {
  function revisarCampo(evento) {
    const campo = evento.target;
    if (!campo.name) return;
    const errores = revisar();
    establecerError(campo, errores[campo.name] || "");
  }
  formulario.addEventListener("input", revisarCampo);
  formulario.addEventListener("change", revisarCampo);
}
