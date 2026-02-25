import { motion } from 'framer-motion';
import {
  Smartphone, Star, Download, Users, LayoutDashboard, Map,
  Camera, ClipboardCheck, List, Package, FileText,
  MapPin, FileCheck, ChevronRight, Wifi, Battery, Signal,
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

        {/* Phone Mockup + Download CTA */}
        <motion.div
          className="flex flex-col items-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Phone Frame */}
          <div className="relative w-[280px] h-[560px] rounded-[40px] border-[3px] border-[var(--color-wave)]/30 bg-[#0a1628] shadow-2xl shadow-black/40 overflow-hidden mb-8">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-20" />

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-2 text-[10px] text-white/60 relative z-10">
              <span>12:21</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* App Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a7a9b] to-[#0d4f6a] flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">OSA</span>
              </div>
              <span className="text-white text-sm font-semibold">One Stop Adjuster</span>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-white/10">
              <div className="flex-1 py-2 text-center text-[11px] text-[#4db8d4] border-b-2 border-[#4db8d4] font-medium">Claims</div>
              <div className="flex-1 py-2 text-center text-[11px] text-white/40">Map</div>
              <div className="flex-1 py-2 text-center text-[11px] text-white/40">Photos</div>
              <div className="flex-1 py-2 text-center text-[11px] text-white/40">Forms</div>
            </div>

            {/* Claims List */}
            <div className="px-3 py-3 space-y-2.5 overflow-hidden">
              {/* Claim Card 1 */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-xs font-semibold">CLM-2024-0847</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">In Progress</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>Spanish Fort, AL</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-white/40">
                      <Camera className="w-3 h-3" />
                      <span>24</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40">
                      <FileCheck className="w-3 h-3" />
                      <span>3/5</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                </div>
              </div>

              {/* Claim Card 2 */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-xs font-semibold">CLM-2024-0832</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Inspection</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>Daphne, AL</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-white/40">
                      <Camera className="w-3 h-3" />
                      <span>12</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40">
                      <FileCheck className="w-3 h-3" />
                      <span>1/5</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                </div>
              </div>

              {/* Claim Card 3 */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-xs font-semibold">CLM-2024-0819</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">Review</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-[10px] mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>Fairhope, AL</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-white/40">
                      <Camera className="w-3 h-3" />
                      <span>31</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40">
                      <FileCheck className="w-3 h-3" />
                      <span>5/5</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                </div>
              </div>

              {/* Claim Card 4 - partially visible */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 opacity-60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-xs font-semibold">CLM-2024-0805</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">In Progress</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-[10px]">
                  <MapPin className="w-3 h-3" />
                  <span>Mobile, AL</span>
                </div>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 inset-x-0 flex justify-around py-2 bg-[#0a1628] border-t border-white/10">
              <div className="flex flex-col items-center gap-0.5">
                <LayoutDashboard className="w-4 h-4 text-[#4db8d4]" />
                <span className="text-[8px] text-[#4db8d4]">Claims</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Map className="w-4 h-4 text-white/30" />
                <span className="text-[8px] text-white/30">Map</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Camera className="w-4 h-4 text-white/30" />
                <span className="text-[8px] text-white/30">Photos</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <FileText className="w-4 h-4 text-white/30" />
                <span className="text-[8px] text-white/30">Forms</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <a
            href="https://apps.apple.com/us/app/one-stop-adjuster/id6449554280"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-deep)] hover:bg-[var(--color-ocean)] text-white font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Download for iOS
          </a>
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
