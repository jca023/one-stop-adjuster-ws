import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Import Claims',
    description:
      'Import claim information from various sources directly into your dashboard. Sync with your firm\'s CMS and view loss locations on a map.',
    features: ['Import from multiple sources', 'Sync with firm CMS', 'Map-based claim locations'],
  },
  {
    number: '02',
    title: 'Conduct Inspection',
    description:
      'Room-type templates make scope notes a breeze. Capture photos, record voice notes, and sketch floor plans using your camera.',
    features: ['Room-type scope templates', 'Voice-recorded notes', 'Sketch with camera'],
  },
  {
    number: '03',
    title: 'Complete Forms',
    description:
      'All NFIP required forms are pre-filled with claim data. Adjusters and policyholders can sign forms on-site within the app.',
    features: ['Pre-filled NFIP forms', 'On-site digital signatures', 'Field validation'],
  },
  {
    number: '04',
    title: 'Report & Share',
    description:
      'Upload reports to your CMS and share with desk adjusters and examiners. Works completely offline in the field.',
    features: ['Upload reports to CMS', 'Share with desk adjusters', 'Works fully offline'],
  },
];

function StepCard({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <div className="flex gap-6 lg:gap-8">
        {/* Step number and line */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center text-[var(--color-abyss)] font-bold text-lg shrink-0">
            {step.number}
          </div>
          {!isLast && (
            <div className="flex-1 w-px bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-wave)] my-4" />
          )}
        </div>

        {/* Content */}
        <div className={`pb-12 ${isLast ? '' : ''}`}>
          <h3 className="text-xl lg:text-2xl font-semibold mb-3">{step.title}</h3>
          <p className="text-[var(--color-mist)] mb-4 max-w-md">{step.description}</p>

          {/* Feature list */}
          <ul className="space-y-2">
            {step.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                <span className="text-[var(--color-foam)]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative bg-[var(--color-deep)]/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left side - Header and visual */}
          <div className="lg:sticky lg:top-32">
            <div ref={headerRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  From Inspection to{' '}
                  <span className="text-gradient">Submission</span>
                </h2>
                <p className="text-lg text-[var(--color-mist)] mb-8 max-w-lg">
                  A streamlined workflow that eliminates duplication, reduces errors,
                  and lets you focus on what matters—serving policyholders.
                </p>
              </motion.div>

              {/* Visual representation - workflow diagram */}
              <motion.div
                className="hidden lg:block glass rounded-2xl p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="aspect-video relative">
                  {/* Simplified workflow visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      {['Import', 'Inspect', 'Document', 'Report'].map((label, i) => (
                        <div key={label} className="flex items-center gap-4">
                          <div className="text-center">
                            <div
                              className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 mx-auto"
                              style={{
                                background: `linear-gradient(135deg, var(--color-${
                                  i === 0 ? 'surf' : i === 1 ? 'gold' : i === 2 ? 'success' : 'foam'
                                })20, transparent)`,
                                border: `1px solid var(--color-${
                                  i === 0 ? 'surf' : i === 1 ? 'gold' : i === 2 ? 'success' : 'foam'
                                })40`,
                              }}
                            >
                              <span className="text-2xl">
                                {i === 0 ? '📋' : i === 1 ? '🔍' : i === 2 ? '📝' : '✅'}
                              </span>
                            </div>
                            <span className="text-xs text-[var(--color-mist)]">{label}</span>
                          </div>
                          {i < 3 && (
                            <ArrowRight className="w-4 h-4 text-[var(--color-wave)]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right side - Steps */}
          <div>
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
