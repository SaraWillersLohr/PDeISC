import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Game from './components/Game';
import Footer from './components/Footer';
import './styles/app.css';

// componente raíz que envuelve todo en el proveedor del tema
function App() {
  return (
    <ThemeProvider>
      <Header />
      <main className="main-content">
        <Game />
      </main>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
