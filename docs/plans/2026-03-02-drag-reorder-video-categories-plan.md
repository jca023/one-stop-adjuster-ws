# Drag-to-Reorder + Video Categories + Bulk Move Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use /frontend-design skill for all UI/UX work.

**Goal:** Replace manual sort_order number inputs with intuitive drag-to-reorder across all admin lists, add category grouping to training videos, and let Todd bulk-move items between categories via checkboxes.

**Architecture:** @dnd-kit/sortable for drag-to-reorder on four admin lists (document categories, documents, video categories, videos). New `video_categories` Supabase table mirrors `document_categories`. Checkbox selection with floating action bar for bulk category moves. Public ResourcesPage groups videos by category.

**Tech Stack:** @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities, React 19, TypeScript, Supabase (project `ewyfhzqyglermdlbvyty`), Tailwind CSS 4, Framer Motion, Lucide React

---

### Task 1: Install Dependencies & Create Feature Branch

**Step 1: Create feature branch**

```bash
git checkout master
git pull
git checkout -b feat/drag-reorder-video-categories
```

**Step 2: Install @dnd-kit packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities"
```

---

### Task 2: Database Migration — Video Categories + Update Training Videos

**Files:**
- Create: `supabase/migrations/006_create_video_categories.sql`

**Step 1: Write the migration file**

```sql
-- Video categories (mirrors document_categories)
CREATE TABLE public.video_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

-- Add category_id to training_videos
ALTER TABLE public.training_videos
  ADD COLUMN category_id uuid REFERENCES public.video_categories(id);

