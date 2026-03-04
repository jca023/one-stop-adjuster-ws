import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar as CalendarIcon, Trash2, Eye, EyeOff, Archive, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ContactSubmission } from '../../lib/supabase';

const statusColors: Record<ContactSubmission['status'], { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-[var(--color-gold)]/20', text: 'text-[var(--color-gold)]', label: 'New' },
  read: { bg: 'bg-[var(--color-surf)]/20', text: 'text-[var(--color-surf)]', label: 'Read' },
  responded: { bg: 'bg-[var(--color-success)]/20', text: 'text-[var(--color-success)]', label: 'Responded' },
  archived: { bg: 'bg-[var(--color-wave)]/20', text: 'text-[var(--color-wave)]', label: 'Archived' },
};

export default function AdminSubmissionsPage(): React.JSX.Element {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ContactSubmission['status']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  async function fetchSubmissions(): Promise<void> {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setSubmissions(data as ContactSubmission[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: ContactSubmission['status']): Promise<void> {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to update status.' });
    } else {
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      setFeedback({ type: 'success', message: `Marked as ${status}.` });
    }
  }

  async function deleteSubmission(id: string): Promise<void> {
    if (!window.confirm('Delete this submission permanently?')) return;
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete.' });
    } else {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: 'success', message: 'Deleted.' });
    }
  }

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);
  const newCount = submissions.filter((s) => s.status === 'new').length;

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link to="/admin" className="inline-flex items-center gap-2 text-[var(--color-wave)] hover:text-[var(--color-pearl)] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-gradient">Contact Submissions</span>
              </h1>
              <p className="text-[var(--color-mist)]">
                {newCount > 0 ? `${newCount} new submission${newCount === 1 ? '' : 's'}` : 'No new submissions'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feedback toast */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${
              feedback.type === 'success'
                ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'new', 'read', 'responded', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === tab
                  ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-medium'
                  : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
              }`}
            >
              {tab === 'all' ? 'All' : statusColors[tab].label}
              {tab === 'all'
                ? ` (${submissions.length})`
                : ` (${submissions.filter((s) => s.status === tab).length})`}
            </button>
          ))}
        </div>

        {/* Submissions list */}
        {loading ? (
          <div className="text-center py-12 text-[var(--color-mist)]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-mist)]">No submissions found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => {
              const sc = statusColors[sub.status];
              const isExpanded = expanded === sub.id;

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl overflow-hidden"
                >
                  {/* Summary row */}
                  <button
                    onClick={() => {
                      setExpanded(isExpanded ? null : sub.id);
                      if (sub.status === 'new') updateStatus(sub.id, 'read');
                    }}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-[var(--color-ocean)]/10 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg ${sub.submission_type === 'demo' ? 'bg-[var(--color-gold)]/20' : 'bg-[var(--color-surf)]/20'} flex items-center justify-center`}>
                        {sub.submission_type === 'demo' ? (
                          <CalendarIcon className={`w-5 h-5 ${sub.submission_type === 'demo' ? 'text-[var(--color-gold)]' : 'text-[var(--color-surf)]'}`} />
                        ) : (
                          <Mail className="w-5 h-5 text-[var(--color-surf)]" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium truncate">{sub.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-ocean)]/20 text-[var(--color-wave)]">
                          {sub.submission_type === 'demo' ? 'Demo' : 'Contact'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-mist)] truncate">{sub.email}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1 text-xs text-[var(--color-wave)]">
                      <Clock className="w-3 h-3" />
                      {formatDate(sub.created_at)}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-5 pb-5 border-t border-[var(--color-ocean)]/20"
                    >
                      <div className="grid sm:grid-cols-2 gap-4 pt-4 text-sm">
                        <div>
                          <span className="text-[var(--color-wave)]">Email:</span>{' '}
                          <a href={`mailto:${sub.email}`} className="text-[var(--color-surf)] hover:underline">{sub.email}</a>
                        </div>
                        {sub.phone && (
                          <div>
                            <span className="text-[var(--color-wave)]">Phone:</span>{' '}
                            <a href={`tel:${sub.phone}`} className="hover:text-[var(--color-gold)]">{sub.phone}</a>
                          </div>
                        )}
                        {sub.company && (
                          <div>
                            <span className="text-[var(--color-wave)]">Company:</span> {sub.company}
                          </div>
                        )}
                        {sub.demo_type && (
                          <div>
                            <span className="text-[var(--color-wave)]">Demo Type:</span> {sub.demo_type}
                          </div>
                        )}
                        {sub.attendees && (
                          <div>
                            <span className="text-[var(--color-wave)]">Attendees:</span> {sub.attendees}
                          </div>
                        )}
                        {sub.preferred_date && (
                          <div>
                            <span className="text-[var(--color-wave)]">Preferred Date:</span> {sub.preferred_date}
                          </div>
                        )}
                        {sub.preferred_time && (
                          <div>
                            <span className="text-[var(--color-wave)]">Preferred Time:</span> {sub.preferred_time}
                          </div>
                        )}
                      </div>

                      {sub.message && (
                        <div className="mt-4 p-3 rounded-lg bg-[var(--color-deep)] text-sm whitespace-pre-wrap">
                          {sub.message}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-ocean)]/20">
                        {sub.status !== 'read' && sub.status !== 'new' ? null : (
                          <button
                            onClick={() => updateStatus(sub.id, 'responded')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--color-success)]/20 text-[var(--color-success)] hover:bg-[var(--color-success)]/30 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Mark Responded
                          </button>
                        )}
                        {sub.status === 'responded' && (
                          <button
                            onClick={() => updateStatus(sub.id, 'read')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--color-surf)]/20 text-[var(--color-surf)] hover:bg-[var(--color-surf)]/30 transition-colors"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            Mark Unresponded
                          </button>
                        )}
                        {sub.status !== 'archived' && (
                          <button
                            onClick={() => updateStatus(sub.id, 'archived')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--color-wave)]/20 text-[var(--color-wave)] hover:bg-[var(--color-wave)]/30 transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => deleteSubmission(sub.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
