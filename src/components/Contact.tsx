import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowRight } from 'lucide-react';

export default function Contact() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just show success state
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="relative">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-wave)] to-transparent" />

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Info */}
          <div ref={headerRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform{' '}
                <span className="text-gradient">Your Workflow?</span>
              </h2>
              <p className="text-lg text-[var(--color-mist)] mb-8">
                Whether you're an independent adjuster or managing a team, we'd love to
                show you how One Stop Adjuster can help you work more efficiently.
              </p>
            </motion.div>

            {/* Contact info */}
            <motion.div
              className="space-y-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <a
                href="tel:251-680-6736"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                  <Phone className="w-5 h-5 text-[var(--color-gold)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-mist)]">Call us</div>
                  <div className="font-medium">251-680-6736</div>
                </div>
              </a>

              <a
                href="mailto:hello@one-stop-adjuster.com"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surf)]/10 flex items-center justify-center group-hover:bg-[var(--color-surf)]/20 transition-colors">
                  <Mail className="w-5 h-5 text-[var(--color-surf)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-mist)]">Email us</div>
                  <div className="font-medium">hello@one-stop-adjuster.com</div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--color-success)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-mist)]">Based in</div>
                  <div className="font-medium">Mobile, Alabama</div>
                </div>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              className="glass rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="font-semibold mb-4">Already using One Stop Adjuster?</h3>
              <a
                href="https://osa-client.web.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--color-gold)] hover:underline"
              >
                Sign in to your account
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Right - Form */}
          <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, x: 40 }}
            animate={isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <CheckCircle className="w-16 h-16 text-[var(--color-success)] mb-4" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-[var(--color-mist)]">
                  We'll be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-semibold mb-2">Request a Demo</h3>
                <p className="text-[var(--color-mist)] text-sm mb-6">
                  Fill out the form and we'll reach out to schedule a personalized demo.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)] focus:border-[var(--color-surf)] focus:outline-none transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)] focus:border-[var(--color-surf)] focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium mb-2"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)] focus:border-[var(--color-surf)] focus:outline-none transition-colors"
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium mb-2"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)] focus:border-[var(--color-surf)] focus:outline-none transition-colors"
                    >
                      <option value="">Select your role</option>
                      <option value="independent">Independent Adjuster</option>
                      <option value="firm-adjuster">Adjusting Firm Employee</option>
                      <option value="firm-manager">Adjusting Firm Manager</option>
                      <option value="carrier">Insurance Carrier</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)] focus:border-[var(--color-surf)] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>

                <p className="text-xs text-[var(--color-mist)] text-center">
                  By submitting, you agree to our Privacy Policy
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
