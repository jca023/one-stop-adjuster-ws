import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../lib/supabase';

const CATEGORIES = ['General', 'Announcements', 'Tips & Tricks', 'Product', 'Industry News'];

const emptyPost = {
  title: '',
  content: '',
  excerpt: '',
  author: 'Todd Isenburg',
  category: 'General',
  status: 'published',
  read_time: '',
};

export default function AdminBlogPage(): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function fetchPosts(): Promise<void> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  async function handleSave(): Promise<void> {
    if (!editing || !editing.title?.trim() || !editing.content?.trim()) {
      setFeedback({ type: 'error', message: 'Title and content are required.' });
      return;
    }

    setSaving(true);

    if (editing.id) {
      // Update existing
      const { error } = await supabase
        .from('posts')
        .update({
          title: editing.title,
          content: editing.content,
          excerpt: editing.excerpt || null,
          author: editing.author,
          category: editing.category,
          status: editing.status,
          read_time: editing.read_time || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editing.id);

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to update post.' });
      } else {
        setFeedback({ type: 'success', message: 'Post updated.' });
        setEditing(null);
        fetchPosts();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('posts')
        .insert({
          title: editing.title,
          content: editing.content,
          excerpt: editing.excerpt || null,
          author: editing.author || 'Todd Isenburg',
          category: editing.category || 'General',
          status: editing.status || 'published',
          read_time: editing.read_time || null,
        });

      if (error) {
        setFeedback({ type: 'error', message: 'Failed to create post.' });
      } else {
        setFeedback({ type: 'success', message: 'Post created!' });
        setEditing(null);
        fetchPosts();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string): Promise<void> {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      setFeedback({ type: 'error', message: 'Failed to delete post.' });
    } else {
      setFeedback({ type: 'success', message: 'Post deleted.' });
      fetchPosts();
    }
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">Blog Posts</h1>
          </div>
          <button
            onClick={() => setEditing({ ...emptyPost })}
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Post
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

        {/* Loading */}
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

        {/* Post list */}
        {!loading && !editing && (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-wave)]">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                      {post.category}
                    </span>
                    <span>{post.author}</span>
                    <span className={post.status === 'published' ? 'text-[var(--color-success)]' : 'text-[var(--color-wave)]'}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(post)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-[var(--color-surf)]" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-[var(--color-mist)]">No posts yet. Click "New Post" to create one.</p>
              </div>
            )}
          </div>
        )}

        {/* Editor modal */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative glass rounded-2xl p-6 md:p-8 max-w-3xl w-full mb-20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editing.id ? 'Edit Post' : 'New Post'}</h2>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Title</label>
                    <input
                      type="text"
                      value={editing.title || ''}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                      placeholder="Post title"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Excerpt</label>
                    <input
                      type="text"
                      value={editing.excerpt || ''}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                      placeholder="Brief summary (shown on blog listing)"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Content</label>
                    <textarea
                      value={editing.content || ''}
                      onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors resize-y"
                      placeholder="Write your post here..."
                    />
                  </div>

                  {/* Row: Category, Author, Read Time */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Category</label>
                      <select
                        value={editing.category || 'General'}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Author</label>
                      <input
                        type="text"
                        value={editing.author || ''}
                        onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Read Time</label>
                      <input
                        type="text"
                        value={editing.read_time || ''}
                        onChange={(e) => setEditing({ ...editing, read_time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors"
                        placeholder="e.g. 3 min read"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-mist)] mb-1">Status</label>
                    <select
                      value={editing.status || 'published'}
                      onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-deep)] border border-[var(--color-ocean)]/30 focus:border-[var(--color-gold)] outline-none transition-colors sm:w-48"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 !px-6 !py-2.5 text-sm disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Post'}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
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
