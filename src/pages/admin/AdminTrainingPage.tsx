import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, Calendar, Video, GripVertical, ExternalLink, Users, Download, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
import type { TrainingEvent, TrainingVideo, TrainingRegistration } from '../../lib/supabase';
import TrainingCalendar from '../../components/TrainingCalendar';

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
  registration_deadline: null,
  max_capacity: null,
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

/* ---------- Sortable video item ---------- */

interface SortableVideoItemProps {
  vid: TrainingVideo;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableVideoItem({ vid, index, onEdit, onDelete }: SortableVideoItemProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vid.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass rounded-lg px-3 py-2.5 mb-1.5 flex items-center gap-3"
    >
      <button
        type="button"
        className="p-1 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      </button>
      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-ocean)]/20 text-xs font-bold text-[var(--color-mist)] shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-[var(--color-pearl)]">
          {vid.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-wave)] flex-wrap">
          <a
            href={vid.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-surf)] hover:underline truncate max-w-xs inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {vid.url}
          </a>
          <span
            className={
              vid.status === 'published'
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-wave)]'
            }
          >
            {vid.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--color-surf)]" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Drag overlay preview ---------- */

function VideoDragPreview({ vid }: { vid: TrainingVideo }): React.JSX.Element {
  return (
    <div className="glass rounded-lg px-3 py-2.5 flex items-center gap-3 shadow-2xl opacity-90 scale-[1.02] border border-[var(--color-gold)]/40">
      <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-[var(--color-pearl)]">
          {vid.title}
        </h4>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function AdminTrainingPage(): React.JSX.Element {
  const [subTab, setSubTab] = useState<'events' | 'videos' | 'registrations'>('events');

  // Events state
  const [editingEvent, setEditingEvent] = useState<Partial<TrainingEvent> | null>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  // Videos state
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Partial<TrainingVideo> | null>(null);

  // Shared state
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Registrations state
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [regEvents, setRegEvents] = useState<{ id: string; title: string; event_date: string; max_capacity: number | null }[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [regLoading, setRegLoading] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    setRegLoading(true);
    const [{ data: regs }, { data: evts }] = await Promise.all([
      supabase.from('training_registrations').select('*').order('registered_at', { ascending: false }),
      supabase.from('training_events').select('id,title,event_date,max_capacity').order('event_date', { ascending: false }),
    ]);
    if (regs) setRegistrations(regs);
    if (evts) setRegEvents(evts);
    setRegLoading(false);
  }, []);

  useEffect(() => {
    if (subTab === 'registrations') fetchRegistrations();
  }, [subTab, fetchRegistrations]);

  // DnD state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Sorted videos for display
  const sortedVideos = [...videos].sort((a, b) => a.sort_order - b.sort_order);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchVideos(): Promise<void> {
    setVideosLoading(true);
    const { data, error } = await supabase
      .from('training_videos')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setVideos(data as TrainingVideo[]);
    }
    setVideosLoading(false);
  }

  /* ---------- DnD handler ---------- */

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortedVideos.findIndex((v) => v.id === String(active.id));
    const newIndex = sortedVideos.findIndex((v) => v.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedVideos, oldIndex, newIndex).map((v, i) => ({
      ...v,
      sort_order: i + 1,
    }));
    setVideos(reordered);

    // Persist to Supabase
    const updates = reordered.map((v) =>
      supabase.from('training_videos').update({ sort_order: v.sort_order }).eq('id', v.id),
    );
    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) {
      setFeedback({ type: 'error', message: 'Failed to save order. Refreshing...' });
      fetchVideos();
    } else {
      setFeedback({ type: 'success', message: 'Order saved.' });
    }
  }

  const activeVid = activeId ? sortedVideos.find((v) => v.id === String(activeId)) || null : null;

  /* ---------- Event CRUD (calendar callbacks) ---------- */

  const handleCalendarEdit = useCallback((ev: TrainingEvent) => {
    setEditingEvent(ev);
  }, []);

  const handleCalendarDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    const { error } = await supabase.from('training_events').delete().eq('id', id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete event.' });
    } else {
      setFeedback({ type: 'success', message: 'Event deleted.' });
      setCalendarRefreshKey((k) => k + 1);
    }
  }, []);

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
      registration_deadline: editingEvent.registration_deadline || null,
      max_capacity: editingEvent.max_capacity || null,
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
        setCalendarRefreshKey((k) => k + 1);
      }
    } else {
      const { error } = await supabase.from('training_events').insert(payload);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create event.' });
      } else {
        setFeedback({ type: 'success', message: 'Event created!' });
        setEditingEvent(null);
        setCalendarRefreshKey((k) => k + 1);
      }
    }
    setSaving(false);
  }

  /* ---------- Video CRUD ---------- */

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
      category_id: editingVideo.category_id || null,
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

  async function handleDeleteVideo(vid: TrainingVideo): Promise<void> {
    if (!window.confirm(`Delete "${vid.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('training_videos').delete().eq('id', vid.id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete video.' });
    } else {
      setFeedback({ type: 'success', message: 'Video deleted.' });
      fetchVideos();
    }
  }

  function openNewVideo(): void {
    setEditingVideo({
      ...emptyVideo,
      sort_order: videos.length + 1,
    });
  }

  /* ---------- render ---------- */

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
          {subTab !== 'registrations' && (
            <button
              onClick={() =>
                subTab === 'events'
                  ? setEditingEvent({ ...emptyEvent })
                  : openNewVideo()
              }
              className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              {subTab === 'events' ? 'New Event' : 'Add Video'}
            </button>
          )}
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
          <button
            onClick={() => setSubTab('registrations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === 'registrations'
                ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Registrations
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

        {/* Calendar Events tab — embedded TrainingCalendar with admin controls */}
        {subTab === 'events' && !isEditing && (
          <TrainingCalendar
            showAll
            onEditEvent={handleCalendarEdit}
            onDeleteEvent={handleCalendarDelete}
            refreshKey={calendarRefreshKey}
          />
        )}

        {/* Training Videos tab — flat sortable list */}
        {subTab === 'videos' && !isEditing && (
          <>
            {videosLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-5 animate-pulse">
                    <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : sortedVideos.length > 0 ? (
              <>
                <p className="text-xs text-[var(--color-wave)] mb-3">
                  Drag to reorder videos. Order is reflected on the public site.
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedVideos.map((v) => v.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedVideos.map((vid, i) => (
                      <SortableVideoItem
                        key={vid.id}
                        vid={vid}
                        index={i}
                        onEdit={() => setEditingVideo(vid)}
                        onDelete={() => handleDeleteVideo(vid)}
                      />
                    ))}
                  </SortableContext>

                  {createPortal(
                    <DragOverlay>
                      {activeVid && <VideoDragPreview vid={activeVid} />}
                    </DragOverlay>,
                    document.body,
                  )}
                </DndContext>
              </>
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <p className="text-[var(--color-mist)]">
                  No videos yet. Click "Add Video" to create one.
                </p>
              </div>
            )}
          </>
        )}

        {/* Registrations tab */}
        {subTab === 'registrations' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--color-abyss)] border border-[var(--color-wave)]/20 text-[var(--color-pearl)] text-sm"
              >
                <option value="all">All Events</option>
                {regEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.event_date})</option>
                ))}
              </select>

              <button
                onClick={() => {
                  const filtered = selectedEventFilter === 'all'
                    ? registrations
                    : registrations.filter((r) => r.event_id === selectedEventFilter);
                  const csv = [
                    'Name,Email,Phone,Company,Status,Amount,Date',
                    ...filtered.map((r) =>
                      `"${r.name}","${r.email}","${r.phone}","${r.company || ''}","${r.payment_status}","${r.amount_paid}","${r.registered_at}"`
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'registrations.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-ocean)]/30 text-[var(--color-surf)] hover:bg-[var(--color-ocean)]/50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Summary */}
            {(() => {
              const filtered = selectedEventFilter === 'all'
                ? registrations
                : registrations.filter((r) => r.event_id === selectedEventFilter);
              const paid = filtered.filter((r) => r.payment_status === 'paid').length;
              const free = filtered.filter((r) => r.payment_status === 'free').length;
              const pending = filtered.filter((r) => r.payment_status === 'pending').length;
              const revenue = filtered
                .filter((r) => r.payment_status === 'paid')
                .reduce((sum, r) => sum + Number(r.amount_paid), 0);

              return (
                <div className="flex gap-3 flex-wrap text-sm">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-ocean)]/20 text-[var(--color-pearl)]">{filtered.length} registered</span>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)]">{paid} paid</span>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)]">{free} free</span>
                  {pending > 0 && <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">{pending} pending</span>}
                  <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">${revenue.toFixed(2)} revenue</span>
                </div>
              );
            })()}

            {/* Registration list */}
            {regLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-5 animate-pulse">
                    <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(selectedEventFilter === 'all'
                  ? registrations
                  : registrations.filter((r) => r.event_id === selectedEventFilter)
                ).map((reg) => {
                  const ev = regEvents.find((e) => e.id === reg.event_id);
                  const statusColors: Record<string, string> = {
                    paid: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
                    free: 'bg-[var(--color-surf)]/20 text-[var(--color-surf)]',
                    pending: 'bg-[var(--color-gold)]/20 text-[var(--color-gold)]',
                    refunded: 'bg-red-500/20 text-red-400',
                  };

                  return (
                    <div key={reg.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{reg.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[reg.payment_status] || ''}`}>
                            {reg.payment_status}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--color-mist)] space-x-3">
                          <span>{reg.email}</span>
                          <span>{reg.phone}</span>
                          {reg.company && <span>{reg.company}</span>}
                        </div>
                        {selectedEventFilter === 'all' && ev && (
                          <div className="text-xs text-[var(--color-wave)] mt-1">{ev.title} — {ev.event_date}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {reg.amount_paid > 0 && (
                          <span className="text-sm font-bold text-[var(--color-gold)]">${Number(reg.amount_paid).toFixed(2)}</span>
                        )}
                        {reg.payment_status === 'paid' && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Refund ${reg.name}?`)) return;
                              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
                              const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
                              const res = await fetch(`${supabaseUrl}/functions/v1/refund-registration`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
                                body: JSON.stringify({ registration_id: reg.id }),
                              });
                              if (res.ok) fetchRegistrations();
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Refund
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete registration for ${reg.name}?`)) return;
                            await supabase.from('training_registrations').delete().eq('id', reg.id);
                            fetchRegistrations();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {registrations.length === 0 && (
                  <div className="glass rounded-2xl p-8 text-center">
                    <Users className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
                    <p className="text-[var(--color-mist)]">No registrations yet.</p>
                  </div>
                )}
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

                  {/* Registration fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Registration Deadline</label>
                      <input
                        type="datetime-local"
                        value={editingEvent.registration_deadline?.slice(0, 16) || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, registration_deadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className={`${inputClass} [color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Max Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={editingEvent.max_capacity || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, max_capacity: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Unlimited"
                        className={inputClass}
                      />
                    </div>
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
