import { motion } from 'framer-motion';

interface PageShellProps {
  title: string;
  subtitle?: string;
}

export default function PageShell({ title, subtitle }: PageShellProps): React.JSX.Element {
  return (
    <section className="pt-32 pb-20 min-h-screen">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto"
        >
          <p className="text-[var(--color-mist)]">
            This page is coming soon. Check back for updates.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
