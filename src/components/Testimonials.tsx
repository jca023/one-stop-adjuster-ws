import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      "I used the app on every claim and honestly don't know what I would have done without it. Super easy to navigate and is an adjuster's best friend in the field. Advance payments were done in a flash and all resources at your fingertips. EVERY adjuster needs this app to be successful.",
    author: 'Vic Miller',
    role: 'Senior Adjuster',
    rating: 5,
  },
  {
    quote:
      "One Stop Adjuster was a game-changer during my deployment. As a first-time user, I found it intuitive, efficient, and easy to use. It seamlessly organized my photos, allowing real-time categorization with accurate voice-recorded notes, eliminating post-inspection sorting. The built-in forms had everything I needed, ensuring smooth, error-free reporting.",
    author: 'Michelle Brown',
    role: 'Field Adjuster',
    rating: 5,
  },
  {
    quote:
      "Best of all, it structured my data in real-time, making report submission fast and hassle-free. I'll definitely be using it in the field going forward! The sketching tool alone saved me hours per claim.",
    author: 'David Chen',
    role: 'Independent Adjuster',
    rating: 5,
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-gold)] opacity-[0.02] blur-3xl" />
      </div>

      <div className="container relative">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            Trusted by{' '}
            <span className="text-gradient">Field Adjusters</span>
          </motion.h2>
          <motion.p
            className="text-lg text-[var(--color-mist)]"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Hear from adjusters who've transformed their workflow with One Stop Adjuster
          </motion.p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main testimonial card */}
            <motion.div
              key={currentIndex}
              className="glass rounded-3xl p-8 md:p-12 relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8">
                <Quote className="w-12 h-12 text-[var(--color-gold)] opacity-30" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-[var(--color-gold)] text-[var(--color-gold)]"
                  />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 text-[var(--color-pearl)]">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-surf)] to-[var(--color-ocean)] flex items-center justify-center text-lg font-bold">
                  {testimonials[currentIndex].author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-[var(--color-mist)]">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full glass hover:bg-[var(--color-wave)] transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-[var(--color-gold)]'
                        : 'bg-[var(--color-wave)] hover:bg-[var(--color-surf)]'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full glass hover:bg-[var(--color-wave)] transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
