// El contacto conserva el envío simulado de la entrega frontend.
const formularioContacto = document.querySelector("#contact-form");
function datosContacto() {
  return {
    nombre: formularioContacto.elements.nombre.value.trim(),
    correo: formularioContacto.elements.correo.value.trim(),
    comentario: formularioContacto.elements.comentario.value.trim(),
  };
}
function erroresContacto() {
  return validarContacto(datosContacto());
}
activarValidacion(formularioContacto, erroresContacto);
formularioContacto.addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (!mostrarErrores(formularioContacto, erroresContacto())) return;
  mostrarMensaje(
    document.querySelector("#contact-message-status"),
    "Consulta registrada para esta demostración. No se envía a un servidor.",
    false,
  );
  formularioContacto.reset();
});
