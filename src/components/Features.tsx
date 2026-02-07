import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Camera,
  FileText,
  MapPin,
  PenTool,
  ClipboardList,
  Calendar,
  FolderOpen,
  FileOutput,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Claim Dashboard',
    description:
      'View all your claims at a glance. Track status, deadlines, and priorities from a single, intuitive interface.',
    color: 'var(--color-surf)',
  },
  {
    icon: FileText,
    title: 'Forms & Documents',
    description:
      'All NFIP required forms pre-filled with claim data. Sign forms on-site with adjusters and policyholders.',
    color: 'var(--color-gold)',
  },
  {
    icon: PenTool,
    title: 'Scope Notes',
    description:
      'Room-by-room templates make scope notes a breeze. Voice recording with accurate transcription saves hours.',
    color: 'var(--color-success)',
  },
  {
    icon: Camera,
    title: 'Photo Documentation',
    description:
      'High-quality image capture with real-time categorization. Eliminate post-inspection photo sorting forever.',
    color: 'var(--color-foam)',
  },
  {
    icon: MapPin,
    title: 'Sketch & Diagrams',
    description:
      'Create accurate 2D floor plans using your camera. No tape measure required for professional diagrams.',
    color: 'var(--color-gold-light)',
  },
  {
    icon: Calendar,
    title: 'Planner & Scheduling',
    description:
      'Map-based claim locations and integrated calendar. Optimize your routes and manage your schedule efficiently.',
    color: 'var(--color-surf)',
  },
  {
    icon: FolderOpen,
    title: 'Resources Library',
    description:
      'NFIP guidelines, coverage tables, and reference materials at your fingertips when you need them most.',
    color: 'var(--color-success)',
  },
  {
    icon: FileOutput,
    title: 'Report Generation',
    description:
      'Generate professional reports with one click. All data structured and ready for submission.',
    color: 'var(--color-gold)',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:bg-[var(--color-deep)]/80 hover:-translate-y-1">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${feature.color}20` }}
        >
          <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-[var(--color-mist)] text-sm leading-relaxed">
          {feature.description}
        </p>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${feature.color}10, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  );
}

export default function Features() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-wave)] to-transparent" />

      <div className="container">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Zap className="w-4 h-4 text-[var(--color-gold)]" />
              <span className="text-sm text-[var(--color-mist)]">
                Built for the field
              </span>
            </div>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything You Need,{' '}
            <span className="text-gradient">One Platform</span>
          </motion.h2>

          <motion.p
            className="text-lg text-[var(--color-mist)]"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            From inspection to submission, every tool designed to reduce errors and
            save time. No more juggling multiple apps or paper forms.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <a href="#how-it-works" className="btn-secondary inline-flex items-center gap-2">
            See It In Action
          </a>
        </motion.div>
      </div>
    </section>
  );
}
