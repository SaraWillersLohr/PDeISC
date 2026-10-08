import { type FormEvent, useEffect, useState } from "react";
import { ConfirmModal } from "../components/ui";
import type { Item } from "../types";
import { apiUrl } from "../api";
// Este archivo contiene el panel para iniciar sesión y editar el portfolio.

// Define las secciones de contenido que puede editar el panel.
const sections = [
  ["projects", "proyectos"],
  ["photography", "fotografía"],
  ["education", "formación"],
  ["skills", "habilidades"],
  ["timeline_events", "recorrido"],
  ["learning_items", "aprendizajes"],
  ["objectives", "objetivos"],
  ["social_links", "contacto"],
  ["site_settings", "configuración"],
] as const;
// Envía una solicitud al backend e incluye el token si está disponible.
const api = async (path: string, token?: string, options: RequestInit = {}) => {
  // Guarda la respuesta de la solicitud para validar el resultado.
  const response = await fetch(apiUrl(`/api${path}`), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    // Lee el mensaje de error que devuelve la API, si existe.
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "No se pudo completar la operación.");
  }
  return response.status === 204 ? null : response.json();
};
//componente principal del panel de administración
export function AdminPage() {
  // Recupera la sesión guardada durante esta pestaña del navegador.
  const [token, setToken] = useState(
    () => sessionStorage.getItem("portfolio_token") || "",
  );
  // Indica si se debe pedir al usuario que cambie su contraseña.
  const [firstLogin, setFirstLogin] = useState(false);
  // Guarda la sección que se está editando.
  const [section, setSection] =
    useState<(typeof sections)[number][0]>("projects");
  // Guarda los registros de la sección seleccionada.
  const [rows, setRows] = useState<Item[]>([]);
  // Guarda avisos de éxito o error para mostrarlos en pantalla.
  const [message, setMessage] = useState("");
  // Guarda el elemento que está abierto en el editor.
  const [selected, setSelected] = useState<Item | null>(null);
  // Guarda el elemento pendiente de confirmación para eliminar.
  const [deleting, setDeleting] = useState<Item | null>(null);
  // Guarda el email escrito en el formulario de acceso.
  const [email, setEmail] = useState("");
  // Guarda la contraseña escrita en el formulario.
  const [password, setPassword] = useState("");
  // Carga los elementos de la sección seleccionada.
  const load = async () => {
    if (!token) return;
    try {
      setRows(await api(`/admin/${section}`, token));
      setSelected(null);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error inesperado");
    }
  };
  // Vuelve a cargar los elementos cuando cambia la sección o la sesión.
  useEffect(() => {
    load();
  }, [section, token]);
  // Envía las credenciales y guarda la sesión cuando son válidas.
  const login = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Guarda el resultado del inicio de sesión para usar el token recibido.
      const result = await api("/admin/login", undefined, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem("portfolio_token", result.token);
      setToken(result.token);
      setFirstLogin(result.firstLogin);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo ingresar");
    }
  };
  // Cambia la contraseña inicial y avisa al usuario cuando termina.
  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api("/admin/change-password", token, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setFirstLogin(false);
      setPassword("");
      setMessage("Contraseña actualizada. Ya podés editar el portfolio.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    }
  };
  // Guarda los cambios del elemento seleccionado.
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      // Separa el identificador del contenido que se enviará al backend.
      const { id, ...payload } = selected;
      await api(`/admin/${section}${id ? `/${id}` : ""}`, token, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setMessage("Cambios guardados.");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo guardar");
    }
  };
  // Elimina el elemento después de que el usuario confirma la acción.
  const remove = async () => {
    if (!deleting) return;
    try {
      await api(`/admin/${section}/${deleting.id}`, token, {
        method: "DELETE",
      });
      setDeleting(null);
      setMessage("Elemento eliminado.");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };
  // Sube una imagen y guarda su ruta en el elemento seleccionado.
  const uploadImage = async (file: File) => {
    // Prepara el archivo para enviarlo como formulario multipart.
    const form = new FormData();
    form.append("image", file);
    try {
      // Guarda la respuesta al subir la imagen para comprobar el resultado.
      const response = await fetch(apiUrl("/api/admin/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      // Lee la ruta de la imagen o el mensaje de error de la respuesta.
      const body = await response.json();
      if (!response.ok) throw new Error(body.message);
      setSelected((current) =>
        current ? { ...current, image_path: body.path } : current,
      );
      setMessage("Imagen cargada. Guardá el formulario para asociarla.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "No se pudo cargar la imagen",
      );
    }
  };
  //formulario de login si no hay token,
  // formulario de cambio de contraseña si es el primer login,
  //  o el panel de administración si ya hay token y no es primer login
  if (!token)
    return (
      <main className="admin-login">
        <div className="login-card">
          <a href="/" className="brand">
            sara<span>wl.</span>
          </a>
          <p className="eyebrow">administración</p>
          <h1>bienvenida de nuevo</h1>
          <p>Ingresá para gestionar el contenido de tu portfolio.</p>
          <form onSubmit={login}>
            <label>
              email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
            <button className="button">entrar al dashboard →</button>
          </form>
          {message && <p className="notice error">{message}</p>}
        </div>
      </main>
    );
  if (firstLogin)
    return (
      <main className="admin-login">
        <div className="login-card">
          <p className="eyebrow">seguridad</p>
          <h1>cambiá tu contraseña</h1>
          <p>
            Es tu primer acceso: elegí una nueva contraseña de al menos 10
            caracteres.
          </p>
          <form onSubmit={changePassword}>
            <label>
              nueva contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={10}
                required
              />
            </label>
            <button className="button">guardar y continuar</button>
          </form>
          {message && <p className="notice error">{message}</p>}
        </div>
      </main>
    );
  return (
    <main className="admin">
      <aside>
        <a href="/" className="brand">
          sara<span>wl.</span>
        </a>
        <p>cms del portfolio</p>
        {/* Recorre las secciones disponibles para crear la navegación lateral. */}
        {sections.map(([id, label]) => (
          <button
            key={id}
            className={section === id ? "active" : ""}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
        <button
          className="logout"
          onClick={() => {
            sessionStorage.removeItem("portfolio_token");
            setToken("");
          }}
        >
          cerrar sesión
        </button>
      </aside>
      <section className="admin-content">
        <header>
          <div>
            <p className="eyebrow">gestión de contenido</p>
            <h1>{sections.find((x) => x[0] === section)?.[1]}</h1>
          </div>
          <button
            className="button"
            onClick={() => setSelected(defaultItem(section))}
          >
            + crear
          </button>
        </header>
        {message && <p className="notice">{message}</p>}
        <div className="admin-grid">
          <div className="admin-list">
            {/* Recorre los registros y muestra las acciones disponibles. */}
            {rows.map((row) => (
              <article
                key={row.id}
                className={selected?.id === row.id ? "selected" : ""}
              >
                <div>
                  <strong>
                    {String(
                      row.title ||
                        row.name ||
                        row.text ||
                        row.setting_key ||
                        row.label,
                    )}
                  </strong>
                  <small>{row.active === 0 ? "inactivo" : "visible"}</small>
                </div>
                <button onClick={() => setSelected(row)}>editar</button>
                <button className="delete" onClick={() => setDeleting(row)}>
                  eliminar
                </button>
              </article>
            ))}
            {!rows.length && (
              <p className="empty">Todavía no hay elementos en esta sección.</p>
            )}
          </div>
          {selected && (
            <form className="editor" onSubmit={save}>
              <h2>{selected.id ? "editar" : "crear"} elemento</h2>
              {/* Recorre los campos editables del elemento seleccionado. */}
              {Object.entries(selected)
                .filter(
                  ([key]) => !["id", "created_at", "updated_at"].includes(key),
                )
                .map(([key, value]) => (
                  <label key={key}>
                    {key.replaceAll("_", " ")}
                    {key === "image_path" ? (
                      <>
                        <input
                          value={String(value ?? "")}
                          onChange={(e) =>
                            setSelected({ ...selected, [key]: e.target.value })
                          }
                        />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            // Obtiene el archivo elegido antes de subirlo.
                            const file = e.target.files?.[0];
                            if (file) uploadImage(file);
                          }}
                        />
                      </>
                    ) : typeof value === "number" && key === "active" ? (
                      <select
                        value={String(value)}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            [key]: Number(e.target.value),
                          })
                        }
                      >
                        <option value="1">activo</option>
                        <option value="0">inactivo</option>
                      </select>
                    ) : (
                      <input
                        value={String(value ?? "")}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            [key]:
                              key === "sort_order"
                                ? Number(e.target.value)
                                : e.target.value,
                          })
                        }
                      />
                    )}
                  </label>
                ))}
              <div>
                <button className="button">guardar</button>
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => setSelected(null)}
                >
                  cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
      <ConfirmModal
        open={Boolean(deleting)}
        title={`¿querés eliminar “${String(deleting?.title || deleting?.name || deleting?.text || deleting?.setting_key || "este elemento")}”?`}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </main>
  );
}
function defaultItem(section: string): Item {
  // Define valores iniciales compartidos por los nuevos elementos.
  const base = { active: 1, sort_order: 99 };
  // Define los campos iniciales según el tipo de sección.
  const presets: Record<string, Item> = {
    projects: {
      ...base,
      title: "nuevo proyecto",
      slug: `proyecto-${Date.now()}`,
      description: "",
      image_path: "",
    },
    photography: {
      ...base,
      title: "nueva fotografía",
      description: "",
      image_path: "",
      alt_text: "",
      category: "fotografía",
    },
    education: {
      ...base,
      title: "nueva formación",
      institution: "",
      start_date: "",
      end_date: "",
      description: "",
      type: "curso",
    },
    skills: {
      ...base,
      name: "nueva habilidad",
      category_id: 1,
      level: 0,
      icon: "",
    },
    timeline_events: {
      ...base,
      year: 2026,
      title: "nuevo evento",
      description: "",
      type: "formación",
    },
    learning_items: {
      ...base,
      title: "nuevo aprendizaje",
      description: "",
      icon: "",
    },
    objectives: { ...base, text: "nuevo objetivo" },
    social_links: { ...base, label: "nuevo enlace", url: "https://", icon: "" },
    site_settings: { setting_key: "nueva_configuración", setting_value: "" },
  };
  return presets[section];
}
