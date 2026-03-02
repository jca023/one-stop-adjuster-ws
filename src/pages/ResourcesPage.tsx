import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, FileText, HelpCircle, ExternalLink, Download, ArrowRight, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post, TrainingVideo, DocumentCategory, Document, VideoCategory } from '../lib/supabase';
import TrainingCalendar from '../components/TrainingCalendar';

const tabs = [
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'training', label: 'Training', icon: Video },
  { id: 'library', label: 'Library', icon: FileText },
  { id: 'support', label: 'Support', icon: HelpCircle },
];


export default function ResourcesPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('docs');
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    async function fetchRecentPosts(): Promise<void> {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setRecentPosts(data);
    }
    fetchRecentPosts();
  }, []);

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
      if (docRes.data) setDocs(docRes.data as Document[]);
    }
    fetchDocs();
  }, [activeTab]);

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

  return (
    <section className="pt-32 pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">OSA Resources</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Everything you need to maximize your success with OSA
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                  : 'glass text-[var(--color-mist)] hover:text-[var(--color-pearl)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <motion.div
            className="max-w-3xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {categories.map((cat) => {
              const catDocs = docs.filter((d) => d.category_id === cat.id);
              if (catDocs.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="text-lg font-semibold text-[var(--color-pearl)] mb-3">{cat.name}</h3>
                  <div className="space-y-3">
                    {catDocs.map((doc) => (
                      <a
                        key={doc.id}
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
                            <h4 className="font-semibold">{doc.title}</h4>
                            {doc.description && <p className="text-[var(--color-mist)] text-sm">{doc.description}</p>}
                          </div>
                        </div>
                        <span className="text-xs text-[var(--color-wave)] bg-[var(--color-ocean)]/10 px-2 py-1 rounded uppercase">{doc.file_type}</span>
                      </a>
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

        {/* Training Tab */}
        {activeTab === 'training' && (
          <motion.div
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Calendar */}
            <TrainingCalendar />

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
            {videoCategories.length === 0 && trainingVideos.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center">
                <Video className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
                <p className="text-[var(--color-mist)]">Training videos coming soon.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Blog & Library</h3>
              <p className="text-[var(--color-mist)]">
                Latest articles from the OSA team
              </p>
            </div>

            {recentPosts.length > 0 ? (
              <div className="space-y-4 mb-8">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    to="/blog"
                    className="glass rounded-xl p-5 flex items-center justify-between group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors block"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                          {post.category}
                        </span>
                        {post.read_time && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-wave)]">
                            <Clock className="w-3 h-3" />
                            {post.read_time}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold group-hover:text-[var(--color-gold)] transition-colors">{post.title}</h4>
                      {post.excerpt && (
                        <p className="text-[var(--color-mist)] text-sm mt-1 line-clamp-1">{post.excerpt}</p>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[var(--color-wave)] mt-2">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-wave)] group-hover:text-[var(--color-gold)] transition-colors shrink-0 ml-4" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center mb-8">
                <FileText className="w-12 h-12 text-[var(--color-wave)] mx-auto mb-4" />
                <p className="text-[var(--color-mist)]">Blog posts coming soon.</p>
              </div>
            )}

            <div className="text-center">
              <Link to="/blog" className="btn-primary inline-flex items-center gap-2">
                View All Posts
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-8 md:p-12 max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
            <div className="space-y-4 text-[var(--color-mist)]">
              <p>Our support team is available to help you get the most out of One Stop Adjuster.</p>
              <div className="space-y-2">
                <p><strong className="text-[var(--color-pearl)]">Phone:</strong> 251-680-6736</p>
                <p><strong className="text-[var(--color-pearl)]">Email:</strong> info@one-stop-adjuster.com</p>
                <p><strong className="text-[var(--color-pearl)]">Hours:</strong> Mon-Fri 8am-5pm | Sat-Sun 9am-3pm</p>
              </div>
              <p className="text-sm">Response time: Within 4 hours during business hours.</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
