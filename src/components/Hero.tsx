import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Cloud, Shield } from 'lucide-react';
import logoSvg from '../assets/logos/logo.svg';

export default function Hero() {
  return (
    <section className="relative gradient-mesh overflow-hidden pb-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-[var(--color-surf)] opacity-10 blur-3xl"
          style={{ top: '10%', right: '10%' }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-[var(--color-gold)] opacity-10 blur-3xl"
          style={{ bottom: '20%', left: '5%' }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(123, 184, 224, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(123, 184, 224, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative z-10 pt-24">
        {/* Centered Logo + Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={logoSvg}
            alt="One Stop Adjuster"
            className="w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-full mx-auto mb-6 glow-blue"
          />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            One Stop Adjuster
          </h2>
          <p className="text-[var(--color-mist)] text-lg max-w-xl mx-auto">
            Streamline your claims workflow with cutting-edge software solutions designed for insurance professionals
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-sm text-[var(--color-mist)]">
                Trusted by adjusters nationwide
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="block">Flood Adjusting</span>
              <span className="text-gradient">Simplified</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl text-[var(--color-mist)] mb-8 max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              The all-in-one platform built for field work. Close claims faster,
              reduce errors, and spend more time serving policyholders.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <a href="#demo-form" className="btn-primary inline-flex items-center justify-center gap-2">
                Request a Demo
                <ArrowRight size={18} />
              </a>
              <a href="#features" className="btn-secondary inline-flex items-center justify-center gap-2">
                See How It Works
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {[
                { value: '50%', label: 'Faster Claims' },
                { value: '100%', label: 'NFIP Compliant' },
                { value: '24/7', label: 'Field Access' },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-[var(--color-gold)]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--color-mist)]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* App Preview - Phone + iPad */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative mx-auto" style={{ maxWidth: '560px' }}>
              {/* iPad mockup - dominant device, behind and to the left */}
              <div className="absolute -left-4 top-0 w-[72%] z-0">
                <div className="bg-[var(--color-deep)] rounded-[1.5rem] p-2 glow-blue">
                  <div className="bg-[var(--color-abyss)] rounded-[1.2rem] overflow-hidden aspect-[3/4]">
                    <div className="h-full bg-gradient-to-b from-[var(--color-deep)] to-[var(--color-abyss)] p-3 flex flex-col">
                      {/* Top bar - OSA logo + user + Claim Data button */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-surf)] to-[var(--color-ocean)] flex items-center justify-center shrink-0">
                            <span className="text-[4px] font-bold text-white">OSA</span>
                          </div>
                          <div>
                            <div className="text-[8px] font-semibold leading-tight">Kolby Isenburg</div>
                            <div className="text-[6px] text-[var(--color-mist)]/60">Date of Loss: 10/02/2023</div>
                          </div>
                        </div>
                        <div className="px-1.5 py-0.5 rounded bg-[var(--color-surf)]/20 text-[6px] text-[var(--color-surf)] font-medium">Claim Data</div>
                      </div>

                      {/* Search bar */}
                      <div className="glass rounded-md px-2 py-1 mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full border border-[var(--color-mist)]/40" />
                        <span className="text-[6px] text-[var(--color-mist)]/50">Search Policyholder Name/Claim Number</span>
                      </div>

                      {/* Nav tabs - horizontal (rotated from sidebar) */}
                      <div className="flex gap-1 mb-2">
                        <div className="px-2 py-1 rounded bg-[var(--color-surf)]/20 text-[6px] text-[var(--color-surf)] font-medium">Dashboard</div>
                        <div className="px-2 py-1 rounded text-[6px] text-[var(--color-mist)]/50">Claims</div>
                        <div className="px-2 py-1 rounded text-[6px] text-[var(--color-mist)]/50">Training</div>
                        <div className="px-2 py-1 rounded text-[6px] text-[var(--color-mist)]/50">Forms</div>
                      </div>

                      {/* Column headers */}
                      <div className="grid grid-cols-[1fr_54px_48px_48px] gap-1 mb-1 px-1">
                        <span className="text-[6px] text-[var(--color-mist)]/60 font-medium">Policyholder</span>
                        <span className="text-[6px] text-[var(--color-mist)]/60 font-medium">Status</span>
                        <span className="text-[6px] text-[var(--color-mist)]/60 font-medium">Contact</span>
                        <span className="text-[6px] text-[var(--color-mist)]/60 font-medium">Inspect.</span>
                      </div>

                      {/* Claim rows */}
                      <div className="space-y-1.5 flex-1 overflow-hidden">
                        {[
                          { name: 'Charles Harris', id: '7230619347', status: 'Submitted', sColor: 'var(--color-success)', contact: 'Left Msg', cColor: 'var(--color-gold)', inspect: 'Completed', iColor: 'var(--color-success)' },
                          { name: 'Edgar Custodio', id: 'F216602025...', status: 'In Progress', sColor: 'var(--color-gold)', contact: 'Contacted', cColor: 'var(--color-surf)', inspect: 'Scheduled', iColor: 'var(--color-mist)' },
                          { name: 'Kolby Isenburg', id: '1298237834', status: 'Closed', sColor: '#ef4444', contact: 'Contacted', cColor: 'var(--color-surf)', inspect: 'Scheduled', iColor: 'var(--color-mist)' },
                          { name: 'Marcus Taylor', id: '6070809020', status: 'Assigned', sColor: 'var(--color-mist)', contact: 'Contacted', cColor: 'var(--color-surf)', inspect: 'Scheduled', iColor: 'var(--color-mist)' },
                        ].map((claim) => (
                          <div key={claim.name} className="glass rounded-lg p-1.5 grid grid-cols-[1fr_54px_48px_48px] gap-1 items-center">
                            <div className="min-w-0">
                              <div className="text-[7px] font-medium truncate">{claim.name}</div>
                              <div className="text-[5px] text-[var(--color-mist)]/50 truncate">{claim.id}</div>
                            </div>
                            <div>
                              <span className="inline-block text-[5px] px-1 py-0.5 rounded-full font-medium" style={{ backgroundColor: `color-mix(in srgb, ${claim.sColor} 20%, transparent)`, color: claim.sColor }}>
                                {claim.status}
                              </span>
                            </div>
                            <div>
                              <span className="inline-block text-[5px] px-1 py-0.5 rounded-full font-medium" style={{ backgroundColor: `color-mix(in srgb, ${claim.cColor} 20%, transparent)`, color: claim.cColor }}>
                                {claim.contact}
                              </span>
                            </div>
                            <div>
                              <span className="inline-block text-[5px] px-1 py-0.5 rounded-full font-medium" style={{ backgroundColor: `color-mix(in srgb, ${claim.iColor} 20%, transparent)`, color: claim.iColor }}>
                                {claim.inspect}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone mockup - smaller, in front, overlapping right side */}
              <div className="relative ml-auto w-[38%] z-10 mt-8">
                <div className="relative bg-[var(--color-deep)] rounded-[2.5rem] p-2.5 glow-blue">
                  <div className="bg-[var(--color-abyss)] rounded-[2rem] overflow-hidden aspect-[9/19]">
                    <div className="h-full bg-gradient-to-b from-[var(--color-deep)] to-[var(--color-abyss)] p-3">
                      {/* Status bar */}
                      <div className="flex justify-between items-center text-[10px] text-[var(--color-mist)] mb-3">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-3.5 h-1.5 border border-[var(--color-mist)] rounded-sm">
                            <div className="w-3/4 h-full bg-[var(--color-success)]" />
                          </div>
                        </div>
                      </div>

                      {/* App header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-[var(--color-mist)]">Welcome back</p>
                          <p className="text-sm font-semibold">John Smith</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-wave)] flex items-center justify-center text-xs font-bold">
                          JS
                        </div>
                      </div>

                      {/* Active claims card */}
                      <div className="glass rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Active Claims</span>
                          <span className="text-xl font-bold text-[var(--color-gold)]">12</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)]">
                            3 Ready
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
                            5 In Progress
                          </span>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: '📋', label: 'New Claim' },
                          { icon: '📸', label: 'Photos' },
                          { icon: '✏️', label: 'Scope Notes' },
                          { icon: '📄', label: 'Forms' },
                        ].map((action) => (
                          <div
                            key={action.label}
                            className="glass rounded-lg p-2 text-center"
                          >
                            <div className="text-lg mb-0.5">{action.icon}</div>
                            <div className="text-[10px] text-[var(--color-mist)]">{action.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notch */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[var(--color-abyss)] rounded-full" />
                </div>
              </div>

              {/* Floating feature cards */}
              <motion.div
                className="absolute -left-12 top-[15%] glass rounded-lg p-3 flex items-center gap-2 z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Smartphone className="w-5 h-5 text-[var(--color-surf)]" />
                <span className="text-xs whitespace-nowrap">iPhone + iPad</span>
              </motion.div>

              <motion.div
                className="absolute -right-4 top-1/2 glass rounded-lg p-3 flex items-center gap-2 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <Cloud className="w-5 h-5 text-[var(--color-gold)]" />
                <span className="text-xs whitespace-nowrap">Cloud Sync</span>
              </motion.div>

              <motion.div
                className="absolute -left-8 bottom-[20%] glass rounded-lg p-3 flex items-center gap-2 z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              >
                <Shield className="w-5 h-5 text-[var(--color-success)]" />
                <span className="text-xs whitespace-nowrap">NFIP Ready</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-abyss)] to-transparent" />
    </section>
  );
}
