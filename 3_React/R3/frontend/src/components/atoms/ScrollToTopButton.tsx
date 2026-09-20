/** boton flotante volver arriba */
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import styles from './ScrollToTopButton.module.css';

/** botón sticky que aparece al hacer scroll y sube suavemente */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={scrollToTop}
      aria-label="volver arriba"
    >
      <ArrowUp size={20} />
    </button>
  );
}
