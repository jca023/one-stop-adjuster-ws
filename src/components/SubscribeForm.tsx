import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SubscribeFormProps {
  compact?: boolean;
}

export default function SubscribeForm({ compact }: SubscribeFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase
      .from('subscribers')
      .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email' });

    if (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setEmail('');
    setLoading(false);
  }

  if (success) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'} text-[var(--color-success)]`}>
        <CheckCircle className="w-5 h-5" />
        <span>You're subscribed! We'll keep you updated.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-stretch ${compact ? 'flex-row gap-2' : 'flex-col sm:flex-row gap-3'}`}>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-wave)] pointer-events-none" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={`w-full h-full pl-10 pr-4 ${compact ? 'py-2.5 text-sm' : 'py-2.5 text-sm'} rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] placeholder-[var(--color-wave)] focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`btn-primary ${compact ? 'px-5 py-2.5 text-sm' : 'px-6 py-2.5 text-sm'} whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </form>
  );
}
