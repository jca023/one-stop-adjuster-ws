# Drag-to-Reorder + Video Categories + Bulk Move Design

**Goal:** Replace manual sort_order number inputs with drag-to-reorder across all admin lists, add category grouping to training videos (mirroring documents), and let Todd bulk-move items between categories.

**Architecture:** @dnd-kit/sortable for drag-to-reorder, new `video_categories` table mirroring `document_categories`, checkbox selection with floating action bar for bulk category moves.

**Tech Stack:** @dnd-kit/core + @dnd-kit/sortable, React 19, TypeScript, Supabase, Tailwind CSS, Framer Motion, Lucide React

---

## 1. Database Changes

### New table: `video_categories`
Mirrors `document_categories` exactly:
- `id` uuid PK
- `name` text NOT NULL
- `sort_order` integer NOT NULL DEFAULT 0
- `status` text NOT NULL DEFAULT 'published' CHECK ('draft', 'published')
- `created_at` timestamptz DEFAULT now()

### Modify `training_videos`
- Add `category_id` uuid FK referencing `video_categories(id)`
- Existing videos assigned to seed categories (see Section 5)

### No changes to
- `document_categories`, `documents`, `training_events`

---

## 2. Drag-to-Reorder (All Four Lists)

### Library: @dnd-kit/sortable
- ~12KB gzipped, purpose-built for React sortable lists
- Keyboard accessible (Tab to focus handle, Space to pick up, Arrow keys to move, Space to drop)
- Smooth CSS transform animations

### UX Pattern
- Each list item gets a **GripVertical** drag handle icon on the left side
- Grab handle, drag up/down, drop to reorder
- On drop: batch-update all `sort_order` values (1, 2, 3...) for the reordered list
- Success toast: "Order saved"
- On save failure: list snaps back to previous order with error toast

### Discoverability
- GripVertical icon (universally recognized drag affordance)
- Tooltip on hover: "Drag to reorder"
- Brief instruction text above each list: "Drag items to reorder" (subtle, muted color)
- Cursor changes to `grab` on hover, `grabbing` while dragging

### Four draggable lists
1. **Document categories** (AdminDocumentsPage, Categories tab)
2. **Documents** (AdminDocumentsPage, Documents tab — within filtered view)
3. **Video categories** (AdminTrainingPage, new Categories tab)
4. **Videos** (AdminTrainingPage, Videos tab — within filtered view)

### Removed
- Sort_order number input removed from all modal editors
- Sort_order `#N` badge removed from list items (position is now implicit from visual order)
- New items default to last position (max sort_order + 1)

---

## 3. Bulk Move Between Categories

### Scope
- Documents (AdminDocumentsPage, Documents tab)
- Videos (AdminTrainingPage, Videos tab)
- NOT categories (categories only reorder via drag)

### UX Pattern
- **Checkbox** on each list item (left side, before drag handle)
- Always visible, no hidden mode to discover
- When 1+ items checked: **floating action bar** slides up from bottom of list
  - Left: "**N selected**" count
  - Center: **"Move to..."** button → dropdown of available categories
  - Right: **"Deselect all"** link
- Pick category → all selected items move, sort_order recalculates in target category, success toast
- Action bar slides away when selection is cleared

### Constraints
- Can't move items to a draft category (only published categories shown in dropdown)
- After move, items appear at the end of the target category's list

---

## 4. Video Categories (AdminTrainingPage)

### Admin Changes
- Add third sub-tab: **"Categories"** (FolderOpen icon) alongside "Calendar Events" (CalendarDays) and "Training Videos" (Play)
- Tab order: Categories | Calendar Events | Training Videos
- Categories tab: identical UX to AdminDocumentsPage categories (create/edit/delete + drag-to-reorder)
- Delete protection: can't delete category that has videos
- Videos tab: add category filter dropdown (like documents already have)
- Videos tab: add checkboxes + bulk move action bar

### Public ResourcesPage Changes
- Training tab: group videos by category heading (just like Documentation tab groups docs by category)
- Fetch `video_categories` ordered by `sort_order ASC`
- Fetch `training_videos` ordered by `sort_order ASC`
- Each category heading renders, then its videos underneath
- Empty categories (published but no published videos) don't render

---

## 5. Seed Data — Video Categories

Group the 12 existing videos into 3 categories:

**Getting Started** (sort_order: 1)
- Getting Started
- Getting Started w/ OSA
- Simple Start
- The Foundation

**Claims Process** (sort_order: 2)
- The Process
- Learning the Flow
- Full Cycle
- Cycling Through a Claim
- Finishing the Claim
- Closing the Claim

**Advanced Topics** (sort_order: 3)
- Deep Learning
- Integrating - Inspection Tools

Todd can rename, reorganize, or create new categories from the admin panel.

---

## 6. TypeScript Interfaces

### New
```typescript
export interface VideoCategory {
  id: string;
  name: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}
```

### Modified
```typescript
export interface TrainingVideo {
  // ... existing fields ...
  category_id: string; // NEW — FK to video_categories
}
```

---

## 7. Summary of Files Affected

### New
- `supabase/migrations/006_create_video_categories.sql`

### Modified
- `package.json` — add @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- `src/lib/supabase.ts` — add VideoCategory interface, update TrainingVideo
- `src/pages/admin/AdminDocumentsPage.tsx` — add drag-to-reorder + checkboxes/bulk move
- `src/pages/admin/AdminTrainingPage.tsx` — add Categories tab, drag-to-reorder, checkboxes/bulk move, category filter
- `src/pages/ResourcesPage.tsx` — group videos by category
