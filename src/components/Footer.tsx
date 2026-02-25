import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-surf)] to-[var(--color-ocean)] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OSA</span>
                </div>
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
              {['LinkedIn', 'Twitter', 'Facebook'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-[var(--color-mist)] hover:text-white hover:bg-[var(--color-wave)] transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs font-medium">
                    {social.charAt(0)}
                  </span>
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
