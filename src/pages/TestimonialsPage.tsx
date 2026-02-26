import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Testimonial } from '../lib/supabase';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TestimonialsPage(): React.JSX.Element {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials(): Promise<void> {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (data) setTestimonials(data);
      setLoading(false);
    }
    fetchTestimonials();
  }, []);

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
            <span className="text-gradient">Trusted by Field Adjusters</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Hear from adjusters who've transformed their workflow with One Stop Adjuster
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-4 h-4 rounded bg-[var(--color-ocean)]/30" />
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-full" />
                  <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-3/4" />
                  <div className="h-4 bg-[var(--color-ocean)]/20 rounded w-5/6" />
                </div>
                <div className="h-5 bg-[var(--color-ocean)]/30 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Testimonials grid */}
        {!loading && (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={cardVariants}
                className="glass rounded-2xl p-6 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'fill-[var(--color-gold)] text-[var(--color-gold)]'
                          : 'text-[var(--color-ocean)]'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-[var(--color-mist)] text-sm leading-relaxed flex-1 mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-[var(--color-wave)] text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}

            {testimonials.length === 0 && (
              <div className="col-span-full glass rounded-2xl p-12 text-center">
                <p className="text-[var(--color-mist)]">No testimonials yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
