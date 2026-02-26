import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Attaboy } from '../../lib/supabase';

const CATEGORIES = ['Team Player', 'Top Performer', 'Above & Beyond', 'Sharp Eye', 'Mentor'];

const emptyAttaboy = {
  recipient: '',
  author: '',
  message: '',
  category: 'Team Player',
  rating: 5,
};

export default function AdminAttaboyPage(): React.JSX.Element {
  const [attaboys, setAttaboys] = useState<Attaboy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Attaboy> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchAttaboys();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchAttaboys(): Promise<void> {
    const { data, error } = await supabase
      .from('attaboys')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAttaboys(data);
    }
    setLoading(false);
  }

  async function handleSave(): Promise<void> {
    if (!editing || !editing.recipient?.trim() || !editing.message?.trim()) {
      setFeedback({ type: 'error', message: 'Recipient and message are required.' });
      return;
    }

    setSaving(true);

    if (editing.id) {
      const { error } = await supabase
        .from('attaboys')
        .update({
          recipient: editing.recipient,
          author: editing.author,
          message: editing.message,
          category: editing.category,
          rating: editing.rating || 5,
        })
        .eq('id', editing.id);

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update attaboy.' });
      } else {
        setFeedback({ type: 'success', message: 'Attaboy updated.' });
        setEditing(null);
        fetchAttaboys();
      }
    } else {
      const { error } = await supabase
        .from('attaboys')
        .insert({
          recipient: editing.recipient,
          author: editing.author || 'Anonymous',
          message: editing.message,
          category: editing.category || 'Team Player',
          rating: editing.rating || 5,
        });

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create attaboy.' });
      } else {
        setFeedback({ type: 'success', message: 'Attaboy added!' });
        setEditing(null);
        fetchAttaboys();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Delete this attaboy? This cannot be undone.')) return;

    const { error } = await supabase.from('attaboys').delete().eq('id', id);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete attaboy.' });
    } else {
      setFeedback({ type: 'success', message: 'Attaboy deleted.' });
      fetchAttaboys();
    }
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Attaboys</h1>
          </div>
          <button
            onClick={() => setEditing({ ...emptyAttaboy })}
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Attaboy
          </button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-3 rounded-lg text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/3 mb-2" />
                <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {!loading && !editing && (
          <div className="space-y-3">
            {attaboys.map((ab) => (
              <div
                key={ab.id}
                className="glass rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{ab.recipient}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                      {ab.category}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < ab.rating ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[var(--color-ocean)]'}`} />
                    ))}
                  </div>
                  <p className="text-[var(--color-mist)] text-sm line-clamp-2">{ab.message}</p>
                  <p className="text-[var(--color-wave)] text-xs mt-1">— {ab.author}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(ab)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
                  </button>
                  <button
                    onClick={() => handleDelete(ab.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {attaboys.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-[var(--color-mist)]">No attaboys yet. Click "Add Attaboy" to recognize someone.</p>
              </div>
            )}
          </div>
        )}

        {/* Editor modal */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editing.id ? 'Edit Attaboy' : 'New Attaboy'}</h2>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Recipient</label>
                      <input
                        type="text"
                        value={editing.recipient || ''}
                        onChange={(e) => setEditing({ ...editing, recipient: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                        placeholder="Who's being recognized?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">From</label>
                      <input
                        type="text"
                        value={editing.author || ''}
                        onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                        placeholder="Who's giving the attaboy?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Category</label>
                    <select
                      value={editing.category || 'Team Player'}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditing({ ...editing, rating: star })}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (editing.rating || 5)
                                ? 'fill-[var(--color-gold)] text-[var(--color-gold)]'
                                : 'text-[var(--color-ocean)]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Message</label>
                    <textarea
                      value={editing.message || ''}
                      onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors resize-y"
                      placeholder="What did they do that deserves recognition?"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="btn-secondary !px-6 !py-2.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
