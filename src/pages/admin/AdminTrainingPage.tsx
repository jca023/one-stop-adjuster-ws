import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, Calendar, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { TrainingEvent, TrainingVideo } from '../../lib/supabase';

const EVENT_TYPES = ['webinar', 'in-person', 'workshop', 'deadline'] as const;

const emptyEvent: Partial<TrainingEvent> = {
  title: '',
  description: '',
  event_date: '',
  start_time: '',
  end_time: '',
  event_type: 'webinar',
  url: '',
  fee: 0,
  venmo_qr_url: '',
  recording_url: '',
  status: 'published',
};

const emptyVideo: Partial<TrainingVideo> = {
  title: '',
  url: '',
  description: '',
  sort_order: 0,
  status: 'published',
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors';

export default function AdminTrainingPage(): React.JSX.Element {
  const [subTab, setSubTab] = useState<'events' | 'videos'>('events');

  // Events state
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<TrainingEvent> | null>(null);

  // Videos state
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Partial<TrainingVideo> | null>(null);

  // Shared state
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchVideos();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchEvents(): Promise<void> {
    setEventsLoading(true);
    const { data, error } = await supabase
      .from('training_events')
      .select('*')
      .order('event_date', { ascending: false });
    if (!error && data) setEvents(data as TrainingEvent[]);
    setEventsLoading(false);
  }

  async function fetchVideos(): Promise<void> {
    setVideosLoading(true);
    const { data, error } = await supabase
      .from('training_videos')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setVideos(data as TrainingVideo[]);
    setVideosLoading(false);
  }

  // --- Event CRUD ---
  async function handleSaveEvent(): Promise<void> {
    if (!editingEvent || !editingEvent.title?.trim() || !editingEvent.event_date) {
      setFeedback({ type: 'error', message: 'Title and date are required.' });
      return;
    }
    setSaving(true);

    const hasPaidEvent = (editingEvent.fee || 0) > 0;
    const payload = {
      title: editingEvent.title,
      description: editingEvent.description || null,
      event_date: editingEvent.event_date,
      start_time: editingEvent.start_time || null,
      end_time: editingEvent.end_time || null,
      event_type: editingEvent.event_type || 'webinar',
      url: editingEvent.url || null,
      fee: hasPaidEvent ? editingEvent.fee : 0,
      venmo_qr_url: hasPaidEvent ? (editingEvent.venmo_qr_url || null) : null,
      recording_url: editingEvent.recording_url || null,
      status: editingEvent.status || 'published',
      updated_at: new Date().toISOString(),
    };

    if (editingEvent.id) {
      const { error } = await supabase.from('training_events').update(payload).eq('id', editingEvent.id);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update event.' });
      } else {
        setFeedback({ type: 'success', message: 'Event updated.' });
        setEditingEvent(null);
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from('training_events').insert(payload);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create event.' });
      } else {
        setFeedback({ type: 'success', message: 'Event created!' });
        setEditingEvent(null);
        fetchEvents();
      }
    }
    setSaving(false);
  }

  async function handleDeleteEvent(id: string): Promise<void> {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    const { error } = await supabase.from('training_events').delete().eq('id', id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete event.' });
    } else {
      setFeedback({ type: 'success', message: 'Event deleted.' });
      fetchEvents();
    }
  }

  // --- Video CRUD ---
  async function handleSaveVideo(): Promise<void> {
    if (!editingVideo || !editingVideo.title?.trim() || !editingVideo.url?.trim()) {
      setFeedback({ type: 'error', message: 'Title and URL are required.' });
      return;
    }
    setSaving(true);

    const payload = {
      title: editingVideo.title,
      url: editingVideo.url,
      description: editingVideo.description || null,
      sort_order: editingVideo.sort_order || 0,
      status: editingVideo.status || 'published',
    };

    if (editingVideo.id) {
      const { error } = await supabase.from('training_videos').update(payload).eq('id', editingVideo.id);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update video.' });
      } else {
        setFeedback({ type: 'success', message: 'Video updated.' });
        setEditingVideo(null);
        fetchVideos();
      }
    } else {
      const { error } = await supabase.from('training_videos').insert(payload);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create video.' });
      } else {
        setFeedback({ type: 'success', message: 'Video added!' });
        setEditingVideo(null);
        fetchVideos();
      }
    }
    setSaving(false);
  }

  async function handleDeleteVideo(id: string): Promise<void> {
    if (!window.confirm('Delete this video? This cannot be undone.')) return;
    const { error } = await supabase.from('training_videos').delete().eq('id', id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete video.' });
    } else {
      setFeedback({ type: 'success', message: 'Video deleted.' });
      fetchVideos();
    }
  }

  function formatEventDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const loading = subTab === 'events' ? eventsLoading : videosLoading;
  const isEditing = editingEvent || editingVideo;

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Training</h1>
          </div>
          <button
            onClick={() => subTab === 'events' ? setEditingEvent({ ...emptyEvent }) : setEditingVideo({ ...emptyVideo, sort_order: videos.length + 1 })}
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {subTab === 'events' ? 'New Event' : 'Add Video'}
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setSubTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === 'events'
                ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar Events
          </button>
          <button
            onClick={() => setSubTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === 'videos'
                ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
            }`}
          >
            <Video className="w-4 h-4" />
            Training Videos
          </button>
        </div>

        {/* Feedback banner */}
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

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/2 mb-2" />
                <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Events list */}
        {subTab === 'events' && !eventsLoading && !isEditing && (
          <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
            {events.map((ev) => (
              <div key={ev.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{ev.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)]">
                    <span>{formatEventDate(ev.event_date)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)]">
                      {ev.event_type}
                    </span>
                    {ev.fee > 0 && (
                      <span className="text-[var(--color-success)]">${Number(ev.fee).toFixed(2)}</span>
                    )}
                    <span className={ev.status === 'published' ? 'text-[var(--color-success)]' : ev.status === 'cancelled' ? 'text-red-400' : 'text-[var(--color-wave)]'}>
                      {ev.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingEvent(ev)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors" title="Edit">
                    <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
                  </button>
                  <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-[var(--color-mist)]">No events yet. Click "New Event" to create one.</p>
              </div>
            )}
          </div>
        )}

        {/* Videos list */}
        {subTab === 'videos' && !videosLoading && !isEditing && (
          <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
            {videos.map((vid) => (
              <div key={vid.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--color-wave)] bg-[var(--color-ocean)]/20 px-2 py-0.5 rounded">
                      #{vid.sort_order}
                    </span>
                    <h3 className="font-semibold truncate">{vid.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)]">
                    <a href={vid.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-surf)] hover:underline truncate max-w-xs">
                      {vid.url}
                    </a>
                    <span className={vid.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
                      {vid.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setEditingVideo(vid)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors" title="Edit">
                    <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
                  </button>
                  <button onClick={() => handleDeleteVideo(vid.id)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-[var(--color-mist)]">No videos yet. Click "Add Video" to create one.</p>
              </div>
            )}
          </div>
        )}

        {/* Event editor modal */}
        <AnimatePresence>
          {editingEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingEvent(null)} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-3xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingEvent.id ? 'Edit Event' : 'New Event'}</h2>
                  <button onClick={() => setEditingEvent(null)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Title</label>
                    <input
                      type="text"
                      value={editingEvent.title || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      className={inputClass}
                      placeholder="Event title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Description</label>
                    <textarea
                      value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      rows={3}
                      className={`${inputClass} resize-y`}
                      placeholder="Event details (optional)"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Date</label>
                      <input
                        type="date"
                        value={editingEvent.event_date || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Start Time</label>
                      <input
                        type="time"
                        value={editingEvent.start_time || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, start_time: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">End Time</label>
                      <input
                        type="time"
                        value={editingEvent.end_time || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, end_time: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Event Type</label>
                      <select
                        value={editingEvent.event_type || 'webinar'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_type: e.target.value as TrainingEvent['event_type'] })}
                        className={inputClass}
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Webinar / Meeting Link</label>
                      <input
                        type="url"
                        value={editingEvent.url || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, url: e.target.value })}
                        className={inputClass}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Recording URL */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Recording URL</label>
                    <input
                      type="url"
                      value={editingEvent.recording_url || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, recording_url: e.target.value })}
                      className={inputClass}
                      placeholder="Add after the session if recorded"
                    />
                    <p className="text-xs text-[var(--color-wave)] mt-1">Past events with a recording show a "Watch Recording" button</p>
                  </div>

                  {/* Paid event toggle */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setEditingEvent({ ...editingEvent, fee: (editingEvent.fee || 0) > 0 ? 0 : 1 })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          (editingEvent.fee || 0) > 0
                            ? 'bg-[var(--color-gold)]'
                            : 'bg-[var(--color-ocean)]/50'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          (editingEvent.fee || 0) > 0 ? 'translate-x-5' : ''
                        }`} />
                      </button>
                      <span className="text-sm font-medium text-[var(--color-mist)]">Paid event</span>
                    </label>

                    {(editingEvent.fee || 0) > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4 pl-14">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Fee ($)</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editingEvent.fee || 0}
                            onChange={(e) => setEditingEvent({ ...editingEvent, fee: parseFloat(e.target.value) || 0 })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Venmo QR Image URL</label>
                          <input
                            type="url"
                            value={editingEvent.venmo_qr_url || ''}
                            onChange={(e) => setEditingEvent({ ...editingEvent, venmo_qr_url: e.target.value })}
                            className={inputClass}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                    <select
                      value={editingEvent.status || 'published'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as TrainingEvent['status'] })}
                      className={`${inputClass} sm:w-48`}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button onClick={handleSaveEvent} disabled={saving} className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Event'}
                    </button>
                    <button onClick={() => setEditingEvent(null)} className="btn-secondary !px-6 !py-2.5 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video editor modal */}
        <AnimatePresence>
          {editingVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingVideo(null)} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-2xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingVideo.id ? 'Edit Video' : 'Add Video'}</h2>
                  <button onClick={() => setEditingVideo(null)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Title</label>
                    <input
                      type="text"
                      value={editingVideo.title || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                      className={inputClass}
                      placeholder="Video title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">YouTube URL</label>
                    <input
                      type="url"
                      value={editingVideo.url || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                      className={inputClass}
                      placeholder="https://youtu.be/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Description</label>
                    <textarea
                      value={editingVideo.description || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                      rows={2}
                      className={`${inputClass} resize-y`}
                      placeholder="Brief description (optional)"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Sort Order</label>
                      <input
                        type="number"
                        min="0"
                        value={editingVideo.sort_order || 0}
                        onChange={(e) => setEditingVideo({ ...editingVideo, sort_order: parseInt(e.target.value) || 0 })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                      <select
                        value={editingVideo.status || 'published'}
                        onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as TrainingVideo['status'] })}
                        className={inputClass}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button onClick={handleSaveVideo} disabled={saving} className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Video'}
                    </button>
                    <button onClick={() => setEditingVideo(null)} className="btn-secondary !px-6 !py-2.5 text-sm">
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
