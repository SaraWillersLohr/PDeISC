// genera un archivo pdf con el ranking de jugadores usando la librería jspdf.
// la función descargarPDF recibe un array de jugadores y arma el pdf del ranking.
export function descargarPDF(ranking) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    console.error("jsPDF no está cargado");
    return;
  }

  const doc = new jsPDF();
  const margin = 15;
  const startY = 40;

  // título y cabecera del documento.
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(56, 110, 20); // Verde institucional #386e14
  doc.text("Ranking Oficial - Ahorcado Técnico", margin, 23);

  // subtítulo con la fecha de generación.
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, margin, 29);

  // línea divisoria de color institucional.
  doc.setDrawColor(216, 30, 30); // #d81e1e
  doc.setLineWidth(1);
  doc.line(margin, 31, 195, 31);

  // columnas de la tabla del ranking.
  const columns = [
    { header: "Nombre", x: 17 },
    { header: "Especialidad", x: 67 },
    { header: "Puntos", x: 107 },
    { header: "Tiempo", x: 137 },
    { header: "Fecha", x: 167 },
  ];

  // dibuja los encabezados de la tabla.
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setFillColor(56, 110, 20); // Fondo verde
  doc.setTextColor(255); // Texto blanco
  doc.rect(margin, startY, 180, 8, "F");

  columns.forEach((col) => {
    doc.text(col.header, col.x, startY + 5.5);
  });

  // filas del ranking.
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(33); // Gris oscuro para lectura cómoda

  let currentY = startY + 8;
  ranking.forEach((jugador, idx) => {
    // crea una nueva página si el contenido se pasa del límite.
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;

      // repite el encabezado en la nueva página.
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(56, 110, 20);
      doc.setTextColor(255);
      doc.rect(margin, currentY, 180, 8, "F");
      columns.forEach((col) => {
        doc.text(col.header, col.x, currentY + 5.5);
      });
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(33);
      currentY += 8;
    }

    // alterna el color de las filas para mejorar la lectura.
    if (idx % 2 === 0) {
      doc.setFillColor(248, 251, 247); // Tintado sutil verde/gris
    } else {
      doc.setFillColor(255);
    }
    doc.rect(margin, currentY, 180, 8, "F");

    // formatea el tiempo en minutos y segundos.
    const mins = Math.floor(jugador.tiempo / 60);
    const secs = jugador.tiempo % 60;
    const tiempoFormateado = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    // dibuja las celdas del ranking.
    doc.text(jugador.nombre, columns[0].x, currentY + 5.5);

    // deja la especialidad con un formato más legible.
    const esp = jugador.especialidad.toLowerCase();
    const espText =
      esp === "mmo" ? "MMO" : esp.charAt(0).toUpperCase() + esp.slice(1);

    doc.text(espText, columns[1].x, currentY + 5.5);
    doc.text(jugador.puntos.toString(), columns[2].x, currentY + 5.5);
    doc.text(tiempoFormateado, columns[3].x, currentY + 5.5);

    const fechaText = new Date(jugador.fecha).toLocaleDateString();
    doc.text(fechaText, columns[4].x, currentY + 5.5);

    currentY += 8;
  });

  doc.save("ranking_ahorcado_tecnico.pdf");
}
