'use client';

import { ThemeProvider } from '../components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { YouTubePlayerProvider } from '../contexts/YouTubePlayerContext';
import { ReactNode, useState, useEffect } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  }));

  // Hydrate query client with persisted data
  useEffect(() => {
    const hydrateQueries = () => {
      // Get all room states from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('roomState-')) {
          const roomId = key.replace('roomState-', '');
          const savedState = localStorage.getItem(key);
          if (savedState) {
            queryClient.setQueryData(['roomState', roomId], JSON.parse(savedState));
          }
        }
      });
    };

    hydrateQueries();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <YouTubePlayerProvider>
          {children}
        </YouTubePlayerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 