# Document Upload CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hardcoded Documentation tab on the Resources page with a CMS that lets Todd manage document categories and upload files from the admin panel.

**Architecture:** Two Supabase tables (`document_categories` + `documents`) with Supabase Storage bucket for file hosting. Admin page follows existing AdminTrainingPage patterns (two-tab layout, modal editors, feedback banners). Public ResourcesPage fetches from DB instead of hardcoded array.

**Tech Stack:** React 19, TypeScript, Supabase (Postgres + Storage), Tailwind CSS, Framer Motion, Lucide React

---

### Task 1: Create Supabase Storage Bucket

**Why:** Files need somewhere to live before we can upload them.

**Step 1: Create the `documents` storage bucket via Supabase SQL**

Run this via the Supabase MCP `execute_sql` tool (project ID: `ewyfhzqyglermdlbvyty`):

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

CREATE POLICY "Allow public read on documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow all uploads to documents (dev)" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow all updates to documents (dev)" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents');

CREATE POLICY "Allow all deletes from documents (dev)" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents');
```

**Step 2: Verify bucket exists**

Run via `execute_sql`:
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'documents';
```
Expected: 1 row with `public = true`.

---

### Task 2: Database Migration — Create Document Tables

**Files:**
- Create: `supabase/migrations/005_create_document_tables.sql`

**Step 1: Write the migration file**

```sql
-- Document categories
CREATE TABLE public.document_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.document_categories(id),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS (dev — open access, will lock down before launch)
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for document_categories (dev)" ON public.document_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for documents (dev)" ON public.documents
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default category with the 3 existing docs
INSERT INTO public.document_categories (id, name, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Documentation', 1);

INSERT INTO public.documents (category_id, title, description, file_url, file_name, file_size, file_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Getting Started Guide', 'Complete walkthrough for new users', 'https://www.one-stop-adjuster.com/s/Getting-Started-Guide-Verisk2.pdf', 'Getting-Started-Guide-Verisk2.pdf', 0, 'pdf', 1),
  ('00000000-0000-0000-0000-000000000001', 'OSA Pocket Guide', 'Quick reference guide for field adjusters', 'https://www.one-stop-adjuster.com/s/OSA-Pocket-Guide-9-25-2025.pdf', 'OSA-Pocket-Guide-9-25-2025.pdf', 0, 'pdf', 2),
  ('00000000-0000-0000-0000-000000000001', 'OSA Process', 'End-to-end claims process documentation', 'https://www.one-stop-adjuster.com/s/OSA-Process.docx', 'OSA-Process.docx', 0, 'docx', 3);
```

**Step 2: Apply migration via Supabase MCP**

Use `apply_migration` with project_id `ewyfhzqyglermdlbvyty`, name `create_document_tables`.

**Step 3: Verify tables exist**

Run via `execute_sql`:
```sql
SELECT * FROM public.document_categories;
SELECT * FROM public.documents;
```
Expected: 1 category ("Documentation"), 3 documents.

**Step 4: Commit**

```bash
git add supabase/migrations/005_create_document_tables.sql
git commit -m "feat: add document_categories and documents tables with seed data"
```

---

### Task 3: Add TypeScript Interfaces

**Files:**
- Modify: `src/lib/supabase.ts`

**Step 1: Add interfaces after existing TrainingVideo interface**

```typescript
export interface DocumentCategory {
  id: string;
  name: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
}

export interface Document {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  sort_order: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}
```

**Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add DocumentCategory and Document interfaces"
```

---

### Task 4: Build AdminDocumentsPage

**Files:**
- Create: `src/pages/admin/AdminDocumentsPage.tsx`

**Step 1: Build the admin page**

Follow the exact pattern from `AdminTrainingPage.tsx`:
- Two sub-tabs: "Categories" (FolderOpen icon) | "Documents" (FileText icon)
- Same header with back arrow link to `/admin` and dynamic "New Category" / "Upload Document" button
- Same `inputClass` constant, feedback banner, loading skeleton
- Same modal pattern for editors

**Categories tab:**
- List: name, doc count badge, sort_order number, status, edit/delete buttons
- Modal editor: name input, sort_order number, status select (published/draft)
- Delete: confirm dialog, only allow if no documents reference it

**Documents tab:**
- Category filter dropdown at top of list (defaults to "All")
- List: title, file_type badge (PDF/DOCX/etc), formatted file_size, category name, status, edit/delete buttons
- Modal editor fields:
  - Title (text input, required)
  - Description (textarea, optional)
  - Category (select dropdown, required, populated from categories)
  - File upload area: clickable div with Upload icon, shows selected file name + size
    - Uses hidden `<input type="file">` triggered by clicking the div
    - On file select: upload to Supabase Storage `documents` bucket
    - Path: `{uuid}_{filename}` to avoid collisions
    - Get public URL via `supabase.storage.from('documents').getPublicUrl(path)`
    - Show upload progress feedback
  - Sort order (number input)
  - Status (select: published/draft)
- Delete: confirm dialog, also delete file from Storage bucket

**File size display helper:**
```typescript
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

**File type extraction:**
```typescript
function getFileType(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}
```

**Storage upload pattern:**
```typescript
async function uploadFile(file: File): Promise<{ url: string; path: string }> {
  const path = `${crypto.randomUUID()}_${file.name}`;
  const { error } = await supabase.storage.from('documents').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('documents').getPublicUrl(path);
  return { url: data.publicUrl, path };
}
```

**Storage delete pattern:**
```typescript
async function deleteFile(fileUrl: string): Promise<void> {
  // Extract path from URL: everything after /documents/
  const path = fileUrl.split('/documents/').pop();
  if (path) {
    await supabase.storage.from('documents').remove([path]);
  }
}
```

**Step 2: Verify build compiles**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/pages/admin/AdminDocumentsPage.tsx
git commit -m "feat: add AdminDocumentsPage with file upload CMS"
```

---

### Task 5: Wire Up Routes and Dashboard

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/admin/AdminDashboardPage.tsx`

**Step 1: Add route in App.tsx**

Add import:
```typescript
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
```

Add route after the training route:
```tsx
<Route path="/admin/documents" element={<AdminDocumentsPage />} />
```

**Step 2: Add dashboard card in AdminDashboardPage.tsx**

Add import for `FolderOpen` from lucide-react (add to existing import).

Add `documentsCount` state, fetch it in the `useEffect`:
```typescript
const [documentsCount, setDocumentsCount] = useState<number | null>(null);
```

In `fetchCounts`, add:
```typescript
supabase.from('documents').select('id', { count: 'exact', head: true })
```

Add card to the cards array:
```typescript
{
  title: 'Documents',
  count: documentsCount,
  icon: FolderOpen,
  href: '/admin/documents',
  description: 'Upload and organize downloadable documents',
  publicPath: '/resources (Documentation tab)',
},
```

**Step 3: Commit**

```bash
git add src/App.tsx src/pages/admin/AdminDashboardPage.tsx
git commit -m "feat: add Documents route and dashboard card"
```

---

### Task 6: Update ResourcesPage — Replace Hardcoded Docs

**Files:**
- Modify: `src/pages/ResourcesPage.tsx`

**Step 1: Replace the hardcoded documents array with Supabase queries**

Remove the hardcoded `documents` array (lines 16-20).

Add imports:
```typescript
import type { Post, TrainingVideo, DocumentCategory, Document } from '../lib/supabase';
```

Add state:
```typescript
const [categories, setCategories] = useState<DocumentCategory[]>([]);
const [documents, setDocuments] = useState<Document[]>([]);
```

