import { motion } from 'framer-motion';
import {
  Briefcase, CheckCircle, Shield, FileText, MessageSquare,
  LayoutDashboard, Users, Camera, Image, Package, Clock,
  AlertTriangle, Upload, CalendarCheck, CheckCircle2, ArrowRight,
} from 'lucide-react';

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
                  osa-policyholder.web.app/dashboard
                </div>
              </div>
            </div>

            {/* App Layout */}
            <div className="flex min-h-[500px]">
              {/* Sidebar */}
              <div className="hidden sm:flex w-[160px] flex-col border-r border-white/10 bg-[#0d1829] p-3">
                <div className="mb-1 px-2">
                  <div className="text-white text-xs font-semibold">John Doe</div>
                  <div className="text-[9px] text-white/30">Policy #POL-2024-5678</div>
                </div>
                <div className="mb-4 px-2">
                  <div className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 inline-block">Under Review</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#4db8d4]/15 text-[#4db8d4] text-[11px] font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Messages
                    <span className="ml-auto text-[8px] bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <Users className="w-3.5 h-3.5" />
                    Members
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <Image className="w-3.5 h-3.5" />
                    Photos & Docs
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <Package className="w-3.5 h-3.5" />
                    Contents
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 space-y-4 overflow-hidden">
                {/* Welcome */}
                <div>
                  <h3 className="text-white text-sm font-semibold">Welcome back, John</h3>
                  <p className="text-[10px] text-white/40">Here's the latest on your claim</p>
                </div>

                {/* Claim Header */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#4db8d4] text-xs font-bold">CLM-2024-001</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Under Review</span>
                      </div>
                      <div className="text-[10px] text-white/50 mt-0.5">Wind Damage &middot; Submitted 2026-01-10</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#4db8d4]">$12,500</div>
                      <div className="text-[9px] text-white/40">Estimated Amount</div>
                    </div>
                  </div>

                  {/* Adjuster Info */}
                  <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-lg mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1a7a9b] flex items-center justify-center text-[8px] font-bold text-white">JI</div>
                      <div>
                        <div className="text-white text-[10px] font-medium">Jeremy Isenburg</div>
                        <div className="text-[9px] text-white/40">Your Adjuster &middot; (555) 234-5678</div>
                      </div>
                    </div>
                    <div className="text-[9px] px-2 py-1 rounded bg-[#4db8d4]/20 text-[#4db8d4]">Message</div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    {['Submitted', 'Under Review', 'Inspection', 'Assessment', 'Settlement'].map((step, i) => (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                            i < 2 ? 'bg-emerald-500 text-white' : i === 2 ? 'bg-[#4db8d4] text-white ring-2 ring-[#4db8d4]/30' : 'bg-white/10 text-white/30'
                          }`}>
                            {i < 2 ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                          </div>
                          <span className={`text-[8px] mt-1 ${i <= 2 ? 'text-white/70' : 'text-white/30'}`}>{step}</span>
                        </div>
                        {i < 4 && (
                          <div className={`flex-1 h-0.5 mx-1 rounded ${i < 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#4db8d4]" />
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div className="text-[9px] text-white/40 mt-0.5">Messages</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div className="text-[9px] text-white/40 mt-0.5">Photos/Docs</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div className="text-[9px] text-white/40 mt-0.5">Contractors</div>
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white text-[11px] font-semibold">Action Items</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">2 Urgent</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <div className="text-white text-[10px] font-medium">Sign Inspection Authorization <span className="text-[8px] px-1 py-0.5 rounded bg-red-500/20 text-red-400">Urgent</span></div>
                          <div className="text-[9px] text-white/30">Required before inspection can be scheduled</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 whitespace-nowrap">Sign Now</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5 text-[#4db8d4]" />
                        <div>
                          <div className="text-white text-[10px] font-medium">Upload Additional Roof Photos</div>
                          <div className="text-[9px] text-white/30">Requested by your adjuster</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-1 rounded bg-[#4db8d4]/20 text-[#4db8d4] whitespace-nowrap">Upload</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <div className="text-white text-[10px] font-medium">Confirm Inspection Date <span className="text-[8px] px-1 py-0.5 rounded bg-red-500/20 text-red-400">Urgent</span></div>
                          <div className="text-[9px] text-white/30">Scheduled for Jan 20, 2026 at 10:00 AM</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 whitespace-nowrap">Confirm</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-white text-[11px] font-semibold">Recent Activity</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { icon: MessageSquare, text: 'New message from adjuster', sub: 'Jeremy Isenburg sent you a message', time: '2 hours ago', color: 'text-[#4db8d4]' },
                      { icon: CheckCircle2, text: 'Claim status updated', sub: 'Your claim moved to "Under Review"', time: '1 day ago', color: 'text-emerald-400' },
                      { icon: Upload, text: 'Documents uploaded', sub: 'You uploaded 3 photos', time: '2 days ago', color: 'text-[#4db8d4]' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-1.5 border border-white/5">
                        <div className="flex items-center gap-2">
                          <item.icon className={`w-3 h-3 ${item.color}`} />
                          <div>
                            <div className="text-white text-[10px]">{item.text}</div>
                            <div className="text-[9px] text-white/30">{item.sub}</div>
                          </div>
                        </div>
                        <span className="text-[9px] text-white/30 whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
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
