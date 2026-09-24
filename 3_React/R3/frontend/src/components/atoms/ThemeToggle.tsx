// boton toggle de tema
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./ThemeToggle.module.css";

// bot�n para alternar modo claro / oscuro
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? "activar modo claro" : "activar modo oscuro"}
      aria-pressed={isDark}
    >
      <span className={!isDark ? styles.optionActive : styles.option}>
        <Sun size={18} />
        <span>Modo claro</span>
      </span>
      <span className={isDark ? styles.optionActive : styles.option}>
        <Moon size={18} />
        <span>Modo oscuro</span>
      </span>
    </button>
  );
}
