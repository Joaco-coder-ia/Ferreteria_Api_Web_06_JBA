// Herramientas pequeñas que pueden ocupar la tienda y el administrador.
// Cada HTML indica en data-raiz cómo llegar a la carpeta frontend.
function rutaFrontend(archivo) {
  return document.body.getAttribute("data-raiz") + archivo;
}

function formatearDinero(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 2,
  }).format(valor);
}

// Los textos del usuario se escapan antes de colocarlos dentro de HTML.
function escaparHtml(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parametroPagina(nombre) {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get(nombre) || "";
}

// Conservamos las imágenes guardadas antes de reorganizar las carpetas.
function rutaImagen(imagen) {
  if (!imagen) return "";
  if (imagen.indexOf("data:image/") === 0) return imagen;
  imagen = imagen.replace(
    "assets/img/img_corregidas/",
    "assets/img/productos/",
  );
  imagen = imagen.replace(
    "assets/img/imagenes_sin_formato/",
    "assets/img/productos/originales/",
  );
  if (imagen.indexOf("assets/") !== 0) return "";
  return rutaFrontend(imagen);
}

function buscarPorCampo(lista, campo, valor) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i][campo] === valor) return lista[i];
  }
  return null;
}

function copiarObjeto(original) {
  const copia = {};
  const claves = Object.keys(original);
  for (let i = 0; i < claves.length; i++) {
    copia[claves[i]] = original[claves[i]];
  }
  return copia;
}

function mostrarMensaje(salida, mensaje, esError) {
  if (!salida) return;
  salida.textContent = mensaje;
  salida.hidden = !mensaje;
  salida.classList.toggle("is-error", Boolean(esError));
}

function mostrarMensajeFormulario(formulario, mensaje, tipo) {
  const salida = formulario.querySelector(".admin-form-status");
  if (!salida) return;
  salida.textContent = mensaje;
  salida.hidden = false;
  salida.className = "admin-form-status admin-form-status-" + (tipo || "error");
}

function badge(texto, alerta) {
  let clase = "admin-badge";
  if (alerta) clase += " admin-badge-warning";
  return '<span class="' + clase + '">' + escaparHtml(texto) + "</span>";
}

function estadoProducto(producto) {
  if (producto.stock <= producto.stockMinimo) return "Stock crítico";
  return "Disponible";
}

function imagenProductoHtml(producto) {
  const ruta = rutaImagen(producto.imagen);
  if (!ruta)
    return '<p class="product-image-fallback">Sin imagen disponible</p>';
  return (
    '<img class="product-image" src="' +
    escaparHtml(ruta) +
    '" alt="' +
    escaparHtml(producto.nombre) +
    '" loading="lazy">'
  );
}

// Si una imagen no existe, la tarjeta sigue siendo legible.
function activarRespaldoImagenes() {
  const imagenes = document.querySelectorAll(".product-image");
  for (let i = 0; i < imagenes.length; i++) {
    imagenes[i].addEventListener("error", function (evento) {
      const texto = document.createElement("p");
      texto.className = "product-image-fallback";
      texto.textContent = "Sin imagen disponible";
      evento.target.replaceWith(texto);
    });
  }
}

// El navegador calcula una huella de la contraseña; no guardamos su texto.
// Esta operación tarda un momento, por eso devolvemos el resultado con then.
function huellaClave(clave, sal) {
  const codificador = new TextEncoder();
  return crypto.subtle
    .importKey("raw", codificador.encode(clave), "PBKDF2", false, [
      "deriveBits",
    ])
    .then(function (llave) {
      return crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: codificador.encode(sal),
          iterations: 100000,
          hash: "SHA-256",
        },
        llave,
        256,
      );
    })
    .then(function (resultado) {
      const numeros = new Uint8Array(resultado);
      let texto = "";
      for (let i = 0; i < numeros.length; i++)
        texto += numeros[i].toString(16).padStart(2, "0");
      return texto;
    });
}
