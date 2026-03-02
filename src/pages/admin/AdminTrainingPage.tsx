import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, Calendar, Video, FolderOpen, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
import type { TrainingEvent, TrainingVideo, VideoCategory } from '../../lib/supabase';

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
  category_id: '',
  sort_order: 0,
  status: 'published',
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors';

/* ---------- sortable sub-components ---------- */

interface SortableVideoCategoryItemProps {
  cat: VideoCategory;
  videoCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableVideoCategoryItem({ cat, videoCount, onEdit, onDelete }: SortableVideoCategoryItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-5 flex items-center justify-between gap-4">
      <button
        type="button"
        className="p-1.5 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{cat.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)]">
            {videoCount} video{videoCount !== 1 ? 's' : ''}
          </span>
          <span className={cat.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
            {cat.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors" title="Edit">
          <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

interface SortableVideoItemProps {
  vid: TrainingVideo;
  categoryName: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableVideoItem({ vid, categoryName, isSelected, onToggleSelect, onEdit, onDelete }: SortableVideoItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vid.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-5 flex items-center justify-between gap-4">
      <label className="shrink-0 flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-[var(--color-ocean)]/50 bg-[var(--color-deep)] text-[var(--color-gold)] accent-[var(--color-gold)] cursor-pointer"
        />
      </label>
      <button
        type="button"
        className="p-1.5 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{vid.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)] flex-wrap">
          <span className="text-[var(--color-surf)]">{categoryName}</span>
          <a href={vid.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-surf)] hover:underline truncate max-w-xs">
            {vid.url}
          </a>
          <span className={vid.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
            {vid.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors" title="Edit">
          <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

/* ---------- component ---------- */

export default function AdminTrainingPage(): React.JSX.Element {
  const [subTab, setSubTab] = useState<'categories' | 'events' | 'videos'>('categories');

  // Video categories state
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [videoCategoriesLoading, setVideoCategoriesLoading] = useState(true);
  const [editingVideoCategory, setEditingVideoCategory] = useState<Partial<VideoCategory> | null>(null);
  const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});
  const [filterVideoCategoryId, setFilterVideoCategoryId] = useState<string>('all');
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

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

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    fetchVideoCategories();
    fetchEvents();
    fetchVideos();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchVideoCategories(): Promise<void> {
    setVideoCategoriesLoading(true);
    const { data, error } = await supabase
      .from('video_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setVideoCategories(data as VideoCategory[]);
    setVideoCategoriesLoading(false);
  }

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
    if (!error && data) {
      const vids = data as TrainingVideo[];
      setVideos(vids);
      // Compute video counts per category
      const counts: Record<string, number> = {};
      vids.forEach((v) => {
        counts[v.category_id] = (counts[v.category_id] || 0) + 1;
      });
      setVideoCounts(counts);
    }
    setVideosLoading(false);
  }

  /* --- Drag-to-reorder handlers --- */

  async function handleVideoCategoryReorder(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videoCategories.findIndex((c) => c.id === active.id);
    const newIndex = videoCategories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(videoCategories, oldIndex, newIndex);
    setVideoCategories(reordered);

    // Batch-update sort_order for each category
    const updates = reordered.map((cat, i) => (
      supabase.from('video_categories').update({ sort_order: i + 1 }).eq('id', cat.id)
    ));

    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) {
      setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
      fetchVideoCategories();
    } else {
      setFeedback({ type: 'success', message: 'Order saved.' });
    }
  }

  async function handleVideoReorder(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Work within the filtered list
    const workingList = filterVideoCategoryId === 'all'
      ? videos
      : videos.filter((v) => v.category_id === filterVideoCategoryId);

    const oldIndex = workingList.findIndex((v) => v.id === active.id);
    const newIndex = workingList.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedFiltered = arrayMove(workingList, oldIndex, newIndex);

    if (filterVideoCategoryId === 'all') {
      // Replace entire videos array
      setVideos(reorderedFiltered);
    } else {
      // Merge reordered filtered items back into the full array
      const otherVids = videos.filter((v) => v.category_id !== filterVideoCategoryId);
      setVideos([...otherVids, ...reorderedFiltered]);
    }

    // Batch-update sort_order for reordered items
    const updates = reorderedFiltered.map((vid, i) => (
      supabase.from('training_videos').update({ sort_order: i + 1 }).eq('id', vid.id)
    ));

    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) {
      setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
      fetchVideos();
    } else {
      setFeedback({ type: 'success', message: 'Order saved.' });
    }
  }

  /* --- Checkbox / bulk move --- */

  function toggleVideoSelection(id: string): void {
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function deselectAllVideos(): void {
    setSelectedVideoIds(new Set());
  }

  async function handleBulkMoveVideos(targetCategoryId: string): Promise<void> {
    if (selectedVideoIds.size === 0) return;

    setSaving(true);
    const ids = Array.from(selectedVideoIds);
    const { error } = await supabase
      .from('training_videos')
      .update({ category_id: targetCategoryId })
      .in('id', ids);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to move videos.' });
    } else {
      setFeedback({ type: 'success', message: `Moved ${ids.length} video${ids.length > 1 ? 's' : ''}.` });
      deselectAllVideos();
      fetchVideos();
    }
    setSaving(false);
  }

  /* --- Video category CRUD --- */

  async function handleSaveVideoCategory(): Promise<void> {
    if (!editingVideoCategory || !editingVideoCategory.name?.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }
    setSaving(true);

    const payload = {
      name: editingVideoCategory.name,
      sort_order: editingVideoCategory.sort_order || 0,
      status: editingVideoCategory.status || 'published',
    };

    if (editingVideoCategory.id) {
      const { error } = await supabase.from('video_categories').update(payload).eq('id', editingVideoCategory.id);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update category.' });
      } else {
        setFeedback({ type: 'success', message: 'Category updated.' });
        setEditingVideoCategory(null);
        fetchVideoCategories();
      }
    } else {
      const { error } = await supabase.from('video_categories').insert(payload);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create category.' });
      } else {
        setFeedback({ type: 'success', message: 'Category created!' });
        setEditingVideoCategory(null);
        fetchVideoCategories();
      }
    }
    setSaving(false);
  }

  async function handleDeleteVideoCategory(cat: VideoCategory): Promise<void> {
    const count = videoCounts[cat.id] || 0;
    if (count > 0) {
      setFeedback({ type: 'error', message: `Cannot delete "${cat.name}" \u2014 it has ${count} video${count > 1 ? 's' : ''}. Move or delete them first.` });
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('video_categories').delete().eq('id', cat.id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } else {
      setFeedback({ type: 'success', message: 'Category deleted.' });
      fetchVideoCategories();
    }
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
    if (!editingVideo || !editingVideo.title?.trim() || !editingVideo.url?.trim() || !editingVideo.category_id) {
      setFeedback({ type: 'error', message: 'Title, URL, and category are required.' });
      return;
    }
    setSaving(true);

    const payload = {
      title: editingVideo.title,
      url: editingVideo.url,
      description: editingVideo.description || null,
      category_id: editingVideo.category_id,
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

  /* --- helpers --- */

  function formatEventDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getVideoCategoryName(categoryId: string): string {
    return videoCategories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  const filteredVideos = filterVideoCategoryId === 'all'
    ? videos
    : videos.filter((v) => v.category_id === filterVideoCategoryId);

  const loading = subTab === 'categories' ? videoCategoriesLoading : subTab === 'events' ? eventsLoading : videosLoading;
  const isEditing = editingVideoCategory || editingEvent || editingVideo;

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
            onClick={() =>
              subTab === 'categories'
                ? setEditingVideoCategory({ ...({ name: '', sort_order: 0, status: 'published' } as Partial<VideoCategory>), sort_order: Math.max(...videoCategories.map((c) => c.sort_order), 0) + 1 })
                : subTab === 'events'
                  ? setEditingEvent({ ...emptyEvent })
                  : setEditingVideo({ ...emptyVideo, sort_order: Math.max(...videos.map((v) => v.sort_order), 0) + 1, category_id: videoCategories.length > 0 ? videoCategories[0].id : '' })
            }
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {subTab === 'categories' ? 'New Category' : subTab === 'events' ? 'New Event' : 'Add Video'}
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setSubTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === 'categories'
                ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Categories
          </button>
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

        {/* Categories list */}
        {subTab === 'categories' && !videoCategoriesLoading && !isEditing && (
          <>
            {videoCategories.length > 0 && <p className="text-xs text-[var(--color-wave)] mb-2">Drag items to reorder</p>}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVideoCategoryReorder}>
              <SortableContext items={videoCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
                  {videoCategories.map((cat) => (
                    <SortableVideoCategoryItem
                      key={cat.id}
                      cat={cat}
                      videoCount={videoCounts[cat.id] || 0}
                      onEdit={() => setEditingVideoCategory(cat)}
                      onDelete={() => handleDeleteVideoCategory(cat)}
                    />
                  ))}
                  {videoCategories.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-[var(--color-mist)]">No categories yet. Click "New Category" to create one.</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </>
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
          <>
            {/* Category filter */}
            <div className="mb-4">
              <select
                value={filterVideoCategoryId}
                onChange={(e) => {
                  setFilterVideoCategoryId(e.target.value);
                  setSelectedVideoIds(new Set());
                }}
                className={`${inputClass} sm:w-64`}
              >
                <option value="all">All Categories</option>
                {videoCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {filteredVideos.length > 0 && <p className="text-xs text-[var(--color-wave)] mb-2">Drag items to reorder &middot; Check items to bulk move</p>}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVideoReorder}>
              <SortableContext items={filteredVideos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
                <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
                  {filteredVideos.map((vid) => (
                    <SortableVideoItem
                      key={vid.id}
                      vid={vid}
                      categoryName={getVideoCategoryName(vid.category_id)}
                      isSelected={selectedVideoIds.has(vid.id)}
                      onToggleSelect={() => toggleVideoSelection(vid.id)}
                      onEdit={() => setEditingVideo(vid)}
                      onDelete={() => handleDeleteVideo(vid.id)}
                    />
                  ))}
                  {filteredVideos.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-[var(--color-mist)]">
                        {filterVideoCategoryId === 'all'
                          ? 'No videos yet. Click "Add Video" to create one.'
                          : 'No videos in this category.'}
                      </p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* Floating bulk move action bar */}
            <AnimatePresence>
              {selectedVideoIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg border border-[var(--color-gold)]/30"
                >
                  <span className="text-sm font-medium">{selectedVideoIds.size} selected</span>
                  <select
                    onChange={(e) => { if (e.target.value) handleBulkMoveVideos(e.target.value); e.target.value = ''; }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[var(--color-abyss)] text-sm font-medium cursor-pointer"
                    defaultValue=""
                    disabled={saving}
                  >
                    <option value="" disabled>Move to...</option>
                    {videoCategories.filter((c) => c.status === 'published').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button onClick={deselectAllVideos} className="text-sm text-[var(--color-wave)] hover:text-[var(--color-pearl)] transition-colors">
                    Deselect all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Video category editor modal */}
        <AnimatePresence>
          {editingVideoCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingVideoCategory(null)} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-lg w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingVideoCategory.id ? 'Edit Category' : 'New Category'}</h2>
                  <button onClick={() => setEditingVideoCategory(null)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Name</label>
                    <input
                      type="text"
                      value={editingVideoCategory.name || ''}
                      onChange={(e) => setEditingVideoCategory({ ...editingVideoCategory, name: e.target.value })}
                      className={inputClass}
                      placeholder="Category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                    <select
                      value={editingVideoCategory.status || 'published'}
                      onChange={(e) => setEditingVideoCategory({ ...editingVideoCategory, status: e.target.value as VideoCategory['status'] })}
                      className={inputClass}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button onClick={handleSaveVideoCategory} disabled={saving} className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Category'}
                    </button>
                    <button onClick={() => setEditingVideoCategory(null)} className="btn-secondary !px-6 !py-2.5 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Category</label>
                    <select
                      value={editingVideo.category_id || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, category_id: e.target.value })}
                      className={inputClass}
                    >
                      <option value="" disabled>Select a category</option>
                      {videoCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
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
