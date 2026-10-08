import { useCallback, useEffect, useState } from "react";
import type { Portfolio } from "./types";
import { apiUrl } from "./api";
// Este archivo contiene hooks para el tema visual y la carga del portfolio.
export function useTheme() {
  // Guarda el tema elegido o el tema preferido por el sistema.
  const [theme, setTheme] = useState<"light" | "dark">(
    () =>
      (localStorage.getItem("theme") as "light" | "dark") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  return {
    theme,
    toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };
}
//hook para cargar el portfolio desde la API
export function usePortfolio() {
  // Guarda los datos recibidos y el mensaje de error de la API.
  const [data, setData] = useState<Portfolio | null>(null),
    [error, setError] = useState("");
  // Solicita los datos públicos del portfolio.
  const load = useCallback(async () => {
    try {
      // Guarda la respuesta de la API para comprobarla y leer sus datos.
      const response = await fetch(apiUrl("/api/portfolio"));
      if (!response.ok) throw new Error();
      setData(await response.json());
    } catch {
      setError(
        "No pudimos cargar el contenido. Verificá que la API y MariaDB estén iniciadas.",
      );
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { data, error, reload: load };
}
