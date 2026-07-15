import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import AuthSplitLayout, { AuthLabel, authInputClassName } from '@/components/auth/AuthSplitLayout';
import { setStoredToken, setStoredUser } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

const BENEFITS = [
  'Cotizá eventos y exportá PDF',
  'Registrá compras del mercado',
  'Mirá el margen real por asado',
];

export default function Register({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
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
      title="Crear cuenta"
      subtitle="Registrate para empezar a cotizar asados, controlar compras y ver la rentabilidad real."
      badge="Nueva cuenta"
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#E8834A] hover:text-[#D4733A] transition-colors">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        <ul className="mb-1 space-y-1.5 rounded-xl border border-white/5 bg-[#0A1428]/50 px-3 py-2.5">
          {BENEFITS.map((text) => (
            <li key={text} className="flex items-center gap-2 text-[12px] text-[#8BA0B0]">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#E8834A]/15">
                <Check className="size-2.5 text-[#E8834A]" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div>
          <AuthLabel htmlFor="email">Email</AuthLabel>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            required
            placeholder="tu@email.com"
            className={authInputClassName()}
          />
        </div>

        <div>
          <AuthLabel htmlFor="username">Usuario</AuthLabel>
          <input
            id="username"
            value={form.username}
            onChange={handleChange('username')}
            autoComplete="username"
            required
            placeholder="Tu nombre de usuario"
            className={authInputClassName()}
          />
        </div>

        <div>
          <AuthLabel htmlFor="password">Contraseña</AuthLabel>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              required
              placeholder="Mínimo 4 caracteres"
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

        <div>
          <AuthLabel htmlFor="confirm">Confirmar contraseña</AuthLabel>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            value={form.confirm}
            onChange={handleChange('confirm')}
            autoComplete="new-password"
            required
            placeholder="Repetí la contraseña"
            className={authInputClassName()}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {typeof error === 'string' ? error : error.message || String(error)}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8834A] px-4 py-3.5 text-sm font-bold text-[#0A1428] shadow-[0_4px_20px_rgba(232,131,74,0.3)] transition-all hover:bg-[#D4733A] disabled:opacity-60"
        >
          <UserPlus className="size-4" />
          {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-[#8BA0B0]/80 pt-0.5">
          App familiar compartida: todos ven y editan los mismos eventos, notas y compras.
        </p>
      </form>
    </AuthSplitLayout>
  );
}
