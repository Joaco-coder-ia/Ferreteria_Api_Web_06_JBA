// Todas las páginas usan las mismas claves para conservar los datos existentes.
const clavesDatos = {
  productos: "ep1-products",
  usuarios: "ep1-users",
  carrito: "ep1-cart",
  pedidos: "ep1-orders",
  abonos: "ep1-payments",
  sesion: "ep1-user",
};

function leerDatoGuardado(clave, valorInicial) {
  try {
    const texto = localStorage.getItem(clave);
    if (texto === null) return valorInicial;
    return JSON.parse(texto);
  } catch (error) {
    console.warn("No se pudo leer " + clave, error);
    return valorInicial;
  }
}

function leerListaGuardada(clave) {
  const lista = leerDatoGuardado(clave, null);
  if (!Array.isArray(lista)) return null;
  return lista;
}

function guardarDato(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.warn("No se pudo guardar " + clave, error);
    return false;
  }
}

function obtenerUsuarios() {
  const guardados = leerListaGuardada(clavesDatos.usuarios);
  if (guardados !== null) return guardados;
  const usuarios = crearUsuariosIniciales();
  guardarDato(clavesDatos.usuarios, usuarios);
  return usuarios;
}

// Normalizar ayuda a leer tanto el catálogo original como productos del admin.
function normalizarProducto(producto) {
  const normalizado = copiarObjeto(producto);
  normalizado.codigo = String(producto.codigo || "")
    .trim()
    .toUpperCase();
  normalizado.nombre = String(producto.nombre || "").trim();
  normalizado.descripcion = String(producto.descripcion || "");
  normalizado.precioVenta = Number(producto.precioVenta) || 0;
  normalizado.stock = Number(producto.stock) || 0;
  normalizado.stockMinimo = Number(producto.stockMinimo) || 0;
  if (producto.imagen === undefined) {
    normalizado.imagen = "assets/img/productos/" + normalizado.codigo + ".svg";
  } else {
    normalizado.imagen = producto.imagen || "";
  }
  return normalizado;
}

function normalizarProductos(productos) {
  const resultado = [];
  for (let i = 0; i < productos.length; i++) {
    resultado.push(normalizarProducto(productos[i]));
  }
  return resultado;
}

// fetch es asíncrono: la función recibir se ejecuta cuando los datos están listos.
// Primero leemos los cambios del admin; el JSON solo inicia el catálogo.
function cargarProductos(recibir, informarError) {
  const guardados = leerListaGuardada(clavesDatos.productos);
  if (guardados !== null) {
    recibir(normalizarProductos(guardados));
    return;
  }
  fetch(rutaFrontend("data/productos.json"))
    .then(function (respuesta) {
      if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo.");
      return respuesta.json();
    })
    .then(function (datos) {
      if (!Array.isArray(datos))
        throw new Error("El catálogo no contiene una lista.");
      const productos = normalizarProductos(datos);
      guardarDato(clavesDatos.productos, productos);
      recibir(productos);
    })
    .catch(function (error) {
      console.error(error);
      if (informarError) informarError(error.message);
    });
}

// Preparamos otra lista: si falla el guardado, el formulario puede reintentarlo.
function guardarRegistro(clave, lista, campo, original, registro) {
  const actualizados = lista.slice();
  if (original) {
    let indice = -1;
    for (let i = 0; i < actualizados.length; i++) {
      if (actualizados[i][campo] === original) indice = i;
    }
    if (indice === -1) return false;
    actualizados[indice] = registro;
  } else {
    actualizados.push(registro);
  }
  return guardarDato(clave, actualizados);
}

// Estos perfiles se usan solo para la demostración universitaria.
function crearUsuariosIniciales() {
  return [
    {
      run: "123456785",
      nombre: "Administrador",
      apellidos: "Demo Grupo 6",
      correo: "admin@duoc.cl",
      fechaNacimiento: "",
      tipoUsuario: "Administrador",
      region: "Región de Coquimbo",
      comuna: "La Serena",
      direccion: "Dirección de demostración",
      activo: true,
    },
    {
      run: "111111111",
      nombre: "Vendedor",
      apellidos: "Demo Grupo 6",
      correo: "vendedor@profesor.duoc.cl",
      fechaNacimiento: "",
      tipoUsuario: "Vendedor",
      region: "Región de Coquimbo",
      comuna: "Coquimbo",
      direccion: "Dirección de demostración",
      activo: true,
    },
    {
      run: "222222222",
      nombre: "Cliente",
      apellidos: "Demo Grupo 6",
      correo: "cliente@gmail.com",
      fechaNacimiento: "",
      tipoUsuario: "Cliente",
      region: "Región de Coquimbo",
      comuna: "Ovalle",
      direccion: "Dirección de demostración",
      activo: true,
    },
  ];
}