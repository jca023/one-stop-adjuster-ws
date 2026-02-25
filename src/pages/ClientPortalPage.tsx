import { motion } from 'framer-motion';
import { Users, CheckCircle, FileText, MessageSquare, Bell, ExternalLink } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'Track Claims',
    description: 'Monitor your claim status in real-time with instant updates and notifications.',
  },
  {
    icon: FileText,
    title: 'Upload Documents',
    description: 'Securely upload photos, videos, and documents directly to your claim file.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Communicate directly with your adjuster and get answers to your questions quickly.',
  },
  {
    icon: Bell,
    title: 'Receive Updates',
    description: 'Get notified of every step in your claim process with automatic alerts.',
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

export default function ClientPortalPage(): React.JSX.Element {
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
            <Users className="w-10 h-10 text-[var(--color-surf)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Client Portal</span>
          </h1>
          <p className="text-xl text-[var(--color-mist)] max-w-2xl mx-auto">
            For Insurance Clients
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
            As a client, you have access to real-time claim updates, photo documentation,
            direct communication with your adjuster, and transparent status tracking throughout
            the entire claims process. Experience faster resolutions and better communication.
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
          <a
            href="https://osa-client.web.app/login"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 px-8 py-3 rounded-xl text-lg font-semibold"
          >
            Access Client Portal
            <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
