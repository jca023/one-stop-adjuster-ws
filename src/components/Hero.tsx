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
                  <div className="rounded-[1.2rem] overflow-hidden aspect-[3/4]">
                    <img
                      src="/app-ipad.jpg"
                      alt="One Stop Adjuster iPad app — Photo Documentation module"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Phone mockup - smaller, in front, overlapping right side */}
              <div className="relative ml-auto w-[38%] z-10 mt-8">
                <div className="relative bg-[var(--color-deep)] rounded-[2.5rem] p-2.5 glow-blue">
                  <div className="rounded-[2rem] overflow-hidden aspect-[9/19]">
                    <img
                      src="/app-iphone.jpg"
                      alt="One Stop Adjuster iPhone app — Sketching module"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
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
