type InputError = Error & { status: number };

// Lanza errores de validación que la API responde como solicitudes inválidas.
function invalid(message: string): never {
  const error = new Error(message) as InputError;
  error.status = 400;
  throw error;
}

// Comprueba cantidades enteras dentro del rango permitido.
export function integer(value: unknown, label: string, min = 0): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min)
    invalid(`${label} no es válido.`);
  return number;
}

// Valida y normaliza los datos recibidos al crear o editar productos.
export function productInput(body: Record<string, unknown>) {
  const nombre = String(body.nombre ?? "").trim();
  const codigo = String(body.codigo ?? "").trim();
  // No se puede guardar un producto sin sus dos datos de identificación.
  if (!nombre || !codigo) invalid("El nombre y el código son obligatorios.");
  const precio =
    body.precio === "" || body.precio == null ? null : Number(body.precio);
  // Evita precios negativos o valores que no sean números válidos.
  if (precio !== null && (!Number.isFinite(precio) || precio < 0))
    invalid("El precio no puede ser negativo.");
  const fecha = body.fecha_vencimiento ? String(body.fecha_vencimiento) : null;
  // Comprueba el formato de fecha antes de dejar que MariaDB procese el valor.
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    invalid("La fecha debe tener formato AAAA-MM-DD.");
  // Convierte los identificadores de categoría y valida que sean positivos.
  const categorias = Array.isArray(body.categorias)
    ? body.categorias.map((id) => integer(id, "Categoría", 1))
    : [];
  return {
    nombre,
    codigo,
    descripcion: String(body.descripcion ?? "").trim() || null,
    precio,
    stock: integer(body.stock_inicial ?? body.stock_actual ?? 0, "El stock"),
    minimo: integer(body.stock_minimo ?? 0, "El stock mínimo"),
    fecha,
    categorias,
  };
}
