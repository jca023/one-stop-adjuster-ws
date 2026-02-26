import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminDashboardPage(): React.JSX.Element {
  const [postCount, setPostCount] = useState<number | null>(null);
  const [testimonialCount, setTestimonialCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCounts(): Promise<void> {
      const [postsRes, testimonialsRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }),
      ]);
      setPostCount(postsRes.count ?? 0);
      setTestimonialCount(testimonialsRes.count ?? 0);
    }
    fetchCounts();
  }, []);

  const cards = [
    {
      title: 'Blog Posts',
      count: postCount,
      icon: FileText,
      href: '/admin/blog',
      description: 'Write, edit, and publish blog posts',
      publicPath: '/blog',
    },
    {
      title: 'Testimonials',
      count: testimonialCount,
      icon: Star,
      href: '/admin/testimonials',
      description: 'Manage customer testimonials and ratings',
      publicPath: '/testimonials',
    },
  ];

  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">Editor Dashboard</span>
          </h1>
          <p className="text-[var(--color-mist)]">
            Manage your site content
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={card.href}
                className="glass rounded-2xl p-6 flex flex-col group hover:border-[var(--color-gold)]/30 border border-transparent transition-all block"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center group-hover:bg-[var(--color-gold)]/20 transition-colors">
                    <card.icon className="w-6 h-6 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--color-wave)] group-hover:text-[var(--color-gold)] transition-colors" />
                </div>

                <h2 className="text-lg font-semibold mb-1">{card.title}</h2>
                <p className="text-[var(--color-mist)] text-sm mb-3">{card.description}</p>

                <div className="flex items-center gap-2 text-xs text-[var(--color-wave)] mb-4">
                  <ExternalLink className="w-3 h-3" />
                  <span>Displays at <span className="text-[var(--color-surf)]">{card.publicPath}</span></span>
                </div>

                <div className="mt-auto">
                  <span className="text-2xl font-bold text-[var(--color-gold)]">
                    {card.count !== null ? card.count : '...'}
                  </span>
                  <span className="text-[var(--color-wave)] text-sm ml-2">total</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[var(--color-wave)] text-xs mt-12"
        >
          Editor access will be gated behind authentication when the site goes live.
        </motion.p>
      </div>
    </section>
  );
}
