function validarContacto(datos) {
  return {
    nombre: validarTexto(datos.nombre, "El nombre", 100, true),
    correo: validarCorreo(datos.correo),
    comentario: validarTexto(datos.comentario, "El comentario", 500, true),
  };
}
