import { motion } from 'framer-motion';
import {
  Smartphone, Star, Download, Users, LayoutDashboard, Map,
  Camera, ClipboardCheck, List, Package, FileText,
} from 'lucide-react';

const highlights = [
  { icon: Smartphone, title: 'Work Offline, Sync Online', description: 'Continue working even without internet connection. All changes sync automatically when you\'re back online.' },
  { icon: Star, title: 'Intuitive Interface', description: 'Designed for ease of use with a clean, modern interface that requires minimal training.' },
  { icon: Download, title: 'Regular Updates', description: 'Continuous improvements and new features based on user feedback and industry needs.' },
  { icon: Users, title: 'Multi-User Support', description: 'Perfect for teams with role-based permissions and seamless collaboration features.' },
];

const modules = [
  {
    icon: LayoutDashboard,
    title: 'Claim Dashboard',
    bullets: ['Real-time claim status updates', 'Quick access to claim details', 'Assignment tracking and history', 'Task management and reminders', 'Performance metrics at a glance'],
  },
  {
    icon: Map,
    title: 'Map & Schedule',
    bullets: ['GPS-enabled route optimization', 'Interactive claim location mapping', 'Appointment scheduling and coordination', 'Calendar integration and sync', 'Distance and travel time estimates'],
  },
  {
    icon: Camera,
    title: 'Photos',
    bullets: ['High-resolution photo capture', 'AI-powered auto-labeling', 'Room-by-room organization', 'Annotation and markup tools', 'Instant cloud sync and backup'],
  },
  {
    icon: ClipboardCheck,
    title: 'Inspection',
    bullets: ['Photo capture with annotations', 'Voice-to-text field notes', 'Digital sketches and measurements', 'Damage assessment templates', 'Automatic photo organization'],
  },
  {
    icon: List,
    title: 'Line Items',
    bullets: ['Xactimate pricing integration', 'Room-based line item entry', 'Quick-add from saved templates', 'Real-time RCV/ACV calculations', 'Export to estimating software'],
  },
  {
    icon: Package,
    title: 'Contents',
    bullets: ['Barcode and QR code scanning', 'Item inventory management', 'Photo cataloging per item', 'Valuation and pricing tools', 'Replacement cost estimates'],
  },
  {
    icon: FileText,
    title: 'Forms',
    bullets: ['Digital signature capture', 'Customizable form templates', 'Auto-fill and data validation', 'Offline form completion', 'Instant PDF generation and export'],
  },
];

const stats = [
  { value: '300%', label: 'Productivity Increase' },
  { value: '48hrs', label: 'Average Claim Resolution' },
  { value: '95%', label: 'Customer Satisfaction' },
  { value: '24/7', label: 'Support Available' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MobileAppPage(): React.JSX.Element {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">All Your Tools in Your Pocket</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Take your entire claims operation mobile with our iOS and Android app
          </p>
        </motion.div>

        {/* Key Highlights */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {highlights.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-[var(--color-surf)]" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-[var(--color-mist)] text-sm">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Feature Modules</span>
          </h2>
          <p className="text-[var(--color-mist)] max-w-xl mx-auto">
            Seven powerful modules that cover every aspect of field claims work
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6 group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-ocean)]/20 flex items-center justify-center mb-4 group-hover:bg-[var(--color-gold)]/20 transition-colors">
                <mod.icon className="w-5 h-5 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
              </div>
              <h3 className="font-semibold mb-3">{mod.title}</h3>
              <ul className="space-y-1.5">
                {mod.bullets.map((bullet) => (
                  <li key={bullet} className="text-[var(--color-mist)] text-sm flex items-start gap-2">
                    <span className="text-[var(--color-gold)] mt-1 text-xs">&#9679;</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="glass rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-gold)]">{stat.value}</p>
                <p className="text-[var(--color-mist)] text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
