import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();

/**
 * CONFIGURACIÓN DE GMAIL (Para enviar sin dominio propio)
 * 1. Usá tu dirección de Gmail.
 * 2. NO USES tu contraseña normal. Tenés que crear una "Contraseña de Aplicación".
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tu-email@gmail.com", // <--- Tu Gmail aquí
    pass: "xxxx xxxx xxxx xxxx", // <--- Tu Contraseña de Aplicación aquí
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static("."));

/**
 * Función helper para enviar emails con Nodemailer
 */
async function sendEmail({ to, subject, html, category }) {
  try {
    const info = await transporter.sendMail({
      from: '"FormDemo" <tu-email@gmail.com>', // <--- Tu Gmail aquí también
      to,
      subject,
      html,
    });

    console.log(`[Email Sent - ${category}]:`, info.messageId);
    return { ok: true, data: info };
  } catch (e) {
    console.error(`[Nodemailer Error - ${category}]:`, e);
    // Mensaje amigable para el frontend si las credenciales fallan
    if (e.code === "EAUTH") {
      return {
        ok: false,
        error:
          "Error de autenticación: Verificá tu Contraseña de Aplicación de Gmail.",
      };
    }
    return {
      ok: false,
      error: "Error al enviar el correo. Intentá de nuevo más tarde.",
    };
  }
}

// ─── MASCOTAS ────────────────────────────────────────────────
app.post("/mascotas", async (req, res) => {
  const { owner, email, petname, species, breed, petage } = req.body;

  const result = await sendEmail({
    to: email,
    subject: `🐾 Registro de ${petname} confirmado`,
    category: "Mascotas",
    html: `
      <div style="font-family:sans-serif;background-color:#000;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto;border:1px solid #222">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:20px;letter-spacing:-0.02em">Registro Confirmado</h2>
        <p style="color:#888;font-size:16px;line-height:1.5">Hola ${owner}, tu mascota ha sido registrada exitosamente en nuestra plataforma.</p>
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:20px;margin:24px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Mascota</td><td style="text-align:right;font-weight:500">${petname}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Especie</td><td style="text-align:right;font-weight:500">${species}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Raza</td><td style="text-align:right;font-weight:500">${breed}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Edad</td><td style="text-align:right;font-weight:500">${petage} año${petage == 1 ? "" : "s"}</td></tr>
          </table>
        </div>
        <p style="color:#444;font-size:12px;margin-top:40px;border-top:1px solid #222;padding-top:20px">FormDemo • Enviado con Nodemailer</p>
      </div>
    `,
  });

  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

// ─── CURSOS ──────────────────────────────────────────────────
app.post("/cursos", async (req, res) => {
  const { name, email, age, course, level, motivation } = req.body;

  const result = await sendEmail({
    to: email,
    subject: `📚 Inscripción a ${course} confirmada`,
    category: "Cursos",
    html: `
      <div style="font-family:sans-serif;background-color:#000;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto;border:1px solid #222">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:20px;letter-spacing:-0.02em">Inscripción Exitosa</h2>
        <p style="color:#888;font-size:16px;line-height:1.5">Hola ${name}, hemos recibido tu inscripción para el curso de <strong>${course}</strong>.</p>
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:20px;margin:24px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Curso</td><td style="text-align:right;font-weight:500">${course}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Nivel</td><td style="text-align:right;font-weight:500">${level}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Edad</td><td style="text-align:right;font-weight:500">${age} años</td></tr>
          </table>
          <p style="color:#888;font-size:14px;margin-top:16px;font-style:italic">"${motivation}"</p>
        </div>
        <p style="color:#444;font-size:12px;margin-top:40px;border-top:1px solid #222;padding-top:20px">FormDemo • Enviado con Nodemailer</p>
      </div>
    `,
  });

  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

// ─── EVENTOS ─────────────────────────────────────────────────
app.post("/eventos", async (req, res) => {
  const { name, email, age, event, tickets, diet } = req.body;

  const result = await sendEmail({
    to: email,
    subject: `🎟️ Reserva para ${event} confirmada`,
    category: "Eventos",
    html: `
      <div style="font-family:sans-serif;background-color:#000;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:auto;border:1px solid #222">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:20px;letter-spacing:-0.02em">Reserva Confirmada</h2>
        <p style="color:#888;font-size:16px;line-height:1.5">Hola ${name}, tu lugar en <strong>${event}</strong> ha sido reservado.</p>
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:20px;margin:24px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Evento</td><td style="text-align:right;font-weight:500">${event}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Entradas</td><td style="text-align:right;font-weight:500">${tickets}</td></tr>
            <tr><td style="color:#555;padding:8px 0;font-size:14px">Dieta</td><td style="text-align:right;font-weight:500">${diet}</td></tr>
          </table>
        </div>
        <p style="color:#444;font-size:12px;margin-top:40px;border-top:1px solid #222;padding-top:20px">FormDemo • Enviado con Nodemailer</p>
      </div>
    `,
  });

  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

app.listen(3001, () => console.log("Servidor listo en http://localhost:3001"));
