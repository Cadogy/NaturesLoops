'use client';

import Link from 'next/link';
import { Music2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-xl font-bold"
          aria-label="Nature's Loops Home"
        >
          <Music2 className="w-6 h-6" />
          <span>Nature&apos;s Loops</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link 
            href="/rooms" 
            className="text-sm font-medium hover:text-primary transition-colors"
            aria-label="Browse Rooms"
          >
            Rooms
          </Link>
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
