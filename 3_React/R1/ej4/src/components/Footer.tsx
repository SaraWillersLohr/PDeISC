// muestra los contadores de tareas al pie de la app

import { ListTodo, Clock, CheckCircle } from 'lucide-react';

// props que recibe el componente
interface FooterProps {
  total: number;
  pendientes: number;
  completadas: number;
}

function Footer({ total, pendientes, completadas }: FooterProps) {
  return (
    <footer className="footer">
      {/* contador total */}
      <div className="contador">
        <ListTodo size={18} />
        <span>Total: <strong>{total}</strong></span>
      </div>

      {/* contador pendientes */}
      <div className="contador">
        <Clock size={18} />
        <span>Pendientes: <strong>{pendientes}</strong></span>
      </div>

      {/* contador completadas */}
      <div className="contador">
        <CheckCircle size={18} />
        <span>Completadas: <strong>{completadas}</strong></span>
      </div>
    </footer>
  );
}

export default Footer;
