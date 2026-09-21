// componente raiz con providers
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRouter } from '@/routes/AppRouter';
import { ScrollToTopButton } from '@/components/atoms/ScrollToTopButton';
import { ToastContainer } from '@/components/molecules/ToastContainer';
import { ChangePasswordModal } from '@/components/molecules/ChangePasswordModal';

// ejecuto app
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
            <ChangePasswordModal />
            <ToastContainer />
            <ScrollToTopButton />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

