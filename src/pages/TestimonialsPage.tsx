import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Attaboy } from '../lib/supabase';

const testimonials = [
  {
    name: 'Vic Miller',
    role: 'Senior Adjuster',
    rating: 5,
    quote: "I used the app on every claim and honestly don't know what I would have done without it. Super easy to navigate and is an adjuster's best friend in the field. Advance payments were done in a flash and all resources at your fingertips. EVERY adjuster needs this app to be successful.",
  },
  {
    name: 'Michelle Brown',
    role: 'Field Adjuster',
    rating: 5,
    quote: 'One Stop Adjuster was a game-changer during my deployment. As a first-time user, I found it intuitive, efficient, and easy to use. It seamlessly organized my photos, allowing real-time categorization with accurate voice-recorded notes, eliminating post-inspection sorting. The built-in forms had everything I needed, ensuring smooth, error-free reporting.',
  },
  {
    name: 'David Chen',
    role: 'Independent Adjuster',
    rating: 5,
    quote: "Best of all, it structured my data in real-time, making report submission fast and hassle-free. I'll definitely be using it in the field going forward! The sketching tool alone saved me hours per claim.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function TestimonialsPage(): React.JSX.Element {
  const [attaboys, setAttaboys] = useState<Attaboy[]>([]);

  useEffect(() => {
    async function fetchAttaboys(): Promise<void> {
      const { data } = await supabase
        .from('attaboys')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setAttaboys(data);
    }
    fetchAttaboys();
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

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="glass rounded-2xl p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
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
        </motion.div>

        {/* Attaboys Section */}
        {attaboys.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-24 mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-gradient">Team Attaboys</span>
              </h2>
              <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
                Recognizing outstanding performance from our team in the field
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {attaboys.map((ab) => (
                <motion.div
                  key={ab.id}
                  variants={cardVariants}
                  className="glass rounded-2xl p-6 flex flex-col"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < ab.rating ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'text-[var(--color-ocean)]'}`} />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-[var(--color-gold)]" />
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                      {ab.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{ab.recipient}</h3>

                  <p className="text-[var(--color-mist)] text-sm leading-relaxed flex-1 mb-4">
                    "{ab.message}"
                  </p>

                  <p className="text-[var(--color-wave)] text-sm">— {ab.author}</p>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