Add fetch in a `useEffect` that runs when `activeTab === 'docs'`:
```typescript
useEffect(() => {
  if (activeTab !== 'docs') return;
  async function fetchDocs(): Promise<void> {
    const [catRes, docRes] = await Promise.all([
      supabase
        .from('document_categories')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
      supabase
        .from('documents')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    ]);
    if (catRes.data) setCategories(catRes.data as DocumentCategory[]);
    if (docRes.data) setDocuments(docRes.data as Document[]);
  }
  fetchDocs();
}, [activeTab]);
```

**Step 2: Update the Documentation tab JSX**

Replace the current `{activeTab === 'docs' && ...}` block. For each published category, render the category name as a heading, then its documents as cards underneath:

```tsx
{activeTab === 'docs' && (
  <motion.div
    className="max-w-3xl mx-auto space-y-8"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {categories.map((cat) => {
      const catDocs = documents.filter((d) => d.category_id === cat.id);
      if (catDocs.length === 0) return null;
      return (
        <div key={cat.id}>
          <h3 className="text-lg font-semibold text-[var(--color-pearl)] mb-3">{cat.name}</h3>
          <div className="space-y-3">
            {catDocs.map((doc) => (
              <motion.a
                key={doc.id}
                variants={itemVariants}
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-5 flex items-center justify-between group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                    <Download className="w-5 h-5 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    {doc.description && <p className="text-[var(--color-mist)] text-sm">{doc.description}</p>}
                  </div>
                </div>
                <span className="text-xs text-[var(--color-wave)] bg-[var(--color-ocean)]/10 px-2 py-1 rounded uppercase">{doc.file_type}</span>
              </motion.a>
            ))}
          </div>
        </div>
      );
    })}
    {categories.length === 0 && (
      <div className="glass rounded-2xl p-8 text-center">
        <FileText className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
        <p className="text-[var(--color-mist)]">Documents coming soon.</p>
      </div>
    )}
  </motion.div>
)}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/pages/ResourcesPage.tsx
git commit -m "feat: replace hardcoded docs with Supabase-driven document CMS"
```

---

### Task 7: Browser Test — Full Walkthrough

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test admin panel**

Navigate to `http://localhost:5173/admin/documents`:
- Verify Categories tab shows "Documentation" with 3 documents
- Add a new category (e.g. "Test Category")
- Switch to Documents tab, upload a small test file to the new category
- Verify file appears in the list with correct type badge and size
- Edit the document, change title, verify save works
- Delete the test document, verify file removed from list
- Delete the test category

**Step 3: Test public page**

Navigate to `http://localhost:5173/resources`:
- Verify Documentation tab shows "Documentation" heading with the 3 seeded docs
- Click each doc link, verify it opens/downloads correctly

**Step 4: Test admin dashboard**

Navigate to `http://localhost:5173/admin`:
- Verify Documents card shows correct count
- Click card, verify it navigates to `/admin/documents`

---

### Task 8: Create Feature Branch, PR, and Deploy

**Step 1: Create feature branch and push**

All commits should have been made on a feature branch `feat/document-upload-cms`. If not, create it now and push.

**Step 2: Create PR**

```bash
gh pr create --title "Add document upload CMS" --body "## Summary
- New admin page at /admin/documents for managing document categories and file uploads
- Supabase Storage bucket for file hosting
- Database tables: document_categories + documents
- ResourcesPage Documentation tab now pulls from CMS instead of hardcoded list
- Admin dashboard card for Documents

## Test plan
- [ ] Admin: Create/edit/delete categories
- [ ] Admin: Upload/edit/delete documents with file upload
- [ ] Public: Documentation tab shows categories + docs from DB
- [ ] Admin dashboard: Documents card shows correct count"
```

**Step 3: Merge and deploy**

```bash
gh pr merge --merge --delete-branch
git checkout master && git pull
railway up
```

**Step 4: Verify live site**

Check `https://one-stop-adjuster-ws-production.up.railway.app/resources` and `/admin/documents`.
