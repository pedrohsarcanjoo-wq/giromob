import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="@giromob:theme">
      <AuthProvider>
        <AppProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
