import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Shield, FileText, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'Claim Tracking',
    description: 'Monitor your claim status in real-time with automatic updates and notifications.',
  },
  {
    icon: Shield,
    title: 'Policy Access',
    description: 'View your policy details, coverage limits, and deductible information anytime.',
  },
  {
    icon: FileText,
    title: 'Document Upload',
    description: 'Upload photos, receipts, and supporting documents directly to your claim file.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Communicate directly with your adjuster through secure, encrypted messaging.',
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

export default function PolicyholderPortalPage(): React.JSX.Element {
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
            <Briefcase className="w-10 h-10 text-[var(--color-surf)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Policyholder Portal</span>
          </h1>
          <p className="text-xl text-[var(--color-mist)] max-w-2xl mx-auto">
            For Policyholders
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
            Access your policy information, submit claims, and track your claim status. Share documents,
            coordinate with adjusters, and receive updates throughout the claims process. Experience
            transparent communication and faster claim resolutions.
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
            Access Policyholder Portal
          </button>
        </motion.div>
      </div>
    </section>
  );
}
