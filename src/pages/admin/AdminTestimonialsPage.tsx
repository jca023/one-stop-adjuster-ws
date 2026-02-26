import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, Star, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Testimonial } from '../../lib/supabase';

const emptyTestimonial = {
  name: '',
  role: '',
  quote: '',
  rating: 5,
  status: 'published',
};

export default function AdminTestimonialsPage(): React.JSX.Element {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchTestimonials(): Promise<void> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
    setLoading(false);
  }

  async function handleSave(): Promise<void> {
    if (!editing || !editing.name?.trim() || !editing.quote?.trim()) {
      setFeedback({ type: 'error', message: 'Name and quote are required.' });
      return;
    }

    setSaving(true);

    if (editing.id) {
      const { error } = await supabase
        .from('testimonials')
        .update({
          name: editing.name,
          role: editing.role,
          quote: editing.quote,
          rating: editing.rating || 5,
          status: editing.status || 'published',
        })
        .eq('id', editing.id);

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update testimonial.' });
      } else {
        setFeedback({ type: 'success', message: 'Testimonial updated.' });
        setEditing(null);
        fetchTestimonials();
      }
    } else {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          name: editing.name,
          role: editing.role || '',
          quote: editing.quote,
          rating: editing.rating || 5,
          status: editing.status || 'published',
        });

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create testimonial.' });
      } else {
        setFeedback({ type: 'success', message: 'Testimonial added!' });
        setEditing(null);
        fetchTestimonials();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Delete this testimonial? This cannot be undone.')) return;

    const { error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete testimonial.' });
    } else {
      setFeedback({ type: 'success', message: 'Testimonial deleted.' });
      fetchTestimonials();
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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Testimonials</h1>
              <p className="text-xs text-[var(--color-mist)] mt-1">
                Displays at <Link to="/testimonials" className="text-[var(--color-surf)] hover:underline">/testimonials</Link>
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing({ ...emptyTestimonial })}
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
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
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="glass rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{t.name}</h3>
                    <span className="text-xs text-[var(--color-wave)]">{t.role}</span>
                    {t.status === 'draft' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[var(--color-ocean)]'}`} />
                    ))}
                  </div>
                  <p className="text-[var(--color-mist)] text-sm line-clamp-2">{t.quote}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(t)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {testimonials.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-[var(--color-mist)]">No testimonials yet. Click "Add Testimonial" to create one.</p>
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
                  <h2 className="text-xl font-bold">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
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
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Name *</label>
                      <input
                        type="text"
                        value={editing.name || ''}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                        placeholder="Vic Miller"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Role</label>
                      <input
                        type="text"
                        value={editing.role || ''}
                        onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                        placeholder="Senior Adjuster"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
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
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, status: 'published' })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            editing.status === 'published'
                              ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30'
                              : 'bg-[var(--color-deep)] text-[var(--color-mist)] border border-[var(--color-ocean)]/30'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, status: 'draft' })}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            editing.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-[var(--color-deep)] text-[var(--color-mist)] border border-[var(--color-ocean)]/30'
                          }`}
                        >
                          <EyeOff className="w-3.5 h-3.5" /> Draft
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Quote *</label>
                    <textarea
                      value={editing.quote || ''}
                      onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors resize-y"
                      placeholder="What did they say about OSA?"
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
