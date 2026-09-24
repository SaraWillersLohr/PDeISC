import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoCarousel } from "../components/PhotoCarousel";
import { Reveal, SectionTitle } from "../components/ui";
import { usePortfolio, useTheme } from "../hooks";
import type { Item } from "../types";

const nav = [
  ["inicio", "inicio"],
  ["sobre-mi", "sobre mí"],
  ["fotografia", "fotografía"],
  ["proyectos", "proyectos"],
  ["formacion", "formación"],
  ["habilidades", "habilidades"],
  ["recorrido", "recorrido"],
  ["objetivos", "objetivos"],
  ["contacto", "contacto"],
];
const text = (item: Item, key: string) => String(item[key] || "");
export function PortfolioPage() {
  const { data, error } = usePortfolio();
  const { theme, toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const [top, setTop] = useState(false);
  useEffect(() => {
    const handler = () => setTop(scrollY > 500);
    addEventListener("scroll", handler);
    handler();
    return () => removeEventListener("scroll", handler);
  }, []);
  if (error)
    return (
      <main className="status">
        <h1>portfolio de sara willers löhr</h1>
        <p>{error}</p>
      </main>
    );
  if (!data)
    return (
      <main className="status">
        <div className="loader" />
        <p>cargando portfolio…</p>
      </main>
    );
  const s = data.settings;
  return (
    <>
      <header className="nav">
        <a href="#inicio" className="brand">
          sara<span>wl.</span>
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-label="Abrir navegación"
        >
          ☰
        </button>
        <nav className={menu ? "open" : ""}>
          {nav.map(([id, label]) => (
            <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
          <button
            className="theme"
            onClick={toggle}
            aria-label="Cambiar modo de color"
          >
            {theme === "light" ? "◐" : "☼"}
          </button>
        </nav>
      </header>
      <main>
        <section id="inicio" className="hero">
          <div className="hero-copy">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              mar del plata · argentina
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {s.hero_greeting}
              <br />
              <em>{s.Subtitulo || "Estudiante de informática"}</em>
            </motion.h1>
            <motion.p
              className="lead"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {s.hero_text}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <a className="button" href="#proyectos">
                ver mis proyectos ↗
              </a>
              <a className="button ghost" href="#sobre-mi">
                conocerme
              </a>
            </motion.div>
          </div>
          <motion.div
            className="hero-photo"
            initial={{ rotate: 4, opacity: 0 }}
            animate={{ rotate: 2, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <img src="/foto-perfil.jpeg" alt="Sara Willers Löhr" />
            <span>estudiante · creativa · tech</span>
          </motion.div>
        </section>
        <section id="sobre-mi" className="about section">
          <div>
            <SectionTitle eyebrow="acerca de mí" title={s.about_title}>
              <p>{s.about_text}</p>
              <p>
                Durante la tecnicatura adquirí conocimientos en programación,
                desarrollo web, bases de datos, redes informáticas, sistemas
                operativos y mantenimiento de equipos.
              </p>
              <p>
                También me interesan el diseño, la fotografía y la posibilidad
                de combinar tecnología y creatividad en proyectos digitales.
              </p>
            </SectionTitle>
          </div>
          <Reveal delay={0.15}>
            <img
              className="polaroid"
              src="/IMG_1255.JPG"
              alt="Fotografía tomada por Sara"
            />
          </Reveal>
        </section>
        <section id="fotografia" className="section photo-section">
          <SectionTitle
            eyebrow="mi mirada detrás de la cámara"
            title="fotografía"
          >
            <p>
              La fotografía es uno de los ámbitos creativos que más me interesa
              explorar. Me gusta observar detalles, experimentar con diferentes
              composiciones y utilizar la imagen como una forma de comunicar
              ideas.
            </p>
          </SectionTitle>
          <PhotoCarousel photos={data.photos} />
        </section>
        <section id="proyectos" className="section">
          <SectionTitle eyebrow="desarrollo web" title="proyectos destacados" />
          <div className="project-grid">
            {data.projects.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.08}>
                <article className="project-card">
                  <span>0{i + 1} / proyecto</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="tags">
                    react · node.js · aprendizaje continuo
                  </div>
                  {(project.demo_url || project.github_url) && (
                    <div className="project-actions">
                      {project.demo_url && (
                        <a
                          className="project-link"
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ver proyecto <span aria-hidden="true">↗</span>
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          className="github-link"
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Ver repositorio de ${project.title}`}
                          title="Ver repositorio en GitHub"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.2c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.07.36.32.68.92.68 1.85 0 1.34-.01 2.41-.01 2.74 0 .27.18.6.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section id="formacion" className="section education">
          <SectionTitle eyebrow="aprendizaje constante" title="mi formación" />
          <div>
            {data.education.map((item) => (
              <Reveal key={item.id}>
                <article className="education-row">
                  <small>{text(item, "type")}</small>
                  <div>
                    <h3>{text(item, "title")}</h3>
                    <p>{text(item, "institution")}</p>
                  </div>
                  <p>
                    {text(item, "start_date").slice(0, 4)} —{" "}
                    {text(item, "end_date").slice(0, 4) || "actualidad"}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section id="habilidades" className="section">
          <SectionTitle
            eyebrow="herramientas que uso"
            title="stack & habilidades"
          />
          <div className="skills">
            {data.skills.map((item) => (
              <span key={item.id}>{text(item, "name")}</span>
            ))}
          </div>
        </section>
        <section id="recorrido" className="section timeline">
          <SectionTitle
            eyebrow="paso a paso"
            title="mi recorrido en la informática"
          />
          {data.timeline.map((item) => (
            <Reveal key={item.id}>
              <article>
                <time>{text(item, "year")}</time>
                <div>
                  <h3>{text(item, "title")}</h3>
                  <p>{text(item, "description")}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </section>
        <section className="section learn">
          <SectionTitle eyebrow="en construcción" title="lo que aprendí" />
          <div>
            {data.learning.map((item) => (
              <Reveal key={item.id}>
                <article>
                  {text(item, "title")}
                  <span>↗</span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section id="objetivos" className="section goals">
          <SectionTitle
            eyebrow="próximo capítulo"
            title="hacia dónde quiero seguir"
          >
            <p>
              Actualmente mi objetivo es continuar aprendiendo y adquirir
              experiencia en el área tecnológica, especialmente en desarrollo
              web y frontend.
            </p>
          </SectionTitle>
          <ul>
            {data.objectives.map((item) => (
              <li key={item.id}>{text(item, "text")}</li>
            ))}
          </ul>
        </section>
        <section id="contacto" className="contact">
          <Reveal>
            <p className="eyebrow">conectemos</p>
            <h2>¿hablamos?</h2>
            <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>
            <div>
              {data.links.map((link) => (
                <a
                  key={link.id}
                  href={text(link, "url")}
                  target="_blank"
                  rel="noreferrer"
                >
                  {text(link, "label")} ↗
                </a>
              ))}
            </div>
          </Reveal>
        </section>
      </main>
      <footer>
        <span>
          sara willers löhr · estudiante de informática · desarrollo web ·
          fotografía
        </span>
        <span>© 2026</span>
      </footer>
      {top && (
        <button
          className="back-top"
          onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
        >
          ↑
        </button>
      )}
    </>
  );
}
