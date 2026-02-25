import { motion } from 'framer-motion';
import {
  Users, CheckCircle, FileText, MessageSquare, Bell, ExternalLink,
  LayoutDashboard, Search, Filter, MapPin, Camera, FileCheck, ChevronRight,
  MoreHorizontal, Eye,
} from 'lucide-react';

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

        {/* Browser Mockup */}
        <motion.div
          className="flex flex-col items-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="w-full max-w-4xl rounded-xl border border-[var(--color-wave)]/20 bg-[#0a1628] shadow-2xl shadow-black/40 overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#060d1a] border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/10 rounded-md px-3 py-1 text-[11px] text-white/40 text-center">
                  osa-client.web.app/dashboard
                </div>
              </div>
            </div>

            {/* App Layout */}
            <div className="flex min-h-[420px]">
              {/* Sidebar */}
              <div className="hidden sm:flex w-[180px] flex-col border-r border-white/10 bg-[#0d1829] p-3">
                <div className="flex items-center gap-2 mb-6 px-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1a7a9b] to-[#0d4f6a] flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">OSA</span>
                  </div>
                  <span className="text-white text-xs font-semibold">Client Manager</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#4db8d4]/15 text-[#4db8d4] text-[11px] font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    All Claims
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <Users className="w-3.5 h-3.5" />
                    Members
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Messages
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    Reports
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-white/10 px-2">
                  <div className="text-[10px] text-white/30">Acme Insurance Co.</div>
                  <div className="text-[10px] text-white/20">Client since 2023</div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-semibold">All Claims</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40">
                      <Search className="w-3 h-3" />
                      Search claims...
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40">
                      <Filter className="w-3 h-3" />
                      Filter
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                    <p className="text-lg font-bold text-[#4db8d4]">12</p>
                    <p className="text-[9px] text-white/40">Total Claims</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                    <p className="text-lg font-bold text-emerald-400">5</p>
                    <p className="text-[9px] text-white/40">In Progress</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                    <p className="text-lg font-bold text-amber-400">3</p>
                    <p className="text-[9px] text-white/40">Under Review</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                    <p className="text-lg font-bold text-white/60">4</p>
                    <p className="text-[9px] text-white/40">Completed</p>
                  </div>
                </div>

                {/* Claims Table */}
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-white/10 text-[9px] text-white/40 uppercase tracking-wider font-medium">
                    <div className="col-span-3">Claim #</div>
                    <div className="col-span-3">Location</div>
                    <div className="col-span-2">Adjuster</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 items-center hover:bg-white/5">
                    <div className="col-span-3">
                      <span className="text-white text-[11px] font-medium">CLM-2024-0847</span>
                      <div className="text-[9px] text-white/30">Wind Damage</div>
                    </div>
                    <div className="col-span-3 flex items-center gap-1 text-[10px] text-white/50">
                      <MapPin className="w-3 h-3" />
                      Spanish Fort, AL
                    </div>
                    <div className="col-span-2 text-[10px] text-white/50">J. Isenburg</div>
                    <div className="col-span-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">In Progress</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <Camera className="w-3 h-3" /><span>24</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <FileCheck className="w-3 h-3" /><span>3/5</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 items-center hover:bg-white/5">
                    <div className="col-span-3">
                      <span className="text-white text-[11px] font-medium">CLM-2024-0832</span>
                      <div className="text-[9px] text-white/30">Water Damage</div>
                    </div>
                    <div className="col-span-3 flex items-center gap-1 text-[10px] text-white/50">
                      <MapPin className="w-3 h-3" />
                      Daphne, AL
                    </div>
                    <div className="col-span-2 text-[10px] text-white/50">T. Richards</div>
                    <div className="col-span-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Inspection</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <Camera className="w-3 h-3" /><span>12</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <FileCheck className="w-3 h-3" /><span>1/5</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 items-center hover:bg-white/5">
                    <div className="col-span-3">
                      <span className="text-white text-[11px] font-medium">CLM-2024-0819</span>
                      <div className="text-[9px] text-white/30">Hail Damage</div>
                    </div>
                    <div className="col-span-3 flex items-center gap-1 text-[10px] text-white/50">
                      <MapPin className="w-3 h-3" />
                      Fairhope, AL
                    </div>
                    <div className="col-span-2 text-[10px] text-white/50">J. Isenburg</div>
                    <div className="col-span-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">Review</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <Camera className="w-3 h-3" /><span>31</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <FileCheck className="w-3 h-3" /><span>5/5</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 items-center hover:bg-white/5">
                    <div className="col-span-3">
                      <span className="text-white text-[11px] font-medium">CLM-2024-0805</span>
                      <div className="text-[9px] text-white/30">Fire Damage</div>
                    </div>
                    <div className="col-span-3 flex items-center gap-1 text-[10px] text-white/50">
                      <MapPin className="w-3 h-3" />
                      Mobile, AL
                    </div>
                    <div className="col-span-2 text-[10px] text-white/50">S. Martinez</div>
                    <div className="col-span-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">In Progress</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <Camera className="w-3 h-3" /><span>18</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] text-white/30">
                        <FileCheck className="w-3 h-3" /><span>2/5</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </div>
                  </div>

                  {/* Row 5 - faded */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center opacity-50">
                    <div className="col-span-3">
                      <span className="text-white text-[11px] font-medium">CLM-2024-0791</span>
                      <div className="text-[9px] text-white/30">Flood Damage</div>
                    </div>
                    <div className="col-span-3 flex items-center gap-1 text-[10px] text-white/50">
                      <MapPin className="w-3 h-3" />
                      Foley, AL
                    </div>
                    <div className="col-span-2 text-[10px] text-white/50">T. Richards</div>
                    <div className="col-span-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium">Complete</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3 text-white/20" />
                      <MoreHorizontal className="w-3 h-3 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
