import { motion } from 'framer-motion';
import { UserCheck, ClipboardList, MapPin, FileBarChart, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Case Management',
    description: 'Organize and manage all your claims in one centralized dashboard.',
  },
  {
    icon: MapPin,
    title: 'Field Inspections',
    description: 'Conduct mobile inspections with photo documentation and GPS tracking.',
  },
  {
    icon: FileBarChart,
    title: 'Report Generation',
    description: 'Create professional reports quickly with customizable templates.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance metrics and optimize your workflow efficiency.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AdjusterPortalPage(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20">
      <div className="container">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-ocean)]/20 mb-6">
            <UserCheck className="w-10 h-10 text-[var(--color-surf)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Adjuster Portal</span>
          </h1>
          <p className="text-xl text-[var(--color-mist)] max-w-2xl mx-auto">
            For Insurance Adjusters
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass rounded-2xl p-8 md:p-12 mb-12 max-w-4xl mx-auto"
        >
          <p className="text-lg text-[var(--color-mist)] leading-relaxed text-center">
            Comprehensive tools designed specifically for adjusters. Manage your entire caseload,
            conduct field inspections, generate reports, track expenses, and communicate with all
            parties from one powerful platform. Increase productivity by up to 300%.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6 group hover:border-[var(--color-gold)]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-foam)] mb-1">{feature.title}</h3>
                  <p className="text-[var(--color-mist)] text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-[var(--color-mist)] mb-4">Portal access coming soon</p>
          <button
            disabled
            className="btn-gold inline-flex items-center gap-2 px-8 py-3 rounded-xl text-lg font-semibold opacity-60 cursor-not-allowed"
          >
            Access Adjuster Portal
          </button>
        </motion.div>
      </div>
    </section>
  );
}
