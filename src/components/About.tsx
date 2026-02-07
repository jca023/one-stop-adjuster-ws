import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Target, Eye, Users, Linkedin } from 'lucide-react';

const team = [
  {
    name: 'Todd Isenburg',
    role: 'President & Co-Founder',
    bio: 'Over 20 years in insurance adjusting with extensive NFIP certifications. Former Force Reconnaissance Marine with a unique blend of military leadership and deep industry knowledge.',
    initials: 'TI',
    gradient: 'from-[var(--color-surf)] to-[var(--color-ocean)]',
  },
  {
    name: 'Jeremy Isenburg',
    role: 'CTO & Co-Founder',
    bio: 'Extensive experience from Amazon, Google, and Microsoft. Specializes in enterprise-scale systems and leads the technical vision for transforming flood claims management.',
    initials: 'JI',
    gradient: 'from-[var(--color-gold)] to-[var(--color-gold-dark)]',
  },
  {
    name: 'Keith Harris',
    role: 'VP of Product Development',
    bio: '12 years as an insurance adjuster with natural talent for user experience design. Transforms real-world adjuster challenges into elegant solutions.',
    initials: 'KH',
    gradient: 'from-[var(--color-success)] to-[var(--color-success-light)]',
  },
];

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'Empower independent claim professionals with innovative technology to streamline the claims process, ensuring accurate documentation and faster claim resolution.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description:
      'A world where the aftermath of flooding brings swift action and support. Where technology empowers adjusters to work efficiently, helping communities rebuild faster.',
  },
  {
    icon: Users,
    title: 'Our Approach',
    description:
      'Innovation through practical application, continuous improvement based on adjuster feedback, and maintaining the highest standards of accuracy and compliance.',
  },
];

function TeamCard({ member, index }: { member: (typeof team)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="group"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1">
        {/* Avatar */}
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl font-bold mb-4 transition-transform duration-300 group-hover:scale-105`}
        >
          {member.initials}
        </div>

        {/* Info */}
        <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
        <p className="text-[var(--color-gold)] text-sm font-medium mb-4">{member.role}</p>
        <p className="text-[var(--color-mist)] text-sm leading-relaxed">{member.bio}</p>

        {/* Social link placeholder */}
        <div className="mt-4 pt-4 border-t border-[var(--color-wave)]/30">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-mist)] hover:text-[var(--color-surf)] transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span>Connect</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  return (
    <section id="about" className="relative bg-[var(--color-deep)]/30">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-[var(--color-surf)] opacity-[0.02] blur-3xl" />
      </div>

      <div className="container relative">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            Built by Adjusters,{' '}
            <span className="text-gradient">For Adjusters</span>
          </motion.h2>
          <motion.p
            className="text-lg text-[var(--color-mist)]"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Born from firsthand experience in the field, our platform bridges the gap
            between adjusters, firms, and insurance companies.
          </motion.p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-7 h-7 text-[var(--color-gold)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-[var(--color-mist)] text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <div>
          <motion.h3
            className="text-2xl font-semibold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Meet Our Leadership
          </motion.h3>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