-- RLS (dev — open access, will lock down before launch)
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for video_categories (dev)" ON public.video_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Seed 3 categories
INSERT INTO public.video_categories (id, name, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Getting Started', 1),
  ('10000000-0000-0000-0000-000000000002', 'Claims Process', 2),
  ('10000000-0000-0000-0000-000000000003', 'Advanced Topics', 3);

-- Assign existing videos to categories by title
-- Getting Started category
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000001'
  WHERE title IN ('Getting Started', 'Getting Started w/ OSA', 'Simple Start', 'The Foundation');

-- Claims Process category
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000002'
  WHERE title IN ('The Process', 'Learning the Flow', 'Full Cycle', 'Cycling Through a Claim', 'Finishing the Claim', 'Closing the Claim');

-- Advanced Topics category
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000003'
  WHERE title IN ('Deep Learning', 'Integrating - Inspection Tools');

-- Any remaining videos without a category get assigned to "Getting Started"
UPDATE public.training_videos SET category_id = '10000000-0000-0000-0000-000000000001'
  WHERE category_id IS NULL;

-- Now make category_id NOT NULL
ALTER TABLE public.training_videos ALTER COLUMN category_id SET NOT NULL;
```

**Step 2: Apply migration via Supabase MCP**

Use `apply_migration` with project_id `ewyfhzqyglermdlbvyty`, name `create_video_categories`.

**Step 3: Verify tables exist**

Run via `execute_sql`:
```sql
SELECT * FROM public.video_categories ORDER BY sort_order;
SELECT id, title, category_id FROM public.training_videos ORDER BY sort_order;
```
Expected: 3 categories, 12 videos all with non-null category_id.

**Step 4: Commit**

```bash
git add supabase/migrations/006_create_video_categories.sql
git commit -m "feat: add video_categories table and assign existing videos to categories"
```

---

### Task 3: Update TypeScript Interfaces

**Files:**
- Modify: `src/lib/supabase.ts`

**Step 1: Add VideoCategory interface and update TrainingVideo**

After the existing `TrainingVideo` interface (line 48-56), add:

```typescript
export interface VideoCategory {
  id: string;
  name: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}
```

Update the existing `TrainingVideo` interface to add `category_id`:

```typescript
export interface TrainingVideo {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category_id: string;          // NEW
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}
```

**Step 2: Verify build**

```bash
npm run build
```

Fix any type errors that surface from the new `category_id` field (AdminTrainingPage's `emptyVideo` will need `category_id: ''` added).

**Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add VideoCategory interface and category_id to TrainingVideo"
```

---

### Task 4: AdminDocumentsPage — Drag-to-Reorder + Bulk Move

**Files:**
- Modify: `src/pages/admin/AdminDocumentsPage.tsx`

**Context:** This is a 688-line admin page with two tabs: Categories and Documents. We need to:
1. Add drag-to-reorder to both the categories list (lines 382-416) and documents list (lines 435-471)
2. Add checkboxes + floating bulk move action bar to the documents list
3. Remove sort_order number input from both modal editors (category modal lines 509-518, document modal lines 647-656)
4. Remove `#{sort_order}` badge from category list (line 392-394)

**Use /frontend-design skill for this entire task.**

**Step 1: Add dnd-kit imports at the top of the file**

```typescript
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
```

Also add `Check` and `ArrowRightLeft` from lucide-react for checkboxes and bulk move.

**Step 2: Add drag sensors (inside the component, before state declarations)**

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
);
```

**Step 3: Add `handleCategoryReorder` function**

After the existing CRUD functions, add:

```typescript
async function handleCategoryReorder(event: DragEndEvent): Promise<void> {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = categories.findIndex((c) => c.id === active.id);
  const newIndex = categories.findIndex((c) => c.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  // Optimistic update
  const reordered = [...categories];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);
  setCategories(reordered);

  // Batch update sort_order values
  const updates = reordered.map((cat, i) => ({ id: cat.id, sort_order: i + 1 }));
  const promises = updates.map(({ id, sort_order }) =>
    supabase.from('document_categories').update({ sort_order }).eq('id', id)
  );
  const results = await Promise.all(promises);
  const failed = results.some((r) => r.error);

  if (failed) {
    setFeedback({ type: 'error', message: 'Failed to save order. Refreshing...' });
    fetchCategories();
  } else {
    setFeedback({ type: 'success', message: 'Order saved.' });
  }
}
```

**Step 4: Add `handleDocumentReorder` function**

Same pattern but for documents. Important: when filtered by category, only reorder within that category's documents. When "All" is selected, reorder the full list.

```typescript
async function handleDocumentReorder(event: DragEndEvent): Promise<void> {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const list = filterCategoryId === 'all' ? documents : documents.filter((d) => d.category_id === filterCategoryId);
  const oldIndex = list.findIndex((d) => d.id === active.id);
  const newIndex = list.findIndex((d) => d.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  const reordered = [...list];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);

  // Optimistic update: merge reordered items back into full list
  if (filterCategoryId === 'all') {
    setDocuments(reordered);
  } else {
    const others = documents.filter((d) => d.category_id !== filterCategoryId);
    setDocuments([...others, ...reordered].sort((a, b) => {
      if (a.category_id === filterCategoryId && b.category_id === filterCategoryId) {
        return reordered.indexOf(a) - reordered.indexOf(b);
      }
      return a.sort_order - b.sort_order;
    }));
  }

  // Batch save
  const updates = reordered.map((doc, i) => ({ id: doc.id, sort_order: i + 1 }));
  const promises = updates.map(({ id, sort_order }) =>
    supabase.from('documents').update({ sort_order }).eq('id', id)
  );
  const results = await Promise.all(promises);
  const failed = results.some((r) => r.error);

  if (failed) {
    setFeedback({ type: 'error', message: 'Failed to save order. Refreshing...' });
    fetchDocuments();
  } else {
    setFeedback({ type: 'success', message: 'Order saved.' });
  }
}
```

**Step 5: Add checkbox/bulk move state and handlers**

```typescript
const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

