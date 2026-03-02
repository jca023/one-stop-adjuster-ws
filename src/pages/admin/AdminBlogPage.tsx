import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft, GripVertical, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
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
import type { Post, BlogCategory } from '../../lib/supabase';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors';

const emptyCategory: Partial<BlogCategory> = {
  name: '',
  sort_order: 0,
  status: 'published',
};

const emptyPost: Partial<Post> = {
  title: '',
  content: '',
  excerpt: '',
  author: 'Todd Isenburg',
  category: '',
  category_id: '',
  status: 'published',
  read_time: '',
};

/* ---------- ID helpers ---------- */

function toCatSortId(catId: string): string {
  return `cat-${catId}`;
}

function fromCatSortId(sortId: UniqueIdentifier): string {
  return String(sortId).replace(/^cat-/, '');
}

/* ---------- Sortable category group ---------- */

interface SortableCategoryGroupProps {
  cat: BlogCategory;
  posts: Post[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onAddPost: () => void;
  selectedPostIds: Set<string>;
  onTogglePostSelect: (id: string) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
}

function SortableCategoryGroup({
  cat,
  posts,
  isExpanded,
  onToggleExpand,
  onEditCategory,
  onDeleteCategory,
  onAddPost,
  selectedPostIds,
  onTogglePostSelect,
  onEditPost,
  onDeletePost,
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

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      {/* Category header bar */}
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
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
          <ChevronDown
            className={`w-4 h-4 text-[var(--color-wave)] transition-transform duration-200 shrink-0 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <h3 className="font-semibold text-[var(--color-pearl)] truncate">
            {cat.name}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)] text-xs shrink-0">
            {posts.length} post{posts.length !== 1 ? 's' : ''}
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
            onClick={onAddPost}
            className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            title="Add post to this category"
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

      {/* Expandable post items */}
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
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  isSelected={selectedPostIds.has(post.id)}
                  onToggleSelect={() => onTogglePostSelect(post.id)}
                  onEdit={() => onEditPost(post)}
                  onDelete={() => onDeletePost(post)}
                />
              ))}
              {posts.length === 0 && (
                <div className="py-3 text-sm text-[var(--color-wave)] italic">
                  No posts in this category.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Post item (no drag, just checkbox + actions) ---------- */

interface PostItemProps {
  post: Post;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PostItem({
  post,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: PostItemProps): React.JSX.Element {
  return (
    <div className="glass rounded-lg px-3 py-2.5 mb-1.5 flex items-center gap-3">
      <label className="shrink-0 flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-[var(--color-ocean)]/50 bg-[var(--color-deep)] text-[var(--color-gold)] accent-[var(--color-gold)] cursor-pointer"
        />
      </label>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-[var(--color-pearl)]">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-wave)] flex-wrap">
          <span>{post.author}</span>
          {post.read_time && (
            <>
              <span className="text-[var(--color-ocean)]">&middot;</span>
              <span>{post.read_time}</span>
            </>
          )}
          <span className="text-[var(--color-ocean)]">&middot;</span>
          <span
            className={
              post.status === 'published'
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-wave)]'
            }
          >
            {post.status}
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

/* ---------- Unassigned zone ---------- */

interface UnassignedZoneProps {
  posts: Post[];
  selectedPostIds: Set<string>;
  onTogglePostSelect: (id: string) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
}

function UnassignedZone({
  posts,
  selectedPostIds,
  onTogglePostSelect,
  onEditPost,
  onDeletePost,
}: UnassignedZoneProps): React.JSX.Element {
  return (
    <div className="mb-3">
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 opacity-70">
        <h3 className="font-semibold text-[var(--color-wave)]">Unassigned</h3>
        <span className="px-2 py-0.5 rounded-full bg-[var(--color-wave)]/20 text-[var(--color-wave)] text-xs">
          {posts.length} post{posts.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="pt-1 pl-4">
        {posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            isSelected={selectedPostIds.has(post.id)}
            onToggleSelect={() => onTogglePostSelect(post.id)}
            onEdit={() => onEditPost(post)}
            onDelete={() => onDeletePost(post)}
          />
        ))}
        {posts.length === 0 && (
          <div className="py-3 text-sm text-[var(--color-wave)] italic">
            No unassigned posts.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Drag overlay preview ---------- */

function CategoryDragPreview({ cat, postCount }: { cat: BlogCategory; postCount: number }): React.JSX.Element {
  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl opacity-90 scale-[1.02] border border-[var(--color-gold)]/40">
      <GripVertical className="w-4 h-4 text-[var(--color-wave)]" />
      <h3 className="font-semibold text-[var(--color-pearl)]">{cat.name}</h3>
      <span className="px-2 py-0.5 rounded-full bg-[var(--color-surf)]/20 text-[var(--color-surf)] text-xs">
        {postCount} post{postCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function AdminBlogPage(): React.JSX.Element {
  // Data state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  // Editing state
  const [editingCategory, setEditingCategory] = useState<Partial<BlogCategory> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);

  // Selection / bulk
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // DnD state (categories only)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Expand/collapse state for categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Derived: posts grouped by category, sorted by created_at DESC
  const postsByCategory = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const cat of categories) {
      map[cat.id] = posts
        .filter((p) => p.category_id === cat.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    map['unassigned'] = posts
      .filter((p) => !p.category_id || !categories.find((c) => c.id === p.category_id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return map;
  }, [categories, posts]);

  // On first load, expand all categories
  useEffect(() => {
    if (categories.length > 0 && expandedCats.size === 0) {
      setExpandedCats(new Set(categories.map((c) => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
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
      .from('blog_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setCategories(data as BlogCategory[]);
    setLoading(false);
  }

  async function fetchPosts(): Promise<void> {
    setPostsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setPostsLoading(false);
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

  /* ---------- DnD handlers (categories only) ---------- */

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

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
      supabase.from('blog_categories').update({ sort_order: i + 1 }).eq('id', cat.id),
    );
    const results = await Promise.all(updates);
    const failed = results.some((r) => r.error);
    if (failed) {
      setFeedback({ type: 'error', message: 'Failed to save new order. Refreshing...' });
      fetchCategories();
    } else {
      setFeedback({ type: 'success', message: 'Category order saved.' });
    }
  }

  /* ---------- Checkbox / bulk move ---------- */

  function togglePostSelection(id: string): void {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function deselectAllPosts(): void {
    setSelectedPostIds(new Set());
  }

  async function handleBulkMovePosts(targetCategoryId: string): Promise<void> {
    if (selectedPostIds.size === 0) return;

    setSaving(true);
    const ids = Array.from(selectedPostIds);
    const targetCat = categories.find((c) => c.id === targetCategoryId);
    const categoryName = targetCat?.name || '';

    const { error } = await supabase
      .from('posts')
      .update({
        category_id: targetCategoryId,
        category: categoryName,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to move posts.' });
    } else {
      setFeedback({
        type: 'success',
        message: `Moved ${ids.length} post${ids.length > 1 ? 's' : ''}.`,
      });
      deselectAllPosts();
      fetchPosts();
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
      // Also update the string category field on any posts that reference this category
      const { error } = await supabase
        .from('blog_categories')
        .update(payload)
        .eq('id', editingCategory.id);

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update category.' });
      } else {
        // Sync the string category name on posts
        await supabase
          .from('posts')
          .update({ category: payload.name, updated_at: new Date().toISOString() })
          .eq('category_id', editingCategory.id);

        setFeedback({ type: 'success', message: 'Category updated.' });
        setEditingCategory(null);
        fetchCategories();
        fetchPosts();
      }
    } else {
      const { error } = await supabase.from('blog_categories').insert(payload);
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

  async function handleDeleteCategory(cat: BlogCategory): Promise<void> {
    const count = (postsByCategory[cat.id] || []).length;
    if (count > 0) {
      setFeedback({
        type: 'error',
        message: `Cannot delete "${cat.name}" \u2014 it has ${count} post${count > 1 ? 's' : ''}. Move or delete them first.`,
      });
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('blog_categories').delete().eq('id', cat.id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } else {
      setFeedback({ type: 'success', message: 'Category deleted.' });
      fetchCategories();
    }
  }

  /* ---------- Post CRUD ---------- */

  async function handleSavePost(): Promise<void> {
    if (!editingPost || !editingPost.title?.trim() || !editingPost.content?.trim()) {
      setFeedback({ type: 'error', message: 'Title and content are required.' });
      return;
    }

    setSaving(true);

    // Resolve category name from category_id
    const resolvedCat = categories.find((c) => c.id === editingPost.category_id);
    const categoryName = resolvedCat?.name || editingPost.category || 'General';

    if (editingPost.id) {
      const { error } = await supabase
        .from('posts')
        .update({
          title: editingPost.title,
          content: editingPost.content,
          excerpt: editingPost.excerpt || null,
          author: editingPost.author,
          category: categoryName,
          category_id: editingPost.category_id || null,
          status: editingPost.status,
          read_time: editingPost.read_time || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPost.id);

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update post.' });
      } else {
        setFeedback({ type: 'success', message: 'Post updated.' });
        setEditingPost(null);
        fetchPosts();
      }
    } else {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: editingPost.title,
          content: editingPost.content,
          excerpt: editingPost.excerpt || null,
          author: editingPost.author || 'Todd Isenburg',
          category: categoryName,
          category_id: editingPost.category_id || null,
          status: editingPost.status || 'published',
          read_time: editingPost.read_time || null,
        });

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create post.' });
      } else {
        setFeedback({ type: 'success', message: 'Post created!' });
        setEditingPost(null);
        fetchPosts();
      }
    }

    setSaving(false);
  }

  async function handleDeletePost(post: Post): Promise<void> {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete post.' });
    } else {
      setFeedback({ type: 'success', message: 'Post deleted.' });
      fetchPosts();
    }
  }

  /* ---------- open helpers ---------- */

  function openNewPost(presetCategoryId?: string): void {
    const cat = categories.find((c) => c.id === presetCategoryId);
    setEditingPost({
      ...emptyPost,
      category_id: presetCategoryId || (categories.length > 0 ? categories[0].id : ''),
      category: cat?.name || (categories.length > 0 ? categories[0].name : 'General'),
    });
  }

  function openEditPost(post: Post): void {
    setEditingPost(post);
  }

  /* ---------- DragOverlay data ---------- */

  const activeCat = useMemo(() => {
    if (!activeId) return null;
    const realId = fromCatSortId(activeId);
    return categories.find((c) => c.id === realId) || null;
  }, [activeId, categories]);

  /* ---------- render ---------- */

  const isEditing = editingCategory || editingPost;
  const isLoading = loading || postsLoading;

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
            <h1 className="text-2xl md:text-3xl font-bold">Blog Posts</h1>
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
              onClick={() => openNewPost()}
              className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Post
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
            {(categories.length > 0 || posts.length > 0) && (
              <p className="text-xs text-[var(--color-wave)] mb-3">
                Drag to reorder categories &middot; Check posts to bulk move between categories
              </p>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
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
                    posts={postsByCategory[cat.id] || []}
                    isExpanded={expandedCats.has(cat.id)}
                    onToggleExpand={() => toggleExpand(cat.id)}
                    onEditCategory={() => setEditingCategory(cat)}
                    onDeleteCategory={() => handleDeleteCategory(cat)}
                    onAddPost={() => openNewPost(cat.id)}
                    selectedPostIds={selectedPostIds}
                    onTogglePostSelect={togglePostSelection}
                    onEditPost={openEditPost}
                    onDeletePost={handleDeletePost}
                  />
                ))}
              </SortableContext>

              {/* Unassigned zone */}
              <UnassignedZone
                posts={postsByCategory['unassigned'] || []}
                selectedPostIds={selectedPostIds}
                onTogglePostSelect={togglePostSelection}
                onEditPost={openEditPost}
                onDeletePost={handleDeletePost}
              />

              {/* Drag overlay rendered via portal */}
              {createPortal(
                <DragOverlay>
                  {activeCat && (
                    <CategoryDragPreview
                      cat={activeCat}
                      postCount={(postsByCategory[activeCat.id] || []).length}
                    />
                  )}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>

            {categories.length === 0 && posts.length === 0 && (
              <div className="glass rounded-xl p-12 text-center">
                <p className="text-[var(--color-mist)]">
                  No categories or posts yet. Create a category to get started.
                </p>
              </div>
            )}

            {/* Floating bulk move action bar */}
            <AnimatePresence>
              {selectedPostIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg border border-[var(--color-gold)]/30"
                >
                  <span className="text-sm font-medium">
                    {selectedPostIds.size} selected
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBulkMovePosts(e.target.value);
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
                    onClick={deselectAllPosts}
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
                          status: e.target.value as BlogCategory['status'],
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

        {/* Post editor modal */}
        <AnimatePresence>
          {editingPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setEditingPost(null)}
              />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-3xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingPost.id ? 'Edit Post' : 'New Post'}
                  </h2>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingPost.title || ''}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, title: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Post title"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Excerpt
                    </label>
                    <input
                      type="text"
                      value={editingPost.excerpt || ''}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, excerpt: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Brief summary (shown on blog listing)"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Content
                    </label>
                    <textarea
                      value={editingPost.content || ''}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, content: e.target.value })
                      }
                      rows={12}
                      className={`${inputClass} resize-y`}
                      placeholder="Write your post here..."
                    />
                  </div>

                  {/* Row: Category, Author, Read Time */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                        Category
                      </label>
                      <select
                        value={editingPost.category_id || ''}
                        onChange={(e) => {
                          const cat = categories.find((c) => c.id === e.target.value);
                          setEditingPost({
                            ...editingPost,
                            category_id: e.target.value,
                            category: cat?.name || '',
                          });
                        }}
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
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        value={editingPost.author || ''}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, author: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={editingPost.read_time || ''}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, read_time: e.target.value })
                        }
                        className={inputClass}
                        placeholder="e.g. 3 min read"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">
                      Status
                    </label>
                    <select
                      value={editingPost.status || 'published'}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, status: e.target.value })
                      }
                      className={`${inputClass} sm:w-48`}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSavePost}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Post'}
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
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
