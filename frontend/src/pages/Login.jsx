import { useState } from 'react';
import { ChefHat, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setStoredToken } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      onSuccess();
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ChefHat className="size-8" />
          </div>
          <CardTitle>AsamApp</CardTitle>
          <CardDescription>Inicia sesión para acceder al sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error.message}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="size-4" /> {isLoading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
