import { useEffect, useState } from 'react';

import { LoadingState } from '@/components/feedback/ResourceState';
import Login from '@/pages/Login';
import { getStoredToken } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

export default function AuthGate({ children }) {
  const [checked, setChecked] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [token, setToken] = useState(getStoredToken());

  useEffect(() => {
    apiRequest('/api/auth/config')
      .then(config => {
        setAuthEnabled(Boolean(config.enabled));
        setChecked(true);
      })
      .catch(() => {
        setAuthEnabled(false);
        setChecked(true);
      });
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingState title="Iniciando AsamApp" />
      </div>
    );
  }

  if (authEnabled && !token) {
    return <Login onSuccess={() => setToken(getStoredToken())} />;
  }

  return children;
}
