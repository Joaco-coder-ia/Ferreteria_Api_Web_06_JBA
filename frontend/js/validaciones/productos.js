const categoriasProducto = [
  "Electricidad",
  "Gasfitería",
  "Herramientas",
  "Jardín",
  "Madera",
  "Mat. Construcción",
  "Pinturas",
  "Seguridad",
  "Tornillería",
];

function validarNumero(valor, obligatorio, entero) {
  if (valor === "") {
    if (obligatorio) return "Este valor es obligatorio.";
    return "";
  }
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0)
    return "Ingresa un número válido, igual o mayor a cero.";
  if (entero && !Number.isInteger(numero)) return "Ingresa un número entero.";
  return "";
}

function validarImagen(archivo) {
  if (!archivo) return "";
  const tipos = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (tipos.indexOf(archivo.type) === -1)
    return "Selecciona una imagen PNG, JPG, WebP o SVG.";
  if (archivo.size > 500 * 1024) return "La imagen no puede superar 500 KB.";
  return "";
}

function validarProducto(datos, productos, codigoOriginal, archivo) {
  const errores = {};
  if (datos.codigo.length < 3)
    errores.codigo = "El código debe tener al menos 3 caracteres.";
  errores.nombre = validarTexto(datos.nombre, "El nombre", 100, true);
  errores.descripcion = validarTexto(
    datos.descripcion,
    "La descripción",
    500,
    false,
  );
  errores.precio = validarNumero(datos.precio, true, false);
  errores.stock = validarNumero(datos.stock, true, true);
  errores.stockCritico = validarNumero(datos.stockCritico, false, true);
  errores.imagen = validarImagen(archivo);
  if (categoriasProducto.indexOf(datos.categoria) === -1)
    errores.categoria = "Selecciona una categoría.";
  for (let i = 0; i < productos.length; i++) {
    if (
      productos[i].codigo === datos.codigo &&
      datos.codigo !== codigoOriginal
    ) {
      errores.codigo = "Ya existe un producto con este código.";
    }
  }
  return errores;
}

function datosProductoDesdeFormulario(formulario) {
  const campos = formulario.elements;
  return {
    codigo: campos.codigo.value.trim().toUpperCase(),
    nombre: campos.nombre.value.trim(),
    descripcion: campos.descripcion.value.trim(),
    precio: campos.precio.value.trim(),
    stock: campos.stock.value.trim(),
    stockCritico: campos.stockCritico.value.trim(),
    categoria: campos.categoria.value,
  };
}
