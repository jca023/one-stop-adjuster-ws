import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, FileText, Upload, GripVertical, ChevronDown } from 'lucide-react';
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
import type { DocumentCategory, Document } from '../../lib/supabase';

const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors';

const emptyCategory: Partial<DocumentCategory> = {
  name: '',
  sort_order: 0,
  status: 'published',
};

const emptyDocument: Partial<Document> = {
  title: '',
  description: '',
  category_id: '',
  file_url: '',
  file_name: '',
  file_size: 0,
  file_type: '',
  sort_order: 0,
  status: 'published',
};

/* ---------- helpers ---------- */

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '\u2014';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileType(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

async function uploadFile(file: File): Promise<{ url: string; path: string }> {
  const path = `${crypto.randomUUID()}_${file.name}`;
  const { error } = await supabase.storage.from('documents').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('documents').getPublicUrl(path);
  return { url: data.publicUrl, path };
}

function getStoragePath(fileUrl: string): string | null {
  const match = fileUrl.match(/\/documents\/(.+)$/);
  return match ? match[1] : null;
}

/* ---------- ID helpers ---------- */

function toCatSortId(catId: string): string {
  return `cat-${catId}`;
}

function fromCatSortId(sortId: UniqueIdentifier): string {
  return String(sortId).replace(/^cat-/, '');
}

/* ---------- sortable sub-components ---------- */

interface SortableCategoryGroupProps {
  cat: DocumentCategory;
  items: Document[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddDocument: () => void;
  selectedDocIds: Set<string>;
  onToggleDocSelect: (id: string) => void;
  onEditDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
  activeDragType: 'category' | 'item' | null;
  overCategoryId: string | null;
}

function SortableCategoryGroup({
  cat,
  items,
  isExpanded,
  onToggleExpand,
  onEditCategory,
  onDeleteCategory,
  onAddDocument,
  selectedDocIds,
  onToggleDocSelect,
  onEditDocument,
  onDeleteDocument,
  activeDragType,
  overCategoryId,
}: SortableCategoryGroupProps): React.JSX.Element {
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
            {items.length} doc{items.length !== 1 ? 's' : ''}
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
            onClick={onAddDocument}
            className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            title="Add document to this category"
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

      {/* Expandable document items */}
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
                items={items.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((doc) => (
                  <SortableDocItem
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedDocIds.has(doc.id)}
                    onToggleSelect={() => onToggleDocSelect(doc.id)}
                    onEdit={() => onEditDocument(doc)}
                    onDelete={() => onDeleteDocument(doc)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="py-4 px-3 text-sm text-[var(--color-wave)] italic">
                    No documents in this category.
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

/* ---------- Sortable document item ---------- */

interface SortableDocItemProps {
  doc: Document;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableDocItem({
  doc,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: SortableDocItemProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: doc.id,
    data: { type: 'item', containerId: doc.category_id },
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
          {doc.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-wave)] flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-semibold uppercase tracking-wide">
            {doc.file_type}
          </span>
          <span>{formatFileSize(doc.file_size)}</span>
          <span
            className={
              doc.status === 'published'
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-wave)]'
            }
          >
            {doc.status}
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

interface UnassignedZoneProps {
  items: Document[];
  selectedDocIds: Set<string>;
  onToggleDocSelect: (id: string) => void;
  onEditDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
  activeDragType: 'category' | 'item' | null;
  overCategoryId: string | null;
}

function UnassignedZone({
  items,
  selectedDocIds,
  onToggleDocSelect,
  onEditDocument,
  onDeleteDocument,
  activeDragType,
  overCategoryId,
}: UnassignedZoneProps): React.JSX.Element {
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
            {items.length} doc{items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="pl-4">
          <SortableContext
            items={items.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((doc) => (
              <SortableDocItem
                key={doc.id}
                doc={doc}
                isSelected={selectedDocIds.has(doc.id)}
                onToggleSelect={() => onToggleDocSelect(doc.id)}
                onEdit={() => onEditDocument(doc)}
                onDelete={() => onDeleteDocument(doc)}
              />
            ))}
            {items.length === 0 && (
              <div className="py-3 text-sm text-[var(--color-wave)] italic">
                No unassigned documents.
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

/* ---------- Drag overlay previews ---------- */

function CategoryDragPreview({ cat, itemCount }: { cat: DocumentCategory; itemCount: number }): React.JSX.Element {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl opacity-90 scale-[1.02] border border-[var(--color-gold)]/40">
      <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      <h3 className="font-semibold text-[var(--color-pearl)]">{cat.name}</h3>
      <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)] text-xs">
        {itemCount} doc{itemCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function DocDragPreview({ doc }: { doc: Document }): React.JSX.Element {
  return (
    <div className="glass rounded-lg px-3 py-2.5 flex items-center gap-3 shadow-2xl opacity-90 scale-[1.02] border border-[var(--color-gold)]/40">
      <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-[var(--color-pearl)]">
          {doc.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-wave)]">
          <span className="px-1.5 py-0.5 rounded bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-semibold uppercase tracking-wide">
            {doc.file_type}
          </span>
          <span>{formatFileSize(doc.file_size)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function AdminDocumentsPage(): React.JSX.Element {
  // Data state
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);

  // Editing state
  const [editingCategory, setEditingCategory] = useState<Partial<DocumentCategory> | null>(null);
  const [editingDocument, setEditingDocument] = useState<Partial<Document> | null>(null);
  const [saving, setSaving] = useState(false);

  // File upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selection / bulk
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Feedback
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

  // Derived: items grouped by category
  const itemsByCategory = useMemo(() => {
    const map: Record<string, Document[]> = {};
    for (const cat of categories) {
      map[cat.id] = docs
        .filter((d) => d.category_id === cat.id)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    map['unassigned'] = docs.filter(
      (d) => !d.category_id || !categories.find((c) => c.id === d.category_id),
    );
    return map;
  }, [categories, docs]);

  // On first load, expand all categories
  useEffect(() => {
    if (categories.length > 0 && expandedCats.size === 0) {
      setExpandedCats(new Set(categories.map((c) => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchCategories(): Promise<void> {
    setLoading(true);
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setCategories(data as DocumentCategory[]);
    setLoading(false);
  }

  async function fetchDocuments(): Promise<void> {
    setDocsLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setDocs(data as Document[]);
    }
    setDocsLoading(false);
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

  function findContainerForItem(itemId: UniqueIdentifier): string | null {
    // Check if this is a category sortable id
    const strId = String(itemId);
    if (strId.startsWith('cat-')) return null;

    // Find which category contains this document
    for (const cat of categories) {
      const items = itemsByCategory[cat.id] || [];
      if (items.find((d) => d.id === strId)) return cat.id;
    }
    const unassigned = itemsByCategory['unassigned'] || [];
    if (unassigned.find((d) => d.id === strId)) return 'unassigned';
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
    const activeDocId = String(active.id);
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
      targetContainer = findContainerForItem(over.id);
    }

    setOverCategoryId(targetContainer);

    if (!targetContainer) return;

    // Find the source container
    const sourceContainer = findContainerForItem(active.id);
    if (!sourceContainer || sourceContainer === targetContainer) return;

    // Move the item to the new container in local state
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id === activeDocId) {
          return {
            ...d,
            category_id: targetContainer === 'unassigned' ? '' : targetContainer!,
          };
        }
        return d;
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

      const oldIndex = categories.findIndex((c) => c.id === activeRealId);
      const newIndex = categories.findIndex((c) => c.id === overRealId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, i) => ({
        ...cat,
        sort_order: i + 1,
      }));
      setCategories(reordered);

      const updates = reordered.map((cat, i) =>
        supabase.from('document_categories').update({ sort_order: i + 1 }).eq('id', cat.id),
      );
      const results = await Promise.all(updates);
      const failed = results.some((r) => r.error);
      if (failed) {
        setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
        fetchCategories();
      } else {
        setFeedback({ type: 'success', message: 'Category order saved.' });
      }
    } else if (activeType === 'item') {
      // Item drag ended -- persist the current state
      const activeDocId = String(active.id);
      const doc = docs.find((d) => d.id === activeDocId);
      if (!doc) return;

      // Find the container for this item (may have been changed in onDragOver)
      const container = doc.category_id || 'unassigned';
      const containerItems = (itemsByCategory[container] || []).filter(
        (d) => d.id !== activeDocId,
      );

      // Determine position within the container
      const overId = String(over.id);
      let newIndex = containerItems.length; // default: end

      // If dropped on another item in the same container
      const overItemIndex = containerItems.findIndex((d) => d.id === overId);
      if (overItemIndex !== -1) {
        newIndex = overItemIndex;
      }

      // Insert item at position
      const finalItems = [...containerItems];
      finalItems.splice(newIndex, 0, doc);

      // Update sort_order for all items in this container
      const updatedDocs = finalItems.map((d, i) => ({ ...d, sort_order: i + 1 }));

      // Update local state
      setDocs((prev) => {
        const rest = prev.filter(
          (d) => !updatedDocs.find((u) => u.id === d.id),
        );
        return [...rest, ...updatedDocs];
      });

      // Persist to Supabase: update sort_order and category_id
      const updates = updatedDocs.map((d, i) =>
        supabase
          .from('documents')
          .update({
            sort_order: i + 1,
            category_id: container === 'unassigned' ? '' : container,
            updated_at: new Date().toISOString(),
          })
          .eq('id', d.id),
      );
      const results = await Promise.all(updates);
      const failed = results.some((r) => r.error);
      if (failed) {
        setFeedback({ type: 'error', message: 'Failed to save order. Refreshing...' });
        fetchDocuments();
      } else {
        setFeedback({ type: 'success', message: 'Order saved.' });
      }
    }
  }

  /* ---------- Checkbox / bulk move ---------- */

  function toggleDocSelection(id: string): void {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function deselectAllDocs(): void {
    setSelectedDocIds(new Set());
  }

  async function handleBulkMoveDocuments(targetCategoryId: string): Promise<void> {
    if (selectedDocIds.size === 0) return;

    setSaving(true);
    const ids = Array.from(selectedDocIds);
    const { error } = await supabase
      .from('documents')
      .update({ category_id: targetCategoryId, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to move documents.' });
    } else {
      setFeedback({
        type: 'success',
        message: `Moved ${ids.length} document${ids.length > 1 ? 's' : ''}.`,
      });
      deselectAllDocs();
      fetchDocuments();
    }
    setSaving(false);
  }

  /* ---------- Category CRUD ---------- */

  async function handleSaveCategory(): Promise<void> {
    if (!editingCategory || !editingCategory.name?.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }
    setSaving(true);

    const payload = {
      name: editingCategory.name,
      sort_order: editingCategory.sort_order || 0,
      status: editingCategory.status || 'published',
    };

    if (editingCategory.id) {
      const { error } = await supabase
        .from('document_categories')
        .update(payload)
        .eq('id', editingCategory.id);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update category.' });
      } else {
        setFeedback({ type: 'success', message: 'Category updated.' });
        setEditingCategory(null);
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from('document_categories').insert(payload);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create category.' });
      } else {
        setFeedback({ type: 'success', message: 'Category created!' });
        setEditingCategory(null);
        fetchCategories();
      }
    }
    setSaving(false);
  }

  async function handleDeleteCategory(cat: DocumentCategory): Promise<void> {
    const count = (itemsByCategory[cat.id] || []).length;
    if (count > 0) {
      setFeedback({
        type: 'error',
        message: `Cannot delete "${cat.name}" \u2014 it has ${count} document${count > 1 ? 's' : ''}. Move or delete them first.`,
      });
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('document_categories').delete().eq('id', cat.id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } else {
      setFeedback({ type: 'success', message: 'Category deleted.' });
      fetchCategories();
    }
  }

  /* ---------- Document CRUD ---------- */

  async function handleSaveDocument(): Promise<void> {
    if (!editingDocument || !editingDocument.title?.trim() || !editingDocument.category_id) {
      setFeedback({ type: 'error', message: 'Title and category are required.' });
      return;
    }

    // If creating a new document, a file must be selected
    if (!editingDocument.id && !selectedFile) {
      setFeedback({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }

    setSaving(true);

    let fileUrl = editingDocument.file_url || '';
    let fileName = editingDocument.file_name || '';
    let fileSize = editingDocument.file_size || 0;
    let fileType = editingDocument.file_type || '';

    // Upload file if one is selected
    if (selectedFile) {
      try {
        // If replacing an existing file, delete the old one first
        if (editingDocument.id && editingDocument.file_url) {
          const oldPath = getStoragePath(editingDocument.file_url);
          if (oldPath) {
            const { error: rmErr } = await supabase.storage.from('documents').remove([oldPath]);
            if (rmErr) console.error('Failed to remove old file from storage:', rmErr);
          }
        }

        const result = await uploadFile(selectedFile);
        fileUrl = result.url;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        fileType = getFileType(selectedFile.name);
      } catch {
        setFeedback({ type: 'error', message: 'File upload failed. Please try again.' });
        setSaving(false);
        return;
      }
    }

    const payload = {
      title: editingDocument.title,
      description: editingDocument.description || null,
      category_id: editingDocument.category_id,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      sort_order: editingDocument.sort_order || 0,
      status: editingDocument.status || 'published',
      updated_at: new Date().toISOString(),
    };

    if (editingDocument.id) {
      const { error } = await supabase.from('documents').update(payload).eq('id', editingDocument.id);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update document.' });
      } else {
        setFeedback({ type: 'success', message: 'Document updated.' });
        setEditingDocument(null);
        setSelectedFile(null);
        fetchDocuments();
      }
    } else {
      const { error } = await supabase.from('documents').insert(payload);
      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create document.' });
      } else {
        setFeedback({ type: 'success', message: 'Document uploaded!' });
        setEditingDocument(null);
        setSelectedFile(null);
        fetchDocuments();
      }
    }
    setSaving(false);
  }

  async function handleDeleteDocument(doc: Document): Promise<void> {
    if (!window.confirm(`Delete "${doc.title}"? This will also remove the file from storage.`))
      return;

    // Delete the file from storage
    const path = getStoragePath(doc.file_url);
    if (path) {
      const { error: rmErr } = await supabase.storage.from('documents').remove([path]);
      if (rmErr) console.error('Failed to remove file from storage:', rmErr);
    }

    const { error } = await supabase.from('documents').delete().eq('id', doc.id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete document.' });
    } else {
      setFeedback({ type: 'success', message: 'Document deleted.' });
      fetchDocuments();
    }
  }

  /* ---------- open helpers ---------- */

  function openNewDocument(presetCategoryId?: string): void {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditingDocument({
      ...emptyDocument,
      sort_order: Math.max(...docs.map((d) => d.sort_order), 0) + 1,
      category_id: presetCategoryId || (categories.length > 0 ? categories[0].id : ''),
    });
  }

  function openEditDocument(doc: Document): void {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditingDocument(doc);
  }

  /* ---------- DragOverlay data ---------- */

  const activeCat = useMemo(() => {
    if (!activeId || activeDragType !== 'category') return null;
    const realId = fromCatSortId(activeId);
    return categories.find((c) => c.id === realId) || null;
  }, [activeId, activeDragType, categories]);

  const activeDoc = useMemo(() => {
    if (!activeId || activeDragType !== 'item') return null;
    return docs.find((d) => d.id === String(activeId)) || null;
  }, [activeId, activeDragType, docs]);

  /* ---------- render ---------- */

  const isEditing = editingCategory || editingDocument;
  const isLoading = loading || docsLoading;

  // Build sortable IDs for the outer category context
  const categorySortIds = useMemo(
    () => categories.map((c) => toCatSortId(c.id)),
    [categories],
  );

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Documents</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setEditingCategory({
                  ...emptyCategory,
                  sort_order: Math.max(...categories.map((c) => c.sort_order), 0) + 1,
                })
              }
              className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Category
            </button>
            <button
              onClick={() => openNewDocument()}
              className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
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
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/2 mb-2" />
                <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Main grouped list */}
        {!isLoading && !isEditing && (
          <>
            {(categories.length > 0 || docs.length > 0) && (
              <p className="text-xs text-[var(--color-wave)] mb-3">
                Drag to reorder categories and documents &middot; Check items to bulk move
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
                {categories.map((cat) => (
                  <SortableCategoryGroup
                    key={cat.id}
                    cat={cat}
                    items={itemsByCategory[cat.id] || []}
                    isExpanded={expandedCats.has(cat.id)}
                    onToggleExpand={() => toggleExpand(cat.id)}
                    onEditCategory={() => setEditingCategory(cat)}
                    onDeleteCategory={() => handleDeleteCategory(cat)}
                    onAddDocument={() => openNewDocument(cat.id)}
                    selectedDocIds={selectedDocIds}
                    onToggleDocSelect={toggleDocSelection}
                    onEditDocument={openEditDocument}
                    onDeleteDocument={handleDeleteDocument}
                    activeDragType={activeDragType}
                    overCategoryId={overCategoryId}
                  />
                ))}
              </SortableContext>

              {/* Unassigned zone */}
              <UnassignedZone
                items={itemsByCategory['unassigned'] || []}
                selectedDocIds={selectedDocIds}
                onToggleDocSelect={toggleDocSelection}
                onEditDocument={openEditDocument}
                onDeleteDocument={handleDeleteDocument}
                activeDragType={activeDragType}
                overCategoryId={overCategoryId}
              />

              {/* Drag overlay rendered via portal */}
              {createPortal(
                <DragOverlay>
                  {activeCat && (
                    <CategoryDragPreview
                      cat={activeCat}
                      itemCount={(itemsByCategory[activeCat.id] || []).length}
                    />
                  )}
                  {activeDoc && <DocDragPreview doc={activeDoc} />}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>

            {categories.length === 0 && docs.length === 0 && (
              <div className="glass rounded-xl p-12 text-center">
                <p className="text-[var(--color-mist)]">
                  No categories or documents yet. Create a category to get started.
                </p>
              </div>
            )}

            {/* Floating bulk move action bar */}
            <AnimatePresence>
              {selectedDocIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg border border-[var(--color-gold)]/30"
                >
                  <span className="text-sm font-medium">
                    {selectedDocIds.size} selected
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBulkMoveDocuments(e.target.value);
                      e.target.value = '';
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[var(--color-abyss)] text-sm font-medium cursor-pointer"
                    defaultValue=""
                    disabled={saving}
                  >
                    <option value="" disabled>
                      Move to...
                    </option>
                    {categories
                      .filter((c) => c.status === 'published')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={deselectAllDocs}
                    className="text-sm text-[var(--color-wave)] hover:text-[var(--color-pearl)] transition-colors"
                  >
                    Deselect all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Category editor modal */}
        <AnimatePresence>
          {editingCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setEditingCategory(null)}
              />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-lg w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingCategory.id ? 'Edit Category' : 'New Category'}
                  </h2>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editingCategory.name || ''}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Status
                    </label>
                    <select
                      value={editingCategory.status || 'published'}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          status: e.target.value as DocumentCategory['status'],
                        })
                      }
                      className={inputClass}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSaveCategory}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Category'}
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
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

        {/* Document editor modal */}
        <AnimatePresence>
          {editingDocument && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => {
                  setEditingDocument(null);
                  setSelectedFile(null);
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-2xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingDocument.id ? 'Edit Document' : 'Upload Document'}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingDocument(null);
                      setSelectedFile(null);
                    }}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingDocument.title || ''}
                      onChange={(e) =>
                        setEditingDocument({ ...editingDocument, title: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Document title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingDocument.description || ''}
                      onChange={(e) =>
                        setEditingDocument({
                          ...editingDocument,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className={`${inputClass} resize-y`}
                      placeholder="Brief description (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Category
                    </label>
                    <select
                      value={editingDocument.category_id || ''}
                      onChange={(e) =>
                        setEditingDocument({
                          ...editingDocument,
                          category_id: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File upload area */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      File
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-lg border-2 border-dashed border-[var(--color-ocean)]/40 hover:border-[var(--color-gold)]/60 transition-colors p-6 flex flex-col items-center gap-2 text-center cursor-pointer bg-[var(--color-deep)]/50"
                    >
                      {selectedFile ? (
                        <>
                          <FileText className="w-8 h-8 text-[var(--color-gold)]" />
                          <span className="text-sm font-medium text-[var(--color-pearl)]">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-[var(--color-wave)]">
                            {formatFileSize(selectedFile.size)} &middot; Click to replace
                          </span>
                        </>
                      ) : editingDocument.id && editingDocument.file_name ? (
                        <>
                          <FileText className="w-8 h-8 text-[var(--color-surf)]" />
                          <span className="text-sm font-medium text-[var(--color-pearl)]">
                            {editingDocument.file_name}
                          </span>
                          <span className="text-xs text-[var(--color-wave)]">
                            {formatFileSize(editingDocument.file_size || 0)} &middot; Click to
                            replace
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[var(--color-wave)]" />
                          <span className="text-sm text-[var(--color-mist)]">
                            Click to select a file
                          </span>
                          <span className="text-xs text-[var(--color-wave)]">
                            PDF, DOCX, XLSX, or any document type
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Status
                    </label>
                    <select
                      value={editingDocument.status || 'published'}
                      onChange={(e) =>
                        setEditingDocument({
                          ...editingDocument,
                          status: e.target.value as Document['status'],
                        })
                      }
                      className={inputClass}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSaveDocument}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? (selectedFile ? 'Uploading...' : 'Saving...') : 'Save Document'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDocument(null);
                        setSelectedFile(null);
                      }}
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
