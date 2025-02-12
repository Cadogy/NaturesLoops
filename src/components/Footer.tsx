import { Github, Heart, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by Nature&apos;s Loops Team</span>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="https://github.com/cadogy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/NaturesLoops"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Nature&apos;s Loops. All rights reserved.</p>
          <p className="mt-2">
            Inspired by{' '}
            <a
              href="https://www.lofi.cafe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              lofi.cafe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
