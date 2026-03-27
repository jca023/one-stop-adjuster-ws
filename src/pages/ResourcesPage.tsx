import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Video, FileText, HelpCircle, ExternalLink, Download, ArrowRight, Clock, User, ChevronDown, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post, TrainingVideo, DocumentCategory, Document } from '../lib/supabase';
import TrainingCalendar from '../components/TrainingCalendar';

const tabs = [
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'training', label: 'Training', icon: Video },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'support', label: 'Support', icon: HelpCircle },
];


export default function ResourcesPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('docs');
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>([]);
  const [videosExpanded, setVideosExpanded] = useState(false);
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
      const { data } = await supabase
        .from('training_videos')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });
      if (data) setTrainingVideos(data as TrainingVideo[]);
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

            {/* Training Videos Card */}
            <div className="glass rounded-2xl overflow-hidden border border-transparent hover:border-[var(--color-gold)]/20 transition-colors">
              <button
                onClick={() => setVideosExpanded(!videosExpanded)}
                className="w-full px-6 py-6 flex items-center justify-between hover:bg-[var(--color-ocean)]/5 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-surf)]/30 to-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-surf)]/20">
                    <Play className="w-7 h-7 text-[var(--color-surf)]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-xl text-[var(--color-pearl)]">OSA Training Videos</h3>
                    <p className="text-[var(--color-mist)] text-sm mt-0.5">
                      Step-by-step video instructions and tutorials
                      {trainingVideos.length > 0 && (
                        <span className="text-[var(--color-wave)] ml-2">&middot; {trainingVideos.length} videos</span>
                      )}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: videosExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-[var(--color-wave)]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {videosExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-1">
                      {trainingVideos.map((video, index) => (
                        <a
                          key={video.id}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg px-4 py-3 flex items-center gap-4 group hover:bg-[var(--color-ocean)]/10 transition-colors"
                        >
                          <span className="text-xs font-medium text-[var(--color-wave)] w-5 text-right shrink-0">
                            {index + 1}
                          </span>
                          <div className="w-8 h-8 rounded-md bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors shrink-0">
                            <Play className="w-4 h-4 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                          </div>
                          <span className="font-medium text-sm flex-1 text-[var(--color-mist)] group-hover:text-[var(--color-pearl)] transition-colors">
                            {video.title}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[var(--color-wave)] group-hover:text-[var(--color-gold)] transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                        </a>
                      ))}
                      {trainingVideos.length === 0 && (
                        <p className="text-[var(--color-mist)] text-sm text-center py-4">Training videos coming soon.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">Latest from OSA</h3>
              <p className="text-[var(--color-mist)]">
                Recent articles from the One Stop Adjuster team
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
            <h3 className="text-xl font-semibold mb-6">Need Help?</h3>
            <div className="space-y-8 text-[var(--color-mist)]">
              {/* Step 1: Bug Report / Feedback */}
              <div>
                <h4 className="text-lg font-semibold text-[var(--color-gold)] mb-3">Step 1: Submitting a Bug Report or Feedback</h4>
                <p className="mb-4">
                  To ensure the One Stop Adjuster (OSA) platform continues to meet the rigorous demands of field adjusting, we prioritize your direct feedback. If you encounter a technical issue or have a suggestion for improvement, please use the Report Bug/Feedback feature within the app.
                </p>
                <p className="font-medium text-[var(--color-pearl)] mb-3">Follow these steps to submit a comprehensive report:</p>
                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li><strong className="text-[var(--color-pearl)]">Locate the Feature:</strong> Open the OSA app and tap the OSA Icon to open the main menu. Scroll to the bottom and select Report Bug/Feedback.</li>
                  <li><strong className="text-[var(--color-pearl)]">Provide Detailed Information:</strong> In the description field, please outline the issue or suggestion with as much detail as possible. Clearly stating what occurred and the steps leading up to it helps our development team resolve the matter efficiently.</li>
                  <li><strong className="text-[var(--color-pearl)]">Include Screen Captures:</strong> Visual context is invaluable. We highly recommend including a screen capture or recording of the specific screen or error message you are referencing.</li>
                  <li><strong className="text-[var(--color-pearl)]">Provide Your Email Address:</strong> It is essential to include a valid email address. This allows our support team to provide direct follow-up correspondence, request additional clarification if needed, and notify you once the issue has been resolved.</li>
                  <li><strong className="text-[var(--color-pearl)]">Submit:</strong> Once all fields are complete, tap Submit.</li>
                </ol>
                <p className="mt-4 text-sm italic">
                  Your input is vital to the evolution of the OSA ecosystem. By providing detailed reports and a reliable point of contact, you help us maintain the high standard of reliability you expect in the field.
                </p>
              </div>

              {/* Step 2: Contact Support */}
              <div>
                <h4 className="text-lg font-semibold text-[var(--color-gold)] mb-3">Step 2: Contact Support</h4>
                <p className="mb-4">Our support team is available to help you get the most out of One Stop Adjuster.</p>
                <div className="space-y-2">
                  <p><strong className="text-[var(--color-pearl)]">Phone:</strong> 251-680-6736</p>
                  <p><strong className="text-[var(--color-pearl)]">Email:</strong> info@one-stop-adjuster.com</p>
                  <p><strong className="text-[var(--color-pearl)]">Hours:</strong> Mon-Fri 8am-5pm | Sat-Sun 9am-3pm</p>
                </div>
                <p className="text-sm mt-3">Response time: Up to 12 hours during business hours.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
