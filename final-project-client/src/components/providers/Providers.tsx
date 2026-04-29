'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { useAuthStore } from '@/lib/auth';

// Bootstrap Zustand token registration on client mount
function AuthBootstrap() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthBootstrap />
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </I18nProvider>
    </QueryClientProvider>
  );
}
