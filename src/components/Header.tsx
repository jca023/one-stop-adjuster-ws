import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const navLinks = [
  { name: 'Features', to: '/features' },
  { name: 'How It Works', to: '/#how-it-works' },
  { name: 'Testimonials', to: '/testimonials' },
  { name: 'About', to: '/about' },
  { name: 'Contact', to: '/contact' },
];

function NavLink({ to, children, className, onClick }: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}): React.JSX.Element {
  const isHashLink = to.startsWith('/#');

  if (isHashLink) {
    return (
      <a href={to.slice(1)} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function Header(): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-surf)] to-[var(--color-ocean)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">OSA</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">One Stop Adjuster</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <NavLink
                to={link.to}
                className="text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--color-gold)] transition-all duration-300 group-hover:w-full" />
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* CTA Button */}
        <motion.div
          className="hidden lg:flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--color-mist)] hover:text-[var(--color-pearl)] hover:bg-[var(--color-ocean)]/30 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to field mode (light theme)' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Field Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <a
            href="https://osa-client.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors"
          >
            Sign In
          </a>
          <Link to="/contact" className="btn-primary text-sm py-2.5 px-5">
            Get Started
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-[var(--color-mist)] hover:text-[var(--color-pearl)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden absolute top-full left-0 right-0 glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.to}
                  className="text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-wave)]">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors py-2"
                  aria-label={theme === 'dark' ? 'Switch to field mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Field Mode' : 'Dark Mode'}</span>
                </button>
                <a
                  href="https://osa-client.web.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors py-2"
                >
                  Sign In
                </a>
                <Link to="/contact" className="btn-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
