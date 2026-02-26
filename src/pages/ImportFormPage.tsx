import { motion } from 'framer-motion';
import { FileSpreadsheet, ClipboardCopy, Download, Upload, Construction } from 'lucide-react';

const formSections = [
  'Adjuster Information',
  'Agency Information',
  'Policy Information',
  'Insurer & Adjusting Firm',
  'Loss & Mailing Addresses',
  'Claim Dates',
  'Coverage Details',
  'Rating Information',
];

const actionButtons = [
  { label: 'Copy to Clipboard', icon: ClipboardCopy, color: 'bg-[var(--color-surf)]' },
  { label: 'Download JSON', icon: Download, color: 'bg-[var(--color-gold)]' },
  { label: 'Download XACT Tokenized JSON', icon: Download, color: 'bg-[var(--color-success)]' },
];

export default function ImportFormPage(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="w-8 h-8 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            JSON Data Form <span className="text-gradient">OSA</span>
          </h1>
          <p className="text-lg text-[var(--color-mist)] max-w-2xl mx-auto">
            Import flood claim data into the One Stop Adjuster system. Fill out the form
            or upload a DOCX file to generate structured JSON for back-office processing.
          </p>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          className="glass rounded-2xl p-6 mb-10 border border-[var(--color-gold)]/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Construction className="w-5 h-5 text-[var(--color-gold)]" />
            <span className="font-semibold text-[var(--color-gold)]">Coming Soon</span>
          </div>
          <p className="text-sm text-[var(--color-mist)]">
            This form is being rebuilt for the new platform. In the meantime, you can use the{' '}
            <a
              href="https://www.one-stop-adjuster.com/v2import-form"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-surf)] hover:text-white underline"
            >
              current import form
            </a>.
          </p>
        </motion.div>

        {/* Mockup Screenshot */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass rounded-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-wave)]/20 bg-[var(--color-deep)]/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[var(--color-ocean)]/30 rounded-lg px-3 py-1 text-xs text-[var(--color-mist)] text-center">
                  one-stop-adjuster.com/v2import-form
                </div>
              </div>
            </div>
            {/* Screenshot */}
            <div className="relative">
              <img
                src="/mockups/import-form-full.png"
                alt="Import Form - JSON Data Form OSA"
                className="w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-deep)]/80 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Form Sections Overview */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Form Sections</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {formSections.map((section, i) => (
              <motion.div
                key={section}
                className="glass rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              >
                <span className="text-xs font-mono text-[var(--color-gold)] mb-1 block">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium">{section}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Export Actions Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Export Options</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {actionButtons.map((btn) => (
              <div
                key={btn.label}
                className="glass rounded-xl p-5 text-center opacity-60"
              >
                <div className={`w-10 h-10 rounded-lg ${btn.color}/20 flex items-center justify-center mx-auto mb-3`}>
                  <btn.icon className="w-5 h-5 text-[var(--color-mist)]" />
                </div>
                <span className="text-sm font-medium text-[var(--color-mist)]">{btn.label}</span>
              </div>
            ))}
          </div>

          {/* DOCX Upload Preview */}
          <div className="glass rounded-xl p-6 text-center opacity-60">
            <Upload className="w-8 h-8 text-[var(--color-mist)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--color-mist)] mb-1">DOCX Upload</p>
            <p className="text-xs text-[var(--color-mist)]/70">
              Upload a Word document to auto-extract claim data and convert to OSA JSON format
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
