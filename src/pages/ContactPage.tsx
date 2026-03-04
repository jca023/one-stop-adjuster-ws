import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '251-680-6736', href: 'tel:2516806736' },
  { icon: Mail, label: 'Email', value: 'info@one-stop-adjuster.com', href: 'mailto:info@one-stop-adjuster.com' },
  { icon: MapPin, label: 'Address', value: '9311 Dolive Road, Spanish Fort, AL 36527' },
  { icon: Clock, label: 'Hours', value: 'Mon-Fri 8am-5pm | Sat-Sun 9am-3pm' },
];

const demoTypes = [
  'Full Platform Overview',
  'Claims Estimation & Processing',
  'Homeowner Property Evaluation (HOPE)',
  'AI-Assisted Estimating',
  'Analytics & Reporting Dashboard',
  'Communication & Collaboration Tools',
  'Admin & Workflow Management',
  'Other - See Additional Notes',
];

const attendeeCounts = ['1 - 3 people', '4 - 10 people', '11 - 25 people', '25+ people'];
const timeSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)]/50 border border-[var(--color-wave)]/20 focus:border-[var(--color-gold)]/50 outline-none transition-colors text-sm';

export default function ContactPage(): React.JSX.Element {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Demo form state
  const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '', company: '', demoType: '', attendees: '', date: '', time: '', notes: '' });
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function handleContactSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    const { error } = await supabase.functions.invoke('submit-contact', {
      body: {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || undefined,
        company: contactForm.company || undefined,
        submission_type: 'contact',
        message: contactForm.message,
      },
    });

    setContactSubmitting(false);

    if (error) {
      setContactError('Something went wrong. Please try again or email us directly.');
      return;
    }

    setContactSubmitted(true);
    setContactForm({ name: '', email: '', company: '', phone: '', message: '' });
    setTimeout(() => setContactSubmitted(false), 5000);
  }

  async function handleDemoSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setDemoSubmitting(true);
    setDemoError(null);

    const { error } = await supabase.functions.invoke('submit-contact', {
      body: {
        name: demoForm.name,
        email: demoForm.email,
        phone: demoForm.phone || undefined,
        company: demoForm.company || undefined,
        submission_type: 'demo',
        demo_type: demoForm.demoType,
        attendees: demoForm.attendees,
        preferred_date: demoForm.date,
        preferred_time: demoForm.time,
        message: demoForm.notes || undefined,
      },
    });

    setDemoSubmitting(false);

    if (error) {
      setDemoError('Something went wrong. Please try again or email us directly.');
      return;
    }

    setDemoSubmitted(true);
    setDemoForm({ name: '', email: '', phone: '', company: '', demoType: '', attendees: '', date: '', time: '', notes: '' });
    setTimeout(() => {
      setDemoSubmitted(false);
      setIsDemoOpen(false);
    }, 3000);
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Get in Touch</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out or schedule a demo.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((item) => (
              <div key={item.label} className="glass rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[var(--color-surf)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-wave)] mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-medium hover:text-[var(--color-gold)] transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setIsDemoOpen(true)}
              className="btn-primary w-full text-center py-3"
            >
              Schedule a Demo
            </button>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-2xl p-8"
          >
            {contactSubmitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
                  <CheckCircle className="w-16 h-16 text-[var(--color-success)] mb-4" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-[var(--color-mist)]">We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <h2 className="text-xl font-semibold mb-2">Send us a message</h2>

                <div>
                  <label className="block text-sm text-[var(--color-mist)] mb-1.5">Full Name *</label>
                  <input type="text" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-mist)] mb-1.5">Email Address *</label>
                  <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className={inputClass} />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-[var(--color-mist)] mb-1.5">Company</label>
                    <input type="text" value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-mist)] mb-1.5">Phone</label>
                    <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-mist)] mb-1.5">Message *</label>
                  <textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className={`${inputClass} resize-none`} />
                </div>

                {contactError && <p className="text-sm text-red-400 text-center">{contactError}</p>}

                <button type="submit" disabled={contactSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {contactSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {contactSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Demo Modal */}
      <AnimatePresence>
        {isDemoOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDemoOpen(false)} />
            <motion.div
              className="relative glass rounded-2xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setIsDemoOpen(false)}
                className="absolute top-4 right-4 p-2 text-[var(--color-mist)] hover:text-[var(--color-pearl)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {demoSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
                    <CheckCircle className="w-16 h-16 text-[var(--color-success)] mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold mb-2">Demo Requested!</h3>
                  <p className="text-[var(--color-mist)]">We'll confirm your demo time shortly.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Schedule a Demo</h2>
                  <form className="space-y-4" onSubmit={handleDemoSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[var(--color-mist)] mb-1.5">Full Name *</label>
                        <input type="text" required value={demoForm.name} onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--color-mist)] mb-1.5">Email *</label>
                        <input type="email" required value={demoForm.email} onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[var(--color-mist)] mb-1.5">Phone *</label>
                        <input type="tel" required value={demoForm.phone} onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--color-mist)] mb-1.5">Company *</label>
                        <input type="text" required value={demoForm.company} onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-mist)] mb-1.5">Demo Type *</label>
                      <select required value={demoForm.demoType} onChange={(e) => setDemoForm({ ...demoForm, demoType: e.target.value })} className={inputClass}>
                        <option value="">Select a demo type</option>
                        {demoTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-mist)] mb-1.5">Attendees *</label>
                      <select required value={demoForm.attendees} onChange={(e) => setDemoForm({ ...demoForm, attendees: e.target.value })} className={inputClass}>
                        <option value="">How many attending?</option>
                        {attendeeCounts.map((count) => (
                          <option key={count} value={count}>{count}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[var(--color-mist)] mb-1.5">Preferred Date *</label>
                        <input type="date" required value={demoForm.date} onChange={(e) => setDemoForm({ ...demoForm, date: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--color-mist)] mb-1.5">Preferred Time *</label>
                        <select required value={demoForm.time} onChange={(e) => setDemoForm({ ...demoForm, time: e.target.value })} className={inputClass}>
                          <option value="">Select a time</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-mist)] mb-1.5">Additional Notes</label>
                      <textarea rows={3} value={demoForm.notes} onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })} className={`${inputClass} resize-none`} />
                    </div>

                    {demoError && <p className="text-sm text-red-400 text-center">{demoError}</p>}

                    <button type="submit" disabled={demoSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                      {demoSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {demoSubmitting ? 'Submitting...' : 'Request Demo'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
