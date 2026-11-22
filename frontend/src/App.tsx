import React, { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { useAuthStore } from './store/authStore';

export const App: React.FC = () => {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    // La única llamada en useEffect es checkSession al montar la aplicación
    checkSession();
  }, [checkSession]);

  return <AppRouter />;
};

export default App;
