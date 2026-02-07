import { motion } from 'framer-motion';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

const footerLinks: Record<string, FooterLink[]> = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#contact' },
    { name: 'Client Portal', href: 'https://osa-client.web.app', external: true },
  ],
  Company: [
    { name: 'About Us', href: '#about' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Security Guidelines', href: '#' },
    { name: 'User Agreement', href: '#' },
  ],
};

export default function Footer() {
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-surf)] to-[var(--color-ocean)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">OSA</span>
              </div>
              <span className="font-semibold text-lg">One Stop Adjuster</span>
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
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-[var(--color-mist)] hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </a>
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
