/**
 * App root - Switches between LoginScreen and Dashboard based on auth state.
 */
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import './index.css';

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading overlay during auth transition
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
