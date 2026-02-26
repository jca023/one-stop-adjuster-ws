import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoSvg from '../assets/logos/logo.svg';

const socialLinks = [
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@OneStopAdjuster',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

interface FooterLink {
  name: string;
  to: string;
  external?: boolean;
}

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { name: 'Features', to: '/features' },
    { name: 'Mobile App', to: '/mobile-app' },
    { name: 'Resources', to: '/resources' },
    { name: 'Client Portal', to: 'https://osa-client.web.app', external: true },
  ],
  Company: [
    { name: 'About Us', to: '/about' },
    { name: 'Testimonials', to: '/testimonials' },
    { name: 'Contact', to: '/contact' },
  ],
  Legal: [
    { name: 'Privacy Policy', to: '/privacy-policy' },
    { name: 'Terms of Service', to: '/terms' },
    { name: 'Security Guidelines', to: '/security-guidelines' },
    { name: 'Mobile App EULA', to: '/mobile-app-eula' },
  ],
};

export default function Footer(): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--color-deep)] border-t border-[var(--color-wave)]/20">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logoSvg}
                  alt="One Stop Adjuster"
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-semibold text-lg">One Stop Adjuster</span>
              </Link>
            </motion.div>

            <motion.p
              className="text-[var(--color-mist)] text-sm max-w-sm mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The all-in-one platform built for field work. Simplify flood claims
              from inspection to submission.
            </motion.p>

            {/* Social links placeholder */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-[var(--color-mist)] hover:text-white hover:bg-[var(--color-wave)] transition-colors"
                  aria-label={social.name}
                >
                  {social.svg}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (categoryIndex + 1) }}
            >
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-mist)] hover:text-white text-sm transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-[var(--color-mist)] hover:text-white text-sm transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          className="pt-8 border-t border-[var(--color-wave)]/20 flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-[var(--color-mist)] text-sm">
            &copy; {currentYear} Toremy LLC. All rights reserved.
          </p>
          <p className="text-[var(--color-mist)] text-xs">
            Made with care in Mobile, Alabama
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
