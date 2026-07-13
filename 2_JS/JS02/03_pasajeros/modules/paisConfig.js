// Yo defino las reglas de validación por país: documento, teléfono y prefijo
// Esto me permite adaptar las validaciones según la nacionalidad del usuario
export const PAISES_PERMITIDOS = {
  argentina: {
    nombre: "Argentina",
    prefijo: "+54",
    documento: {
      min: 7,
      max: 8,
      minValor: 1000000,
      mensaje: "El DNI argentino debe tener 7 u 8 números",
    },
    telefono: {
      longitudes: [10],
      max: 10,
      mensaje: "El teléfono argentino debe tener 10 números",
    },
  },
  // Agrego otros países de la región con sus reglas específicas
  chile: {
    nombre: "Chile",
    prefijo: "+56",
    documento: {
      min: 7,
      max: 8,
      minValor: 1000000,
      mensaje: "El RUT chileno debe tener 7 u 8 números",
    },
    telefono: {
      longitudes: [9],
      max: 9,
      mensaje: "El teléfono chileno debe tener 9 números",
    },
  },
  uruguay: {
    nombre: "Uruguay",
    prefijo: "+598",
    documento: {
      min: 7,
      max: 8,
      minValor: 1000000,
      mensaje: "La cédula uruguaya debe tener 7 u 8 números",
    },
    telefono: {
      longitudes: [8, 9],
      max: 9,
      mensaje: "El teléfono uruguayo debe tener 8 o 9 números",
    },
  },
  brasil: {
    nombre: "Brasil",
    prefijo: "+55",
    documento: {
      min: 11,
      max: 11,
      minValor: 10000000000,
      mensaje: "El CPF brasileño debe tener 11 números",
    },
    telefono: {
      longitudes: [10, 11],
      max: 11,
      mensaje: "El teléfono brasileño debe tener 10 u 11 números",
    },
  },
  paraguay: {
    nombre: "Paraguay",
    prefijo: "+595",
    documento: {
      min: 6,
      max: 8,
      minValor: 100000,
      mensaje: "El documento paraguayo debe tener 6 a 8 números",
    },
    telefono: {
      longitudes: [9],
      max: 9,
      mensaje: "El teléfono paraguayo debe tener 9 números",
    },
  },
};

// Yo obtengo la configuración de un país según su código
export const obtenerConfigPais = (codigo) => PAISES_PERMITIDOS[codigo] || null;
