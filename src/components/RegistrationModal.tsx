import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import type { TrainingEvent } from '../lib/supabase';

interface RegistrationModalProps {
  event: TrainingEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrationModal({ event, onClose, onSuccess }: RegistrationModalProps): React.JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFree = !event.fee || event.fee === 0;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          event_id: event.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative glass rounded-2xl p-6 md:p-8 w-full max-w-md z-10"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--color-mist)] hover:text-[var(--color-pearl)] hover:bg-[var(--color-ocean)]/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1">Register for Training</h3>
        <p className="text-sm text-[var(--color-mist)] mb-6">{event.title}</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Cell Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-pearl)] mb-1">Company / LLC</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors text-sm"
            />
          </div>

          {event.fee > 0 && (
            <div className="pt-2 border-t border-[var(--color-ocean)]/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-mist)]">Registration Fee</span>
                <span className="font-bold text-[var(--color-gold)]">${Number(event.fee).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isFree ? (
              'Complete Registration'
            ) : (
              'Continue to Payment'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
