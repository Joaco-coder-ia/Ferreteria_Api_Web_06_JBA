// Conservamos las regiones y comunas de muestra del proyecto original.
const comunasPorRegion = {
  "Región de Arica y Parinacota": ["Arica", "Camarones", "Putre"],
  "Región de Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  "Región de Antofagasta": ["Antofagasta", "Calama", "Tocopilla"],
  "Región de Atacama": ["Copiapó", "Caldera", "Vallenar"],
  "Región de Coquimbo": [
    "La Serena",
    "Coquimbo",
    "Ovalle",
    "Illapel",
    "Vicuña",
  ],
  "Región de Valparaíso": [
    "Valparaíso",
    "Viña del Mar",
    "Quilpué",
    "San Antonio",
  ],
  "Región Metropolitana de Santiago": [
    "Santiago",
    "Puente Alto",
    "Maipú",
    "La Florida",
  ],
  "Región del Libertador General Bernardo O’Higgins": [
    "Rancagua",
    "Machalí",
    "San Fernando",
  ],
  "Región del Maule": ["Talca", "Curicó", "Linares"],
  "Región de Ñuble": ["Chillán", "San Carlos", "Bulnes"],
  "Región del Biobío": ["Concepción", "Talcahuano", "Los Ángeles"],
  "Región de La Araucanía": ["Temuco", "Villarrica", "Angol"],
  "Región de Los Ríos": ["Valdivia", "La Unión", "Panguipulli"],
  "Región de Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
  "Región de Aysén del General Carlos Ibáñez del Campo": [
    "Coyhaique",
    "Aysén",
    "Chile Chico",
  ],
  "Región de Magallanes y de la Antártica Chilena": [
    "Punta Arenas",
    "Puerto Natales",
    "Porvenir",
  ],
};

// Cargar opciones es una responsabilidad de la interfaz, no de las validaciones.
function cargarRegiones(formulario, regionActual, comunaActual) {
  const region = formulario.elements.region;
  const comuna = formulario.elements.comuna;
  if (!region || !comuna) return;
  region.innerHTML = '<option value="">Selecciona una región</option>';
  const nombres = Object.keys(comunasPorRegion);
  for (let i = 0; i < nombres.length; i++) {
    region.add(new Option(nombres[i], nombres[i]));
  }
  region.value = regionActual || "";
  function actualizarComunas(seleccionada) {
    comuna.innerHTML = '<option value="">Selecciona una comuna</option>';
    const nombresComunas = comunasPorRegion[region.value] || [];
    for (let i = 0; i < nombresComunas.length; i++) {
      comuna.add(new Option(nombresComunas[i], nombresComunas[i]));
    }
    comuna.value = seleccionada || "";
  }
  actualizarComunas(comunaActual);
  region.addEventListener("change", function () {
    actualizarComunas("");
    establecerError(comuna, "Selecciona una comuna de la región.");
  });
}
