import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
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
          <Link to="/login" className="font-semibold text-primary hover:text-primary/90 transition-colors">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        <ul className="mb-1 space-y-1.5 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
          {BENEFITS.map((text) => (
            <li key={text} className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="size-2.5 text-primary" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <FormField label="Email" required>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            placeholder="tu@email.com"
          />
        </FormField>

        <FormField label="Usuario" required>
          <Input
            id="username"
            value={form.username}
            onChange={handleChange('username')}
            autoComplete="username"
            placeholder="Tu nombre de usuario"
          />
        </FormField>

        <FormField label="Contraseña" required hint="Mínimo 4 caracteres">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              placeholder="Mínimo 4 caracteres"
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

        <FormField label="Confirmar contraseña" required>
          <Input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            value={form.confirm}
            onChange={handleChange('confirm')}
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
          />
        </FormField>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {typeof error === 'string' ? error : error.message || String(error)}
          </div>
        )}

        <Button type="submit" disabled={isLoading} size="lg" className="w-full">
          <UserPlus className="size-4" />
          {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>

        <p className="pt-0.5 text-center text-[11px] leading-relaxed text-muted-foreground/80">
          App familiar compartida: todos ven y editan los mismos eventos, notas y compras.
        </p>
      </form>
    </AuthSplitLayout>
  );
}