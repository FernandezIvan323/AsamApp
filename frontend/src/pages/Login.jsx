import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthSplitLayout, { AuthLabel, authInputClassName } from '@/components/auth/AuthSplitLayout';
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
          <Link to="/register" className="font-semibold text-[#E8834A] hover:text-[#D4733A] transition-colors">
            Registrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <AuthLabel htmlFor="username">Usuario</AuthLabel>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            placeholder="Tu usuario"
            className={authInputClassName()}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-[#8BA0B0]">
              Contraseña
            </label>
            <span className="text-[10px] text-[#8BA0B0]/70" title="Pedila al administrador familiar">
              ¿Olvidaste? · Pedila al admin
            </span>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Tu contraseña"
              className={authInputClassName('pr-11')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA0B0] hover:text-white transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error.message || String(error)}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8834A] px-4 py-3.5 text-sm font-bold text-[#0A1428] shadow-[0_4px_20px_rgba(232,131,74,0.3)] transition-all hover:bg-[#D4733A] disabled:opacity-60"
        >
          <LogIn className="size-4" />
          {isLoading ? 'Entrando…' : 'Entrar al panel'}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-[#8BA0B0]/80 pt-0.5">
          App familiar compartida: todos ven y editan los mismos eventos, notas y compras.
        </p>
      </form>
    </AuthSplitLayout>
  );
}
