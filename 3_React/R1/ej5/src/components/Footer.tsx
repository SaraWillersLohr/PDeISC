import { Heart } from "lucide-react";

// muestra el pie de página de la aplicación
function Footer() {
  return (
    <footer className="footer">
      <Heart size={14} fill="currentColor" />
      Hecho con React + TypeScript + Vite
    </footer>
  );
}

export default Footer;
