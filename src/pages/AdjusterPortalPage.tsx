import { motion } from 'framer-motion';
import {
  UserCheck, ClipboardList, MapPin, FileBarChart, BarChart3,
  LayoutDashboard, CheckSquare, MessageSquare, Calendar, Clock,
  AlertCircle, TrendingUp, Inbox,
} from 'lucide-react';

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
                  osa-adjuster.web.app/dashboard
                </div>
              </div>
            </div>

            {/* App Layout */}
            <div className="flex min-h-[540px]">
              {/* Sidebar */}
              <div className="hidden sm:flex w-[160px] flex-col border-r border-white/10 bg-[#0d1829] p-3">
                <div className="mb-4 px-2">
                  <div className="text-white text-xs font-semibold">Jeremy Isenburg</div>
                  <div className="text-[9px] text-white/30">Field Adjuster</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#4db8d4]/15 text-[#4db8d4] text-[11px] font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Tasks
                    <span className="ml-auto text-[8px] bg-amber-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">5</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Claims
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    Planning
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Messages
                    <span className="ml-auto text-[8px] bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">3</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 space-y-3 overflow-hidden">
                {/* Pipeline Status Bar */}
                <div className="flex rounded-lg overflow-hidden h-7">
                  <div className="bg-[#4db8d4] flex-[3] flex items-center justify-center text-[9px] font-bold text-white">
                    3 <span className="ml-1 hidden sm:inline">Contact</span>
                  </div>
                  <div className="bg-[#1a9b7a] flex-[6] flex items-center justify-center text-[9px] font-bold text-white">
                    6 <span className="ml-1 hidden sm:inline">Inspection</span>
                  </div>
                  <div className="bg-amber-500 flex-[4] flex items-center justify-center text-[9px] font-bold text-white">
                    4 <span className="ml-1 hidden sm:inline">Prelim</span>
                  </div>
                  <div className="bg-orange-500 flex-[3] flex items-center justify-center text-[9px] font-bold text-white">
                    3 <span className="ml-1 hidden sm:inline">Final</span>
                  </div>
                </div>

                {/* Revisions Needed */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white text-[11px] font-semibold">Revisions Needed</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">2</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                      <div>
                        <div className="text-white text-[10px] font-medium">David Williams</div>
                        <div className="text-[9px] text-white/30">additional photos of foundation damage and revised measurements</div>
                        <div className="text-[8px] text-white/20">CLM-CDR-028 &middot; Fairhope, AL</div>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 whitespace-nowrap">Preliminary Report</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                      <div>
                        <div className="text-white text-[10px] font-medium">Kevin Anderson</div>
                        <div className="text-[9px] text-white/30">additional elevation documentation and FIRM status verification</div>
                        <div className="text-[8px] text-white/20">CLM-CDR-017 &middot; Mount Vernon, AL</div>
                      </div>
                      <span className="text-[8px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 whitespace-nowrap">Preliminary Report</span>
                    </div>
                  </div>
                </div>

                {/* Claims Aging */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-white text-[11px] font-semibold">Claims Aging</span>
                    <span className="text-[9px] text-[#4db8d4]">13 active</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: '0-3d', value: 0, width: '0%', color: 'bg-emerald-500' },
                      { label: '4-7d', value: 0, width: '0%', color: 'bg-[#4db8d4]' },
                      { label: '8-14d', value: 0, width: '0%', color: 'bg-amber-500' },
                      { label: '15d+', value: 13, width: '100%', color: 'bg-red-500' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <span className="text-[9px] text-white/40 w-8">{row.label}</span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: row.width }} />
                        </div>
                        <span className="text-[9px] text-white/50 w-4 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SLA Trend + Today's Progress */}
                <div className="grid grid-cols-2 gap-3">
                  {/* SLA Trend */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-white text-[10px] font-semibold">SLA Trend</span>
                      </div>
                      <span className="text-[9px] text-emerald-400">61% today</span>
                    </div>
                    {/* Mini chart */}
                    <div className="flex items-end gap-0.5 h-10">
                      {[40, 45, 50, 48, 52, 55, 61].map((val, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#4db8d4]/60 rounded-t"
                          style={{ height: `${val * 0.6}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1 text-[7px] text-white/20">
                      <span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Today</span>
                    </div>
                  </div>

                  {/* Today's Progress */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-1.5 mb-3">
                      <CheckSquare className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-white text-[10px] font-semibold">Today's Progress</span>
                    </div>
                    <div className="flex items-center justify-around">
                      {[
                        { pct: 38, label: 'Tasks', color: '#1a9b7a' },
                        { pct: 0, label: 'Docs', color: '#4db8d4' },
                        { pct: 69, label: 'Replied', color: '#4db8d4' },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center">
                          <div className="relative w-9 h-9">
                            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="14" fill="none"
                                stroke={item.color}
                                strokeWidth="3"
                                strokeDasharray={`${item.pct * 0.88} 88`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">{item.pct}%</span>
                          </div>
                          <span className="text-[8px] text-white/40 mt-1">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inbox Health */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Inbox className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-white text-[11px] font-semibold">Inbox Health</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">4 pending</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-emerald-400">7h</div>
                      <div className="text-[8px] text-white/40">avg wait</div>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-emerald-400">0</div>
                      <div className="text-[8px] text-white/40">overdue</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {[
                      { name: 'Jennifer Adams', msg: 'When will the adjuster visit? Need to plan around work', time: '14h', avatar: 'JA' },
                      { name: 'Claims Manager', msg: 'Please update the reserve estimate for this claim', time: '3h', avatar: 'CM' },
                      { name: 'David Williams', msg: 'Uploaded additional photos — requesting review', time: '5h', avatar: 'DW' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#1a7a9b] flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0">{item.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white text-[10px] font-medium">{item.name}</span>
                            {item.name === 'Claims Manager' && (
                              <span className="text-[7px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">New</span>
                            )}
                          </div>
                          <div className="text-[9px] text-white/30 truncate">{item.msg}</div>
                        </div>
                        <span className="text-[9px] text-white/30 flex-shrink-0">{item.time}</span>
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
            Access Adjuster Portal
          </button>
        </motion.div>
      </div>
    </section>
  );
}
