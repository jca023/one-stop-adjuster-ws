import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, FolderOpen, FileText, Upload, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
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

/* ---------- sortable sub-components ---------- */

interface SortableCategoryItemProps {
  cat: DocumentCategory;
  docCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableCategoryItem({ cat, docCount, onEdit, onDelete }: SortableCategoryItemProps): React.JSX.Element {
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
            {docCount} doc{docCount !== 1 ? 's' : ''}
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

interface SortableDocumentItemProps {
  doc: Document;
  categoryName: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableDocumentItem({ doc, categoryName, isSelected, onToggleSelect, onEdit, onDelete }: SortableDocumentItemProps): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: doc.id });

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
        <h3 className="font-semibold truncate">{doc.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)] flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-semibold uppercase tracking-wide">
            {doc.file_type}
          </span>
          <span>{formatFileSize(doc.file_size)}</span>
          <span className="text-[var(--color-surf)]">{categoryName}</span>
          <span className={doc.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
            {doc.status}
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

export default function AdminDocumentsPage(): React.JSX.Element {
  const [subTab, setSubTab] = useState<'categories' | 'documents'>('categories');

  // Categories state
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Partial<DocumentCategory> | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<Partial<Document> | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  // Document counts per category (for the categories list)
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checkbox / bulk move state
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Shared state
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
    setCategoriesLoading(true);
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setCategories(data as DocumentCategory[]);
    setCategoriesLoading(false);
  }

  async function fetchDocuments(): Promise<void> {
    setDocumentsLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      const docs = data as Document[];
      setDocuments(docs);
      // Compute document counts per category
      const counts: Record<string, number> = {};
      docs.forEach((d) => {
        counts[d.category_id] = (counts[d.category_id] || 0) + 1;
      });
      setDocCounts(counts);
    }
    setDocumentsLoading(false);
  }

  /* --- Drag-to-reorder handlers --- */

  async function handleCategoryReorder(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    // Batch-update sort_order for each category
    const updates = reordered.map((cat, i) => (
      supabase.from('document_categories').update({ sort_order: i + 1 }).eq('id', cat.id)
    ));

    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) {
      setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
      fetchCategories();
    }
  }

  async function handleDocumentReorder(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Work within the filtered list
    const workingList = filterCategoryId === 'all'
      ? documents
      : documents.filter((d) => d.category_id === filterCategoryId);

    const oldIndex = workingList.findIndex((d) => d.id === active.id);
    const newIndex = workingList.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedFiltered = arrayMove(workingList, oldIndex, newIndex);

    if (filterCategoryId === 'all') {
      // Replace entire documents array
      setDocuments(reorderedFiltered);
    } else {
      // Merge reordered filtered items back into the full array
      const otherDocs = documents.filter((d) => d.category_id !== filterCategoryId);
      setDocuments([...otherDocs, ...reorderedFiltered]);
    }

    // Batch-update sort_order for reordered items
    const updates = reorderedFiltered.map((doc, i) => (
      supabase.from('documents').update({ sort_order: i + 1 }).eq('id', doc.id)
    ));

    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) {
      setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
      fetchDocuments();
    }
  }

  /* --- Checkbox / bulk move --- */

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
      setFeedback({ type: 'success', message: `Moved ${ids.length} document${ids.length > 1 ? 's' : ''}.` });
      deselectAllDocs();
      fetchDocuments();
    }
    setSaving(false);
  }

  /* --- Category CRUD --- */

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
      const { error } = await supabase.from('document_categories').update(payload).eq('id', editingCategory.id);
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
    const count = docCounts[cat.id] || 0;
    if (count > 0) {
      setFeedback({ type: 'error', message: `Cannot delete "${cat.name}" \u2014 it has ${count} document${count > 1 ? 's' : ''}. Move or delete them first.` });
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

  /* --- Document CRUD --- */

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
    if (!window.confirm(`Delete "${doc.title}"? This will also remove the file from storage.`)) return;

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

  /* --- helpers --- */

  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  function openNewDocument(): void {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditingDocument({
      ...emptyDocument,
      sort_order: Math.max(...documents.map((d) => d.sort_order), 0) + 1,
      category_id: categories.length > 0 ? categories[0].id : '',
    });
  }

  function openEditDocument(doc: Document): void {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditingDocument(doc);
  }

  const filteredDocuments = filterCategoryId === 'all'
    ? documents
    : documents.filter((d) => d.category_id === filterCategoryId);

  const loading = subTab === 'categories' ? categoriesLoading : documentsLoading;
  const isEditing = editingCategory || editingDocument;

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Documents</h1>
          </div>
          <button
            onClick={() => subTab === 'categories'
              ? setEditingCategory({ ...emptyCategory, sort_order: Math.max(...categories.map((c) => c.sort_order), 0) + 1 })
              : openNewDocument()
            }
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            {subTab === 'categories' ? 'New Category' : 'Upload Document'}
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
            onClick={() => setSubTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === 'documents'
                ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
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
        {subTab === 'categories' && !categoriesLoading && !isEditing && (
          <>
            <p className="text-xs text-[var(--color-wave)] mb-2">Drag items to reorder</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryReorder}>
              <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
                  {categories.map((cat) => (
                    <SortableCategoryItem
                      key={cat.id}
                      cat={cat}
                      docCount={docCounts[cat.id] || 0}
                      onEdit={() => setEditingCategory(cat)}
                      onDelete={() => handleDeleteCategory(cat)}
                    />
                  ))}
                  {categories.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-[var(--color-mist)]">No categories yet. Click "New Category" to create one.</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}

        {/* Documents list */}
        {subTab === 'documents' && !documentsLoading && !isEditing && (
          <>
            {/* Category filter */}
            <div className="mb-4">
              <select
                value={filterCategoryId}
                onChange={(e) => {
                  setFilterCategoryId(e.target.value);
                  setSelectedDocIds(new Set());
                }}
                className={`${inputClass} sm:w-64`}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-[var(--color-wave)] mb-2">Drag items to reorder</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDocumentReorder}>
              <SortableContext items={filteredDocuments.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
                  {filteredDocuments.map((doc) => (
                    <SortableDocumentItem
                      key={doc.id}
                      doc={doc}
                      categoryName={getCategoryName(doc.category_id)}
                      isSelected={selectedDocIds.has(doc.id)}
                      onToggleSelect={() => toggleDocSelection(doc.id)}
                      onEdit={() => openEditDocument(doc)}
                      onDelete={() => handleDeleteDocument(doc)}
                    />
                  ))}
                  {filteredDocuments.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-[var(--color-mist)]">
                        {filterCategoryId === 'all'
                          ? 'No documents yet. Click "Upload Document" to add one.'
                          : 'No documents in this category.'}
                      </p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            {/* Floating bulk move action bar */}
            <AnimatePresence>
              {selectedDocIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg border border-[var(--color-gold)]/30"
                >
                  <span className="text-sm font-medium">{selectedDocIds.size} selected</span>
                  <select
                    onChange={(e) => { if (e.target.value) handleBulkMoveDocuments(e.target.value); e.target.value = ''; }}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[var(--color-abyss)] text-sm font-medium cursor-pointer"
                    defaultValue=""
                    disabled={saving}
                  >
                    <option value="" disabled>Move to...</option>
                    {categories.filter((c) => c.status === 'published').map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button onClick={deselectAllDocs} className="text-sm text-[var(--color-wave)] hover:text-[var(--color-pearl)] transition-colors">
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
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-lg w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingCategory.id ? 'Edit Category' : 'New Category'}</h2>
                  <button onClick={() => setEditingCategory(null)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Name</label>
                    <input
                      type="text"
                      value={editingCategory.name || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className={inputClass}
                      placeholder="Category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                    <select
                      value={editingCategory.status || 'published'}
                      onChange={(e) => setEditingCategory({ ...editingCategory, status: e.target.value as DocumentCategory['status'] })}
                      className={inputClass}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button onClick={handleSaveCategory} disabled={saving} className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Category'}
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="btn-secondary !px-6 !py-2.5 text-sm">
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
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setEditingDocument(null); setSelectedFile(null); }} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-2xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingDocument.id ? 'Edit Document' : 'Upload Document'}</h2>
                  <button onClick={() => { setEditingDocument(null); setSelectedFile(null); }} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Title</label>
                    <input
                      type="text"
                      value={editingDocument.title || ''}
                      onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
                      className={inputClass}
                      placeholder="Document title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Description</label>
                    <textarea
                      value={editingDocument.description || ''}
                      onChange={(e) => setEditingDocument({ ...editingDocument, description: e.target.value })}
                      rows={2}
                      className={`${inputClass} resize-y`}
                      placeholder="Brief description (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Category</label>
                    <select
                      value={editingDocument.category_id || ''}
                      onChange={(e) => setEditingDocument({ ...editingDocument, category_id: e.target.value })}
                      className={inputClass}
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* File upload area */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">File</label>
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
                          <span className="text-sm font-medium text-[var(--color-pearl)]">{selectedFile.name}</span>
                          <span className="text-xs text-[var(--color-wave)]">{formatFileSize(selectedFile.size)} &middot; Click to replace</span>
                        </>
                      ) : editingDocument.id && editingDocument.file_name ? (
                        <>
                          <FileText className="w-8 h-8 text-[var(--color-surf)]" />
                          <span className="text-sm font-medium text-[var(--color-pearl)]">{editingDocument.file_name}</span>
                          <span className="text-xs text-[var(--color-wave)]">{formatFileSize(editingDocument.file_size || 0)} &middot; Click to replace</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[var(--color-wave)]" />
                          <span className="text-sm text-[var(--color-mist)]">Click to select a file</span>
                          <span className="text-xs text-[var(--color-wave)]">PDF, DOCX, XLSX, or any document type</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                    <select
                      value={editingDocument.status || 'published'}
                      onChange={(e) => setEditingDocument({ ...editingDocument, status: e.target.value as Document['status'] })}
                      className={inputClass}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button onClick={handleSaveDocument} disabled={saving} className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {saving ? (selectedFile ? 'Uploading...' : 'Saving...') : 'Save Document'}
                    </button>
                    <button onClick={() => { setEditingDocument(null); setSelectedFile(null); }} className="btn-secondary !px-6 !py-2.5 text-sm">
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
