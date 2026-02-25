import { motion } from 'framer-motion';
import { Shield, Lock, Key, Gauge } from 'lucide-react';

export default function SecurityPage(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
            <span className="text-gradient">Security and Privacy Guidelines</span>
          </h1>
          <p className="text-[var(--color-mist)] text-center mb-12">
            Exhibit A
          </p>

          <div className="prose-legal space-y-6 text-[var(--color-mist)] leading-relaxed">
            <div className="glass rounded-2xl p-6 mb-8">
              <p className="text-[var(--color-pearl)] m-0">
                Each party shall establish, maintain, and on a regular basis improve its safeguards and controls
                against the destruction, loss or alteration of Toremy LLC Property or Client Data. Below Toremy
                LLC's security and privacy guidelines are described and you agree to follow similar guidelines in
                your systems.
              </p>
            </div>

            <p>
              Toremy LLC's application prioritizes security and privacy by implementing a range of robust
              measures to protect user data and ensure compliance with industry standards.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              Compliance and Certifications
            </h2>
            <p>
              Toremy LLC adheres to the highest standards of data security and privacy, complying with
              SOC 1, SOC 2, and SOC 3 as well as ISO 27001, ISO 27017, and ISO 27018 certifications.
              These standards guarantee that we follow best practices for managing user data securely
              and responsibly.
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-8">
              <div className="glass rounded-2xl p-5">
                <h4 className="font-bold text-[var(--color-foam)] mb-2">SOC Compliance</h4>
                <ul className="space-y-1 text-sm">
                  <li>SOC 1</li>
                  <li>SOC 2</li>
                  <li>SOC 3</li>
                </ul>
              </div>
              <div className="glass rounded-2xl p-5">
                <h4 className="font-bold text-[var(--color-foam)] mb-2">ISO Certifications</h4>
                <ul className="space-y-1 text-sm">
                  <li>ISO 27001</li>
                  <li>ISO 27017</li>
                  <li>ISO 27018</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              Data Protection
            </h2>
            <p>
              Toremy LLC utilizes secure, access-controlled APIs that are key restricted and rate limited
              to mitigate the risk of denial-of-service (DoS) attacks. All interactions with our backend
              are conducted over HTTPS, ensuring encrypted communication and protecting data integrity
              during transmission.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              Access Control
            </h2>
            <p>
              Access to Toremy LLC's database is strictly controlled. Only authorized personnel can access
              sensitive information, and all access attempts are logged and monitored. Toremy LLC enforces
              access controls for every database interaction, ensuring that data is only accessible to users
              with the necessary permissions.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              Encryption
            </h2>
            <p>
              Data is encrypted end-to-end, from the moment it is captured to when it is stored in Toremy
              LLC's databases. This ensures that sensitive information remains protected throughout its
              lifecycle, preventing unauthorized access and data breaches.
            </p>

            <h2 className="text-2xl font-bold text-[var(--color-foam)] mt-10 mb-4">
              API Security
            </h2>
            <p>
              Toremy LLC's APIs are designed with security in mind. They are:
            </p>

            <div className="space-y-4 my-6">
              <div className="glass rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[var(--color-surf)]" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-foam)]">Access Controlled</span>
                  <p className="m-0 mt-1 text-sm">
                    Only authenticated and authorized requests can interact with our backend services.
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-[var(--color-surf)]" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-foam)]">API Key Restricted</span>
                  <p className="m-0 mt-1 text-sm">
                    Each API request requires a valid API key, which helps prevent unauthorized access.
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-5 h-5 text-[var(--color-surf)]" />
                </div>
                <div>
                  <span className="font-bold text-[var(--color-foam)]">Rate Limited</span>
                  <p className="m-0 mt-1 text-sm">
                    To protect against DoS attacks, we limit the number of API requests that can be made
                    within a certain timeframe.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 mt-10">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-[var(--color-gold)]" />
                <span className="font-bold text-[var(--color-pearl)]">Our Commitment</span>
              </div>
              <p className="m-0">
                These measures collectively ensure that Toremy LLC's application maintains a high standard of
                security and privacy, safeguarding user data against potential threats and ensuring compliance
                with recognized industry standards.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
