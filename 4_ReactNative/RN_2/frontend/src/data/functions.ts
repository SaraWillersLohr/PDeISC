// Describe en un solo lugar las funciones que aparecen en el catálogo.
export const functions = [
  { id: "camara", icon: "📷", category: "CÁMARA", title: "Cámara y flash", summary: "Activá la cámara, tomá una foto y probá el flash." },
  { id: "lector", icon: "▦", category: "CÓDIGOS", title: "Lector QR y barras", summary: "Leé el contenido de un QR o de un código comercial." },
  { id: "ubicacion", icon: "⌖", category: "GPS", title: "Ubicación", summary: "Consultá coordenadas y precisión de la ubicación actual." },
  { id: "movimiento", icon: "◉", category: "SENSORES", title: "Acelerómetro y giroscopio", summary: "Observá cómo responde el teléfono cuando lo movés." },
  { id: "brujula", icon: "✥", category: "SENSORES", title: "Brújula digital", summary: "Visualizá las lecturas del magnetómetro en los tres ejes." },
  { id: "pasos", icon: "👟", category: "ACTIVIDAD", title: "Contador de pasos", summary: "Comprobá el podómetro y los pasos registrados desde el inicio." },
  { id: "biometria", icon: "◎", category: "SEGURIDAD", title: "Biometría", summary: "Verificá huella o reconocimiento facial configurado." },
] as const;

// Deriva los identificadores válidos para mantener alineadas las rutas y las fichas.
export type FunctionId = (typeof functions)[number]["id"];
