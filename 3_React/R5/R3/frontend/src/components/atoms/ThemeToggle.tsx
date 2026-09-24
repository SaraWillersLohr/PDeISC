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
      aria-pressed={isDark}
      aria-label={isDark ? "activar modo claro" : "activar modo oscuro"}
    >
      <span className={!isDark ? styles.activeMode : styles.mode}>
        <Sun size={16} />
        Modo claro
      </span>
      <span className={isDark ? styles.activeMode : styles.mode}>
        <Moon size={16} />
        Modo oscuro
      </span>
    </button>
  );
}
