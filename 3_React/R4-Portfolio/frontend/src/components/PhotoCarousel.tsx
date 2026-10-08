import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Photo } from "../types";

// Muestra las fotografías y permite recorrerlas con botones, teclado o gestos.
export function PhotoCarousel({ photos }: { photos: Photo[] }) {
  // Guarda la posición de la fotografía que se está mostrando.
  const [index, setIndex] = useState(0);
  // Pausa el cambio automático mientras el puntero está sobre el carrusel.
  const [paused, setPaused] = useState(false);
  // Detecta si el usuario prefiere reducir las animaciones.
  const reduced = useReducedMotion();
  // Guarda cuántas fotografías hay para calcular sus posiciones.
  const count = photos.length;
  // Cambia la posición y vuelve al principio o al final al llegar al límite.
  const move = useCallback(
    (step: number) => setIndex((current) => (current + step + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    // Inicia el temporizador para mostrar la siguiente fotografía.
    const id = setInterval(() => move(1), 5000);
    return () => clearInterval(id);
  }, [paused, reduced, count, move]);

  useEffect(() => {
    // Interpreta las flechas del teclado para cambiar la fotografía.
    const key = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [move]);

  if (!count) {
    return (
      <p className="empty">Próximamente voy a compartir fotografías aquí.</p>
    );
  }

  // Prepara la fotografía actual y sus vecinas para mostrar el carrusel.
  const visible = [-1, 0, 1].map((offset) => ({
    photo: photos[(index + offset + count) % count],
    offset,
  }));

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carrusel"
      aria-label="galería fotográfica"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Recorre la fotografía actual y sus vecinas para mostrarlas como diapositivas. */}
      {visible.map(({ photo, offset }) => (
        <motion.figure
          className={`slide slide-${offset}`}
          key={`${photo.id}-${offset}`}
          animate={{
            x: offset * 72 + "%",
            scale: offset === 0 ? 1 : 0.78,
            opacity: offset === 0 ? 1 : 0.42,
            rotate: reduced ? 0 : offset * 3,
            zIndex: offset === 0 ? 2 : 1,
          }}
          transition={{ type: "spring", stiffness: 170, damping: 24 }}
          drag={offset === 0 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 55) move(-1);
            if (info.offset.x < -55) move(1);
          }}
        >
          <img src={photo.image_path} alt={photo.alt_text} />
          {offset === 0 && (
            <figcaption>
              <span>{photo.category || "fotografía"}</span>
              <strong>{photo.title}</strong>
            </figcaption>
          )}
        </motion.figure>
      ))}
      <button
        className="carousel-button previous"
        onClick={() => move(-1)}
        aria-label="Ver fotografía anterior"
      >
        ←
      </button>
      <button
        className="carousel-button next"
        onClick={() => move(1)}
        aria-label="Ver fotografía siguiente"
      >
        →
      </button>
      <div className="dots">
        {/* Crea un botón para ir directamente a cada fotografía. */}
        {photos.map((photo, photoIndex) => (
          <button
            key={photo.id}
            aria-label={`Ir a ${photo.title}`}
            aria-current={photoIndex === index}
            onClick={() => setIndex(photoIndex)}
          />
        ))}
      </div>
    </div>
  );
}
