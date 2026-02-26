import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Tag, User, ChevronRight, X, PenLine } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/supabase';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function BlogPage(): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts(): Promise<void> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">OSA Blog</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Industry insights, tips, and updates from the One Stop Adjuster team
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="max-w-4xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-[var(--color-ocean)]/30 rounded w-2/3 mb-4" />
                <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-full mb-2" />
                <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <motion.div
            className="max-w-4xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {posts.map((post) => (
              <motion.button
                key={post.id}
                variants={cardVariants}
                onClick={() => setExpandedPost(post)}
                className="glass rounded-2xl p-6 w-full text-left group hover:border-[var(--color-gold)]/30 border border-transparent transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                        {post.category}
                      </span>
                      {post.read_time && (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-wave)]">
                          <Clock className="w-3 h-3" />
                          {post.read_time}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-[var(--color-gold)] transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[var(--color-mist)] text-sm leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--color-wave)]">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--color-wave)] group-hover:text-[var(--color-gold)] transition-colors mt-1 shrink-0" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center max-w-2xl mx-auto"
          >
            <PenLine className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
            <p className="text-[var(--color-mist)]">
              Blog posts will appear here once they're published.
            </p>
          </motion.div>
        )}

        {/* Expanded post modal */}
        <AnimatePresence>
          {expandedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
              onClick={() => setExpandedPost(null)}
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.article
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative glass rounded-2xl p-8 md:p-10 max-w-3xl w-full mb-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setExpandedPost(null)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--color-ocean)]/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                    <Tag className="w-3 h-3" />
                    {expandedPost.category}
                  </span>
                  {expandedPost.read_time && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-wave)]">
                      <Clock className="w-3 h-3" />
                      {expandedPost.read_time}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-4">{expandedPost.title}</h1>

                <div className="flex items-center gap-4 text-sm text-[var(--color-wave)] mb-8 pb-6 border-b border-[var(--color-ocean)]/30">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {expandedPost.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(expandedPost.created_at)}
                  </span>
                </div>

                <div className="prose-custom text-[var(--color-mist)] leading-relaxed whitespace-pre-line">
                  {expandedPost.content}
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
