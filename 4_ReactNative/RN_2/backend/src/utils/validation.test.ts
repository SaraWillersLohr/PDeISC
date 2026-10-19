import { strict as assert } from "node:assert";
import { test } from "node:test";
import { integer, productInput } from "./validation";

// Comprueba que los códigos se conservan como texto y se recortan espacios.
test("normaliza nombre y conserva ceros iniciales del código", () => {
  const product = productInput({
    nombre: "  Yerba  ",
    codigo: "00123",
    stock_inicial: "0",
  });
  assert.equal(product.nombre, "Yerba");
  assert.equal(product.codigo, "00123");
  assert.equal(product.stock, 0);
});

// Rechaza cantidades o precios negativos y campos obligatorios vacíos.
test("rechaza datos inválidos de producto", () => {
  assert.throws(() => integer(-1, "Stock"), /no es válido/);
  assert.throws(
    () => productInput({ nombre: "Producto", codigo: "A", precio: -1 }),
    /no puede ser negativo/,
  );
  assert.throws(
    () => productInput({ nombre: "", codigo: "A" }),
    /obligatorios/,
  );
});

// Acepta una fecha opcional solo con el formato esperado.
test("valida el formato de vencimiento", () => {
  assert.equal(
    productInput({
      nombre: "Leche",
      codigo: "B",
      fecha_vencimiento: "2026-10-25",
    }).fecha,
    "2026-10-25",
  );
  assert.throws(
    () =>
      productInput({
        nombre: "Leche",
        codigo: "B",
        fecha_vencimiento: "25/10/2026",
      }),
    /formato/,
  );
});
