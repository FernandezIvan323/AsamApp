import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { setStoredToken, setStoredUser } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

export default function Login({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setStoredToken(data.token);
      setStoredUser(data.user);
      onAuthSuccess(data.token);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Iniciar sesión"
      subtitle="Entrá al panel para gestionar eventos, compras y finanzas de tu catering."
      badge="Acceso al panel"
      footer={
        <>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary/90 transition-colors">
            Registrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <FormField label="Usuario" required>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Tu usuario"
          />
        </FormField>

        <FormField
          label="Contraseña"
          required
          hint="¿Olvidaste? Pedila al admin"
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message || String(error)}
          </div>
        )}

        <Button type="submit" disabled={isLoading} size="lg" className="w-full">
          <LogIn className="size-4" />
          {isLoading ? 'Entrando…' : 'Entrar al panel'}
        </Button>

        <p className="pt-0.5 text-center text-[11px] leading-relaxed text-muted-foreground/80">
          App familiar compartida: todos ven y editan los mismos eventos, notas y compras.
        </p>
      </form>
    </AuthSplitLayout>
  );
}