function toggleDocSelection(id: string): void {
  setSelectedDocIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

function selectAllFilteredDocs(): void {
  setSelectedDocIds(new Set(filteredDocuments.map((d) => d.id)));
}

function deselectAllDocs(): void {
  setSelectedDocIds(new Set());
}

async function handleBulkMoveDocuments(targetCategoryId: string): Promise<void> {
  if (selectedDocIds.size === 0) return;
  setSaving(true);

  const ids = Array.from(selectedDocIds);
  const promises = ids.map((id) =>
    supabase.from('documents').update({ category_id: targetCategoryId }).eq('id', id)
  );
  const results = await Promise.all(promises);
  const failed = results.some((r) => r.error);

  if (failed) {
    setFeedback({ type: 'error', message: 'Some documents failed to move.' });
  } else {
    setFeedback({ type: 'success', message: `Moved ${ids.length} document${ids.length > 1 ? 's' : ''}.` });
  }

  setSelectedDocIds(new Set());
  fetchDocuments();
  fetchCategories(); // refresh doc counts
  setSaving(false);
}
```

**Step 6: Create a SortableCategoryItem inline component**

Inside AdminDocumentsPage, before the return statement:

```typescript
function SortableCategoryItem({ cat }: { cat: DocumentCategory }): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-5 flex items-center justify-between gap-4">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[var(--color-ocean)]/20 transition-colors shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{cat.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)]">
            {docCounts[cat.id] || 0} doc{(docCounts[cat.id] || 0) !== 1 ? 's' : ''}
          </span>
          <span className={cat.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
            {cat.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => setEditingCategory(cat)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors" title="Edit">
          <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
        </button>
        <button onClick={() => handleDeleteCategory(cat)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
```

**Step 7: Create a SortableDocumentItem inline component**

Similar pattern but with checkbox:

```typescript
function SortableDocumentItem({ doc }: { doc: Document }): React.JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: doc.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  const isSelected = selectedDocIds.has(doc.id);

  return (
    <div ref={setNodeRef} style={style} className="p-5 flex items-center justify-between gap-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleDocSelection(doc.id)}
        className="shrink-0 w-4 h-4 rounded border-[var(--color-ocean)]/50 accent-[var(--color-gold)]"
      />
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[var(--color-ocean)]/20 transition-colors shrink-0"
        title="Drag to reorder"
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
          <span className="text-[var(--color-surf)]">{getCategoryName(doc.category_id)}</span>
          <span className={doc.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
            {doc.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => openEditDocument(doc)} className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors" title="Edit">
          <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
        </button>
        <button onClick={() => handleDeleteDocument(doc)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
```

**Step 8: Replace the categories list JSX (lines 382-416)**

Replace the current categories list with DndContext + SortableContext wrapper:

```tsx
{subTab === 'categories' && !categoriesLoading && !isEditing && (
  <>
    <p className="text-xs text-[var(--color-wave)] mb-2">Drag items to reorder</p>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryReorder}>
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
          {categories.map((cat) => (
            <SortableCategoryItem key={cat.id} cat={cat} />
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
```

**Step 9: Replace the documents list JSX (lines 419-472)**

Replace with DndContext + SortableContext + floating action bar:

```tsx
{subTab === 'documents' && !documentsLoading && !isEditing && (
  <>
    {/* Category filter */}
    <div className="mb-4">
      <select
        value={filterCategoryId}
        onChange={(e) => { setFilterCategoryId(e.target.value); setSelectedDocIds(new Set()); }}
        className={`${inputClass} sm:w-64`}
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>

    <p className="text-xs text-[var(--color-wave)] mb-2">Drag items to reorder &middot; Check items to bulk move</p>

    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDocumentReorder}>
      <SortableContext items={filteredDocuments.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="glass rounded-xl overflow-hidden divide-y divide-[var(--color-ocean)]/20">
          {filteredDocuments.map((doc) => (
            <SortableDocumentItem key={doc.id} doc={doc} />
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
```

**Step 10: Remove sort_order inputs from modals**

In the category editor modal (around lines 509-518), remove the entire sort_order `<div>` block. Change the grid from `sm:grid-cols-2` to just a single Status field (no grid needed).

In the document editor modal (around lines 647-656), remove the sort_order `<div>` block. Change the grid to just Status.

**Step 11: Update `openNewDocument` and `handleSaveCategory`/`handleSaveDocument`**

In `openNewDocument` (line 282-289): change `sort_order: documents.length + 1` to compute max sort_order + 1 from existing documents:
```typescript
sort_order: documents.length > 0 ? Math.max(...documents.map((d) => d.sort_order)) + 1 : 1,
```

In the header button for new category (line 317): same pattern:
```typescript
sort_order: categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 1,
```

**Step 12: Verify build**

```bash
npm run build
```

**Step 13: Commit**

```bash
git add src/pages/admin/AdminDocumentsPage.tsx
git commit -m "feat: add drag-to-reorder and bulk move to AdminDocumentsPage"
```

---

### Task 5: AdminTrainingPage — Categories Tab + Drag-to-Reorder + Bulk Move

**Files:**
- Modify: `src/pages/admin/AdminTrainingPage.tsx`

**Context:** This is a 640-line admin page with two tabs: Calendar Events and Training Videos. We need to:
1. Add a third sub-tab: "Categories" (FolderOpen icon)
2. Add drag-to-reorder to the categories list (new) and the videos list (lines 316-352)
3. Add checkboxes + floating bulk move action bar to the videos list
4. Add category filter dropdown to videos tab
5. Remove sort_order number input from video modal (lines 599-608)
6. Remove `#{sort_order}` badge from video list (lines 322-324)
7. Add `category_id` to video CRUD (emptyVideo, handleSaveVideo, video modal editor)

**Use /frontend-design skill for this entire task.**

**Step 1: Add dnd-kit imports**

Same imports as AdminDocumentsPage:

```typescript
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FolderOpen } from 'lucide-react';
```

Also add `Check` from lucide-react for checkboxes. Add `VideoCategory` to the type import from supabase.

**Step 2: Update subTab type and state**

Change the subTab type:
```typescript
const [subTab, setSubTab] = useState<'categories' | 'events' | 'videos'>('categories');
```

**Step 3: Add video categories state**

```typescript
const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
const [videoCategoriesLoading, setVideoCategoriesLoading] = useState(true);
const [editingVideoCategory, setEditingVideoCategory] = useState<Partial<VideoCategory> | null>(null);
const [videoCounts, setVideoCounts] = useState<Record<string, number>>({});
const [filterVideoCategoryId, setFilterVideoCategoryId] = useState<string>('all');
const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
```

**Step 4: Add fetchVideoCategories function**

```typescript
async function fetchVideoCategories(): Promise<void> {
  setVideoCategoriesLoading(true);
  const { data, error } = await supabase
    .from('video_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (!error && data) setVideoCategories(data as VideoCategory[]);
  setVideoCategoriesLoading(false);
}
```

Update `fetchVideos` to also compute `videoCounts`:
```typescript
async function fetchVideos(): Promise<void> {
  setVideosLoading(true);
  const { data, error } = await supabase
    .from('training_videos')
    .select('*')
    .order('sort_order', { ascending: true });
  if (!error && data) {
    const vids = data as TrainingVideo[];
    setVideos(vids);
    const counts: Record<string, number> = {};
    vids.forEach((v) => { counts[v.category_id] = (counts[v.category_id] || 0) + 1; });
    setVideoCounts(counts);
  }
  setVideosLoading(false);
}
```

Add `fetchVideoCategories()` to the initial useEffect.

**Step 5: Add video category CRUD functions**

Follow the exact same pattern as AdminDocumentsPage's category CRUD (handleSaveVideoCategory, handleDeleteVideoCategory) but targeting `video_categories` table and using `videoCounts` for delete protection.

**Step 6: Update `emptyVideo` to include `category_id`**

```typescript
const emptyVideo: Partial<TrainingVideo> = {
  title: '',
  url: '',
  description: '',
  category_id: '',
  sort_order: 0,
  status: 'published',
};
```

**Step 7: Update `handleSaveVideo` to include `category_id`**

Add to payload:
```typescript
category_id: editingVideo.category_id,
```

Add validation:
```typescript
if (!editingVideo.category_id) {
  setFeedback({ type: 'error', message: 'Title, URL, and category are required.' });
  return;
}
```

**Step 8: Add drag sensors, reorder handlers, checkbox/bulk move handlers**

Same patterns as AdminDocumentsPage Task 4 but for `videoCategories` and `videos`:
- `handleVideoCategoryReorder` — reorders video_categories
- `handleVideoReorder` — reorders training_videos (respects category filter)
- `toggleVideoSelection`, `selectAllFilteredVideos`, `deselectAllVideos`, `handleBulkMoveVideos`

**Step 9: Add SortableVideoCategoryItem and SortableVideoItem inline components**

Same pattern as AdminDocumentsPage's sortable items.

**Step 10: Add "Categories" sub-tab button**

In the sub-tabs section (lines 222-245), add a Categories button FIRST:

```tsx
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
```

Update the header button to handle three tabs:
```typescript
onClick={() => {
  if (subTab === 'categories') setEditingVideoCategory({ name: '', sort_order: videoCategories.length > 0 ? Math.max(...videoCategories.map(c => c.sort_order)) + 1 : 1, status: 'published' });
  else if (subTab === 'events') setEditingEvent({ ...emptyEvent });
  else setEditingVideo({ ...emptyVideo, sort_order: videos.length > 0 ? Math.max(...videos.map(v => v.sort_order)) + 1 : 1, category_id: videoCategories.length > 0 ? videoCategories[0].id : '' });
}}
```

Button label:
```typescript
{subTab === 'categories' ? 'New Category' : subTab === 'events' ? 'New Event' : 'Add Video'}
```

**Step 11: Add Categories list JSX**

Same DndContext + SortableContext pattern as AdminDocumentsPage categories.

**Step 12: Update Videos list JSX**

Add DndContext + SortableContext, category filter dropdown, checkboxes, and floating bulk move action bar. Same pattern as AdminDocumentsPage documents list.

**Step 13: Add category editor modal and update video editor modal**

Category editor modal: same pattern as AdminDocumentsPage. No sort_order input.

Video editor modal: add category dropdown (same as document modal's category select), remove sort_order input.

**Step 14: Update loading and isEditing logic**

```typescript
const loading = subTab === 'categories' ? videoCategoriesLoading : subTab === 'events' ? eventsLoading : videosLoading;
const isEditing = editingVideoCategory || editingEvent || editingVideo;
```

**Step 15: Add filtered videos computed variable**

```typescript
const filteredVideos = filterVideoCategoryId === 'all'
  ? videos
  : videos.filter((v) => v.category_id === filterVideoCategoryId);

function getVideoCategoryName(categoryId: string): string {
  return videoCategories.find((c) => c.id === categoryId)?.name || 'Unknown';
}
```

**Step 16: Verify build**

```bash
npm run build
```

**Step 17: Commit**

```bash
git add src/pages/admin/AdminTrainingPage.tsx
git commit -m "feat: add video categories, drag-to-reorder, and bulk move to AdminTrainingPage"
```

---

### Task 6: ResourcesPage — Group Videos by Category

**Files:**
- Modify: `src/pages/ResourcesPage.tsx`

**Step 1: Import VideoCategory type**

Update the type import line:
```typescript
import type { Post, TrainingVideo, DocumentCategory, Document, VideoCategory } from '../lib/supabase';
```

**Step 2: Add video categories state**

```typescript
const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
```

**Step 3: Update the training tab useEffect (lines 59-70)**

Fetch video_categories alongside training_videos:

```typescript
useEffect(() => {
  if (activeTab !== 'training') return;
  async function fetchTrainingData(): Promise<void> {
    const [catRes, vidRes] = await Promise.all([
      supabase
        .from('video_categories')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
      supabase
        .from('training_videos')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    ]);
    if (catRes.data) setVideoCategories(catRes.data as VideoCategory[]);
    if (vidRes.data) setTrainingVideos(vidRes.data as TrainingVideo[]);
  }
  fetchTrainingData();
}, [activeTab]);
```

**Step 4: Replace the "Consolidated Training Videos" collapsible card (lines 167-217)**

Replace the single expandable card with category-grouped display. Each category gets its own expandable card:

```tsx
{/* Training Videos by Category */}
{videoCategories.map((cat) => {
  const catVideos = trainingVideos.filter((v) => v.category_id === cat.id);
  if (catVideos.length === 0) return null;
  return (
    <div key={cat.id} className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpandedCategoryId(expandedCategoryId === cat.id ? null : cat.id)}
        className="w-full px-5 py-5 flex items-center justify-between hover:bg-[var(--color-ocean)]/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-[var(--color-surf)]" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg">{cat.name}</h3>
            <p className="text-[var(--color-mist)] text-sm">
              {catVideos.length} video{catVideos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {expandedCategoryId === cat.id
          ? <ChevronUp className="w-5 h-5 text-[var(--color-wave)]" />
          : <ChevronDown className="w-5 h-5 text-[var(--color-wave)]" />}
      </button>

      <AnimatePresence>
        {expandedCategoryId === cat.id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
              {catVideos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl p-4 flex items-center gap-3 group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors shrink-0">
                    <Video className="w-4 h-4 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                  </div>
                  <span className="font-medium text-sm flex-1">{video.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--color-wave)] group-hover:text-[var(--color-gold)] transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
})}
```

**Step 5: Replace `videosExpanded` state with `expandedCategoryId`**

```typescript
// Replace:
const [videosExpanded, setVideosExpanded] = useState(false);
// With:
const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
```

**Step 6: Verify build**

```bash
npm run build
```

**Step 7: Commit**

```bash
git add src/pages/ResourcesPage.tsx
git commit -m "feat: group training videos by category on public ResourcesPage"
```

---

### Task 7: Browser Test — Full Walkthrough

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test AdminDocumentsPage**

Navigate to `http://localhost:5173/admin/documents`:
- **Categories tab:**
  - Verify drag handles visible on each category
  - Drag a category up/down, verify "Order saved" toast
  - Verify new category modal has no sort_order input
  - Create a new category, verify it appears at the bottom
- **Documents tab:**
  - Verify drag handles and checkboxes visible
  - Drag a document up/down, verify "Order saved" toast
  - Check 2-3 documents, verify floating action bar appears
  - Use "Move to..." dropdown to move to a different category
  - Verify "Moved N documents" toast and list refreshes
  - Click "Deselect all", verify action bar disappears
  - Verify new document modal has no sort_order input

**Step 3: Test AdminTrainingPage**

Navigate to `http://localhost:5173/admin/training`:
- **Categories tab:**
  - Verify 3 seeded categories: Getting Started, Claims Process, Advanced Topics
  - Verify video count badges (4, 6, 2)
  - Drag to reorder categories
  - Create/edit/delete a test category
- **Calendar Events tab:**
  - Verify events still work as before (no changes here)
- **Training Videos tab:**
  - Verify category filter dropdown
  - Filter by "Getting Started" — verify 4 videos shown
  - Drag videos to reorder within category
  - Check videos, bulk move to different category
  - Verify video modal now has category dropdown + no sort_order input
  - Add a new video, verify category selection works

**Step 4: Test public ResourcesPage**

Navigate to `http://localhost:5173/resources`:
- **Documentation tab:** verify category-grouped docs still work
- **Training tab:**
  - Verify video categories appear as separate expandable cards
  - Each shows category name + video count
  - Click to expand, verify correct videos listed
  - Click video links, verify they open

**Step 5: Test admin dashboard**

Navigate to `http://localhost:5173/admin`:
- Verify all cards show correct counts and link to their pages

---

### Task 8: Create Feature Branch, PR, and Deploy

**Step 1: Push and create PR**

```bash
git push -u origin feat/drag-reorder-video-categories
```

```bash
gh pr create --title "Add drag-to-reorder, video categories, and bulk move" --body "## Summary
- Drag-to-reorder via @dnd-kit/sortable on all four admin lists (document categories, documents, video categories, videos)
- New video_categories table + Admin Training 'Categories' sub-tab
- 12 existing videos categorized into 3 groups (Getting Started, Claims Process, Advanced Topics)
- Checkbox selection + floating 'Move to...' action bar for bulk moving docs/videos between categories
- Public ResourcesPage Training tab groups videos by category (expandable cards)
- Removed manual sort_order number inputs from all modals

## Test plan
- [ ] Admin Documents: Drag categories, drag documents, bulk move documents
- [ ] Admin Training: Categories tab CRUD, drag categories, drag videos, bulk move videos
- [ ] Admin Training: Video modal has category dropdown, no sort_order input
- [ ] Public Resources: Documentation tab unchanged, Training tab groups videos by category
- [ ] Admin Dashboard: All cards show correct counts"
```

**Step 2: Merge and deploy**

```bash
gh pr merge --merge --delete-branch
git checkout master && git pull
railway up
```

**Step 3: Verify live site**

Check `https://one-stop-adjuster-ws-production.up.railway.app/resources` and `/admin/documents` and `/admin/training`.
