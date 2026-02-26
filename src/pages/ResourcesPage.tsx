import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, FileText, HelpCircle, ExternalLink, Download, ArrowRight, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/supabase';

const tabs = [
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'training', label: 'Training', icon: Video },
  { id: 'library', label: 'Library', icon: FileText },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

const documents = [
  { title: 'Getting Started Guide', description: 'Complete walkthrough for new users', type: 'PDF', url: 'https://www.one-stop-adjuster.com/s/Getting-Started-Guide-Verisk2.pdf' },
  { title: 'OSA Pocket Guide', description: 'Quick reference guide for field adjusters', type: 'PDF', url: 'https://www.one-stop-adjuster.com/s/OSA-Pocket-Guide-9-25-2025.pdf' },
  { title: 'OSA Process', description: 'End-to-end claims process documentation', type: 'DOCX', url: 'https://www.one-stop-adjuster.com/s/OSA-Process.docx' },
];

const trainingVideos = [
  { week: 1, videos: [
    { title: 'Getting Started', url: 'https://youtu.be/afyOXaXMU2k' },
    { title: 'Deep Learning', url: 'https://youtu.be/wFcaGDzW9_Y' },
  ]},
  { week: 2, videos: [
    { title: 'The Process', url: 'https://youtu.be/k32_uqy3A5Y' },
    { title: 'Learning the Flow', url: 'https://youtu.be/1iF8XRJpark' },
  ]},
  { week: 3, videos: [
    { title: 'Getting Started w/ OSA', url: 'https://youtu.be/nPARGmUkKKw' },
    { title: 'Integrating - Inspection Tools', url: 'https://youtu.be/vPGe9ZIDON0' },
  ]},
  { week: 4, videos: [
    { title: 'Full Cycle', url: 'https://youtu.be/O3z4oQhDLt4' },
    { title: 'Cycling Through a Claim', url: 'https://youtu.be/yqYmlZ1Zers' },
  ]},
  { week: 5, videos: [
    { title: 'Simple Start', url: 'https://youtu.be/ToAPldXdc64' },
    { title: 'Finishing the Claim', url: 'https://youtu.be/ndor2yDy7dA' },
  ]},
  { week: 6, videos: [
    { title: 'The Foundation', url: 'https://youtu.be/XBJcSLWWoA8' },
    { title: 'Closing the Claim', url: 'https://youtu.be/50ZVJDzkC2w' },
  ]},
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ResourcesPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('docs');
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

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
            className="max-w-3xl mx-auto space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {documents.map((doc) => (
              <motion.a
                key={doc.title}
                variants={itemVariants}
                href={doc.url}
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
                    <p className="text-[var(--color-mist)] text-sm">{doc.description}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--color-wave)] bg-[var(--color-ocean)]/10 px-2 py-1 rounded">{doc.type}</span>
              </motion.a>
            ))}
          </motion.div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <motion.div
            className="max-w-4xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {trainingVideos.map((week) => (
              <motion.div key={week.week} variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-3 text-[var(--color-gold)]">Week {week.week}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {week.videos.map((video) => (
                    <a
                      key={video.title}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass rounded-xl p-5 flex items-center gap-4 group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                        <Video className="w-5 h-5 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-[var(--color-mist)] text-xs">YouTube</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--color-wave)] group-hover:text-[var(--color-gold)] transition-colors" />
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
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
