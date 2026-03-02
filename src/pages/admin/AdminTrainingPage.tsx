import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, Calendar, Video, GripVertical, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
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

/* ---------- ID helpers ---------- */

function toCatSortId(catId: string): string {
  return `cat-${catId}`;
}

function fromCatSortId(sortId: UniqueIdentifier): string {
  return String(sortId).replace(/^cat-/, '');
}

/* ---------- sortable sub-components ---------- */

interface SortableVideoCategoryGroupProps {
  cat: VideoCategory;
  items: TrainingVideo[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddVideo: () => void;
  selectedVideoIds: Set<string>;
  onToggleVideoSelect: (id: string) => void;
  onEditVideo: (vid: TrainingVideo) => void;
  onDeleteVideo: (vid: TrainingVideo) => void;
  activeDragType: 'category' | 'item' | null;
  overCategoryId: string | null;
}

function SortableVideoCategoryGroup({
  cat,
  items,
  isExpanded,
  onToggleExpand,
  onEditCategory,
  onDeleteCategory,
  onAddVideo,
  selectedVideoIds,
  onToggleVideoSelect,
  onEditVideo,
  onDeleteVideo,
  activeDragType,
  overCategoryId,
}: SortableVideoCategoryGroupProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: toCatSortId(cat.id),
    data: { type: 'category' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    position: 'relative' as const,
  };

  const isHighlighted = activeDragType === 'item' && overCategoryId === cat.id;

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      {/* Category header bar */}
      <div
        className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
          isHighlighted
            ? 'ring-2 ring-[var(--color-gold)] shadow-[0_0_16px_rgba(var(--gold-rgb,212,175,55),0.3)]'
            : ''
        }`}
      >
        <button
          type="button"
          className="p-1 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
          aria-label="Drag to reorder category"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-[var(--color-wave)]" />
          </motion.span>
          <h3 className="font-semibold truncate text-[var(--color-pearl)]">
            {cat.name}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)] text-xs shrink-0">
            {items.length} video{items.length !== 1 ? 's' : ''}
          </span>
          <span
            className={`text-xs shrink-0 ${
              cat.status === 'published'
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-wave)]'
            }`}
          >
            {cat.status}
          </span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onAddVideo}
            className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            title="Add video to this category"
          >
            <Plus className="w-4 h-4 text-[var(--color-gold)]" />
          </button>
          <button
            onClick={onEditCategory}
            className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            title="Edit category"
          >
            <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
          </button>
          <button
            onClick={onDeleteCategory}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Expandable video items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-1 pl-4">
              <SortableContext
                items={items.map((v) => v.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((vid) => (
                  <SortableVideoItem
                    key={vid.id}
                    vid={vid}
                    isSelected={selectedVideoIds.has(vid.id)}
                    onToggleSelect={() => onToggleVideoSelect(vid.id)}
                    onEdit={() => onEditVideo(vid)}
                    onDelete={() => onDeleteVideo(vid)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="py-4 px-3 text-sm text-[var(--color-wave)] italic">
                    No videos in this category.
                  </div>
                )}
              </SortableContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Sortable video item ---------- */

interface SortableVideoItemProps {
  vid: TrainingVideo;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableVideoItem({
  vid,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: SortableVideoItemProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: vid.id,
    data: { type: 'item', containerId: vid.category_id },
  });

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
        className="p-1 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-[var(--color-pearl)]">
          {vid.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-wave)] flex-wrap">
          <a
            href={vid.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-surf)] hover:underline truncate max-w-xs"
          >
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

/* ---------- Unassigned droppable zone ---------- */

interface UnassignedVideoZoneProps {
  items: TrainingVideo[];
  selectedVideoIds: Set<string>;
  onToggleVideoSelect: (id: string) => void;
  onEditVideo: (vid: TrainingVideo) => void;
  onDeleteVideo: (vid: TrainingVideo) => void;
  activeDragType: 'category' | 'item' | null;
  overCategoryId: string | null;
}

function UnassignedVideoZone({
  items,
  selectedVideoIds,
  onToggleVideoSelect,
  onEditVideo,
  onDeleteVideo,
  activeDragType,
  overCategoryId,
}: UnassignedVideoZoneProps): React.JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned-drop',
    data: { type: 'unassigned-zone' },
  });

  const isHighlighted =
    (activeDragType === 'item' && overCategoryId === 'unassigned') || isOver;

  return (
    <div ref={setNodeRef} className="mb-3">
      <div
        className={`glass rounded-xl px-4 py-3 transition-all duration-200 ${
          isHighlighted
            ? 'ring-2 ring-[var(--color-gold)] shadow-[0_0_16px_rgba(var(--gold-rgb,212,175,55),0.3)]'
            : ''
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-[var(--color-wave)]">Unassigned</h3>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-ocean)]/20 text-[var(--color-wave)] text-xs">
            {items.length} video{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="pl-4">
          <SortableContext
            items={items.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((vid) => (
              <SortableVideoItem
                key={vid.id}
                vid={vid}
                isSelected={selectedVideoIds.has(vid.id)}
                onToggleSelect={() => onToggleVideoSelect(vid.id)}
                onEdit={() => onEditVideo(vid)}
                onDelete={() => onDeleteVideo(vid)}
              />
            ))}
            {items.length === 0 && (
              <div className="py-3 text-sm text-[var(--color-wave)] italic">
                No unassigned videos.
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

/* ---------- Drag overlay previews ---------- */

function CategoryDragPreview({ cat, itemCount }: { cat: VideoCategory; itemCount: number }): React.JSX.Element {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl opacity-90 scale-[1.02] border border-[var(--color-gold)]/40">
      <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      <h3 className="font-semibold text-[var(--color-pearl)]">{cat.name}</h3>
      <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)] text-xs">
        {itemCount} video{itemCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function VideoDragPreview({ vid }: { vid: TrainingVideo }): React.JSX.Element {
  return (
    <div className="glass rounded-lg px-3 py-2.5 flex items-center gap-3 shadow-2xl opacity-90 scale-[1.02] border border-[var(--color-gold)]/40">
      <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-[var(--color-pearl)]">
          {vid.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-wave)]">
          <span className="text-[var(--color-surf)] truncate max-w-xs">{vid.url}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function AdminTrainingPage(): React.JSX.Element {
  const [subTab, setSubTab] = useState<'events' | 'videos'>('videos');

  // Video categories state
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [videoCategoriesLoading, setVideoCategoriesLoading] = useState(true);
  const [editingVideoCategory, setEditingVideoCategory] = useState<Partial<VideoCategory> | null>(null);

  // Events state
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<TrainingEvent> | null>(null);

  // Videos state
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Partial<TrainingVideo> | null>(null);

  // Selection / bulk
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

  // Shared state
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // DnD state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeDragType, setActiveDragType] = useState<'category' | 'item' | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<string | null>(null);

  // Expand/collapse state for categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Derived: videos grouped by category
  const videosByCategory = useMemo(() => {
    const map: Record<string, TrainingVideo[]> = {};
    for (const cat of videoCategories) {
      map[cat.id] = videos
        .filter((v) => v.category_id === cat.id)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    map['unassigned'] = videos.filter(
      (v) => !v.category_id || !videoCategories.find((c) => c.id === v.category_id),
    );
    return map;
  }, [videoCategories, videos]);

  // On first load, expand all categories
  useEffect(() => {
    if (videoCategories.length > 0 && expandedCats.size === 0) {
      setExpandedCats(new Set(videoCategories.map((c) => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoCategories]);

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
      setVideos(data as TrainingVideo[]);
    }
    setVideosLoading(false);
  }

  /* ---------- expand/collapse ---------- */

  const toggleExpand = useCallback((catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  /* ---------- DnD handlers ---------- */

  function findContainerForVideo(itemId: UniqueIdentifier): string | null {
    const strId = String(itemId);
    if (strId.startsWith('cat-')) return null;

    for (const cat of videoCategories) {
      const items = videosByCategory[cat.id] || [];
      if (items.find((v) => v.id === strId)) return cat.id;
    }
    const unassigned = videosByCategory['unassigned'] || [];
    if (unassigned.find((v) => v.id === strId)) return 'unassigned';
    return null;
  }

  function handleDragStart(event: DragStartEvent): void {
    const { active } = event;
    const type = active.data.current?.type as 'category' | 'item' | undefined;
    setActiveId(active.id);
    setActiveDragType(type || null);
  }

  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    if (!over) {
      setOverCategoryId(null);
      return;
    }

    const activeType = active.data.current?.type;

    // If dragging a category, we don't do cross-container logic
    if (activeType === 'category') {
      setOverCategoryId(null);
      return;
    }

    // Dragging an item
    const activeVideoId = String(active.id);
    const overId = String(over.id);

    // Determine the target container
    let targetContainer: string | null = null;

    // Check if hovering over the unassigned droppable zone
    if (overId === 'unassigned-drop' || over.data.current?.type === 'unassigned-zone') {
      targetContainer = 'unassigned';
    }
    // Check if over a category bar
    else if (overId.startsWith('cat-')) {
      targetContainer = fromCatSortId(overId);
    }
    // Check if over another item
    else {
      targetContainer = findContainerForVideo(over.id);
    }

    setOverCategoryId(targetContainer);

    if (!targetContainer) return;

    // Find the source container
    const sourceContainer = findContainerForVideo(active.id);
    if (!sourceContainer || sourceContainer === targetContainer) return;

    // Move the video to the new container in local state
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === activeVideoId) {
          return {
            ...v,
            category_id: targetContainer === 'unassigned' ? '' : targetContainer!,
          };
        }
        return v;
      }),
    );
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragType(null);
    setOverCategoryId(null);

    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType === 'category') {
      // Reorder categories
      const activeRealId = fromCatSortId(active.id);
      const overRealId = fromCatSortId(over.id);
      if (activeRealId === overRealId) return;

      const oldIndex = videoCategories.findIndex((c) => c.id === activeRealId);
      const newIndex = videoCategories.findIndex((c) => c.id === overRealId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(videoCategories, oldIndex, newIndex).map((cat, i) => ({
        ...cat,
        sort_order: i + 1,
      }));
      setVideoCategories(reordered);

      const updates = reordered.map((cat, i) =>
        supabase.from('video_categories').update({ sort_order: i + 1 }).eq('id', cat.id),
      );
      const results = await Promise.all(updates);
      const failed = results.some((r) => r.error);
      if (failed) {
        setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
        fetchVideoCategories();
      } else {
        setFeedback({ type: 'success', message: 'Category order saved.' });
      }
    } else if (activeType === 'item') {
      // Item drag ended -- persist the current state
      const activeVideoId = String(active.id);
      const vid = videos.find((v) => v.id === activeVideoId);
      if (!vid) return;

      // Find the container for this item (may have been changed in onDragOver)
      const container = vid.category_id || 'unassigned';
      const containerItems = (videosByCategory[container] || []).filter(
        (v) => v.id !== activeVideoId,
      );

      // Determine position within the container
      const overId = String(over.id);
      let newIndex = containerItems.length; // default: end

      // If dropped on another item in the same container
      const overItemIndex = containerItems.findIndex((v) => v.id === overId);
      if (overItemIndex !== -1) {
        newIndex = overItemIndex;
      }

      // Insert item at position
      const finalItems = [...containerItems];
      finalItems.splice(newIndex, 0, vid);

      // Update sort_order for all items in this container
      const updatedVideos = finalItems.map((v, i) => ({ ...v, sort_order: i + 1 }));

      // Update local state
      setVideos((prev) => {
        const rest = prev.filter(
          (v) => !updatedVideos.find((u) => u.id === v.id),
        );
        return [...rest, ...updatedVideos];
      });

      // Persist to Supabase: update sort_order and category_id
      const updates = updatedVideos.map((v, i) =>
        supabase
          .from('training_videos')
          .update({
            sort_order: i + 1,
            category_id: container === 'unassigned' ? '' : container,
          })
          .eq('id', v.id),
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
  }

  /* ---------- Checkbox / bulk move ---------- */

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
      setFeedback({
        type: 'success',
        message: `Moved ${ids.length} video${ids.length > 1 ? 's' : ''}.`,
      });
      deselectAllVideos();
      fetchVideos();
    }
    setSaving(false);
  }

  /* ---------- Video category CRUD ---------- */

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
    const count = (videosByCategory[cat.id] || []).length;
    if (count > 0) {
      setFeedback({
        type: 'error',
        message: `Cannot delete "${cat.name}" \u2014 it has ${count} video${count > 1 ? 's' : ''}. Move or delete them first.`,
      });
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

  /* ---------- Event CRUD ---------- */

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

  /* ---------- Video CRUD ---------- */

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

  /* ---------- open helpers ---------- */

  function openNewVideo(presetCategoryId?: string): void {
    setEditingVideo({
      ...emptyVideo,
      sort_order: Math.max(...videos.map((v) => v.sort_order), 0) + 1,
      category_id: presetCategoryId || (videoCategories.length > 0 ? videoCategories[0].id : ''),
    });
  }

  function openEditVideo(vid: TrainingVideo): void {
    setEditingVideo(vid);
  }

  /* ---------- helpers ---------- */

  function formatEventDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /* ---------- DragOverlay data ---------- */

  const activeCat = useMemo(() => {
    if (!activeId || activeDragType !== 'category') return null;
    const realId = fromCatSortId(activeId);
    return videoCategories.find((c) => c.id === realId) || null;
  }, [activeId, activeDragType, videoCategories]);

  const activeVid = useMemo(() => {
    if (!activeId || activeDragType !== 'item') return null;
    return videos.find((v) => v.id === String(activeId)) || null;
  }, [activeId, activeDragType, videos]);

  /* ---------- render ---------- */

  const isEditing = editingVideoCategory || editingEvent || editingVideo;
  const loading = subTab === 'events' ? eventsLoading : (videoCategoriesLoading || videosLoading);

  // Build sortable IDs for the outer category context
  const categorySortIds = useMemo(
    () => videoCategories.map((c) => toCatSortId(c.id)),
    [videoCategories],
  );

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
          <div className="flex items-center gap-2">
            {subTab === 'videos' && (
              <button
                onClick={() =>
                  setEditingVideoCategory({
                    name: '',
                    sort_order: Math.max(...videoCategories.map((c) => c.sort_order), 0) + 1,
                    status: 'published',
                  } as Partial<VideoCategory>)
                }
                className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
            )}
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
          </div>
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

        {/* Videos grouped list */}
        {subTab === 'videos' && !videoCategoriesLoading && !videosLoading && !isEditing && (
          <>
            {(videoCategories.length > 0 || videos.length > 0) && (
              <p className="text-xs text-[var(--color-wave)] mb-3">
                Drag to reorder categories and videos &middot; Check items to bulk move
              </p>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {/* Outer sortable context for category ordering */}
              <SortableContext
                items={categorySortIds}
                strategy={verticalListSortingStrategy}
              >
                {videoCategories.map((cat) => (
                  <SortableVideoCategoryGroup
                    key={cat.id}
                    cat={cat}
                    items={videosByCategory[cat.id] || []}
                    isExpanded={expandedCats.has(cat.id)}
                    onToggleExpand={() => toggleExpand(cat.id)}
                    onEditCategory={() => setEditingVideoCategory(cat)}
                    onDeleteCategory={() => handleDeleteVideoCategory(cat)}
                    onAddVideo={() => openNewVideo(cat.id)}
                    selectedVideoIds={selectedVideoIds}
                    onToggleVideoSelect={toggleVideoSelection}
                    onEditVideo={openEditVideo}
                    onDeleteVideo={handleDeleteVideo}
                    activeDragType={activeDragType}
                    overCategoryId={overCategoryId}
                  />
                ))}
              </SortableContext>

              {/* Unassigned zone */}
              <UnassignedVideoZone
                items={videosByCategory['unassigned'] || []}
                selectedVideoIds={selectedVideoIds}
                onToggleVideoSelect={toggleVideoSelection}
                onEditVideo={openEditVideo}
                onDeleteVideo={handleDeleteVideo}
                activeDragType={activeDragType}
                overCategoryId={overCategoryId}
              />

              {/* Drag overlay rendered via portal */}
              {createPortal(
                <DragOverlay>
                  {activeCat && (
                    <CategoryDragPreview
                      cat={activeCat}
                      itemCount={(videosByCategory[activeCat.id] || []).length}
                    />
                  )}
                  {activeVid && <VideoDragPreview vid={activeVid} />}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>

            {videoCategories.length === 0 && videos.length === 0 && (
              <div className="glass rounded-xl p-12 text-center">
                <p className="text-[var(--color-mist)]">
                  No categories or videos yet. Create a category to get started.
                </p>
              </div>
            )}

            {/* Floating bulk move action bar */}
            <AnimatePresence>
              {selectedVideoIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg border border-[var(--color-gold)]/30"
                >
                  <span className="text-sm font-medium">
                    {selectedVideoIds.size} selected
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBulkMoveVideos(e.target.value);
                      e.target.value = '';
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[var(--color-abyss)] text-sm font-medium cursor-pointer"
                    defaultValue=""
                    disabled={saving}
                  >
                    <option value="" disabled>
                      Move to...
                    </option>
                    {videoCategories
                      .filter((c) => c.status === 'published')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={deselectAllVideos}
                    className="text-sm text-[var(--color-wave)] hover:text-[var(--color-pearl)] transition-colors"
                  >
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
