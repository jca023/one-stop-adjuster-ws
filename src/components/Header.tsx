import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, ChevronDown, Users, Briefcase, UserCheck } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import logoSvg from '../assets/logos/logo.svg';

const navLinks = [
  { name: 'About', to: '/about' },
  { name: 'Testimonials', to: '/testimonials' },
  { name: 'Features', to: '/features' },
  { name: 'Mobile App', to: '/mobile-app' },
  { name: 'Resources', to: '/resources' },
  { name: 'Contact', to: '/contact' },
];

const portalLinks = [
  {
    name: 'OSA Client',
    description: 'Manage claims & adjusters',
    to: '/portal/client',
    icon: Users,
  },
  {
    name: 'OSA Policyholder',
    description: 'Track your claim status',
    to: '/portal/policyholder',
    icon: Briefcase,
  },
  {
    name: 'OSA Adjuster',
    description: 'Field tools & inspections',
    to: '/portal/adjuster',
    icon: UserCheck,
  },
];

export default function Header(): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and login dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLoginOpen(false);
  }, [location.pathname]);

  // Close login dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setIsLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-2' : 'py-4'
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
            <img
              src={logoSvg}
              alt="One Stop Adjuster"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-semibold text-lg hidden sm:block">One Stop Adjuster</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
            >
              <Link
                to={link.to}
                className="text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors relative group text-sm"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--color-gold)] transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right side: theme toggle, login dropdown, CTA */}
        <motion.div
          className="hidden xl:flex items-center gap-3"
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

          {/* Login Dropdown */}
          <div ref={loginRef} className="relative">
            <button
              onClick={() => setIsLoginOpen(!isLoginOpen)}
              className="flex items-center gap-1.5 text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors text-sm"
            >
              Login
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLoginOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLoginOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-64 glass rounded-xl overflow-hidden border border-[var(--color-wave)]/20"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2">
                    {portalLinks.map((portal) => (
                      <Link
                        key={portal.name}
                        to={portal.to}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                          <portal.icon className="w-4 h-4 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-pearl)]">{portal.name}</p>
                          <p className="text-xs text-[var(--color-mist)]">{portal.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/contact" className="btn-primary text-sm py-2 px-5">
            Get Started
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          className="xl:hidden p-2 text-[var(--color-mist)] hover:text-[var(--color-pearl)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="xl:hidden absolute top-full left-0 right-0 glass"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className="text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Portal links in mobile menu */}
              <div className="pt-4 border-t border-[var(--color-wave)]/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-wave)] mb-3">Portals</p>
                {portalLinks.map((portal) => (
                  <Link
                    key={portal.name}
                    to={portal.to}
                    className="flex items-center gap-3 text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <portal.icon className="w-4 h-4 text-[var(--color-surf)]" />
                    <span>{portal.name}</span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-wave)]/30">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors py-2"
                  aria-label={theme === 'dark' ? 'Switch to field mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Field Mode' : 'Dark Mode'}</span>
                </button>
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
