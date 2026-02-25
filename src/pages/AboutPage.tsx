import { motion } from 'framer-motion';
import { Target, Eye, Compass } from 'lucide-react';

const teamMembers = [
  {
    name: 'Todd Isenburg',
    title: 'President & Co-Founder',
    photo: '/team/todd-isenburg.jpg',
    bio: 'Todd has over 20 years of experience in the insurance adjusting industry, with extensive expertise in NFIP certifications across all property types and six years as a certified trainer. His journey includes 20 years of service in the Marine Corps as a Force Reconnaissance Marine, where he developed the strategic vision that shaped OSA.',
  },
  {
    name: 'Jeremy Isenburg',
    title: 'CTO & Co-Founder',
    photo: '/team/jeremy-isenburg.jpg',
    bio: 'Jeremy brings extensive experience from tech giants Amazon, Google, and Microsoft, where he specialized in designing and deploying enterprise-scale systems. He leads the technical vision for transforming flood claims management into a streamlined, digital-first process.',
  },
  {
    name: 'Keith Harris',
    title: 'VP of Product Development',
    photo: '/team/keith-harris.jpg',
    bio: 'Keith brings 12 years of hands-on experience as an insurance adjuster, giving him deep insight into the challenges and needs of field adjusters. His time in the field, combined with a natural talent for user experience design, uniquely positions him to develop features that truly serve adjusters\' needs.',
  },
  {
    name: 'Pamela Reed-Warren',
    title: 'Director of Marketing/Sales/Training',
    photo: '/team/pamela-reed-warren.jpg',
    bio: 'Pamela is a respected leader in the insurance claims industry with nearly three decades of experience in catastrophe, wind, and flood operations. She plays a vital role in refining the application while spearheading marketing and sales efforts toward Independent Adjuster Firms and Write Your Own Carriers.',
  },
  {
    name: 'Kolby Isenburg',
    title: 'Junior Developer Technician',
    photo: '/team/kolby-isenburg.jpg',
    bio: 'Kolby is a Junior Developer and UI/UX Designer instrumental in the development of the OSA mobile application. Specializing in core feature engineering, he focuses on building scalable, high-performance solutions that prioritize usability.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description: 'We empower independent claim professionals with innovative technology to streamline the claims process, ensuring accurate documentation and faster claim resolution. By combining cutting-edge tools with intuitive claims management features, we\'re setting new standards for efficiency and accuracy in the flood insurance industry.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    description: 'We envision a world where the aftermath of flooding brings swift action and support, not months of uncertainty. Where technology empowers adjusters to work more efficiently, helping communities rebuild faster. Through One Stop Adjuster, we\'re building bridges between adjusters, insurance companies, and the people they serve.',
  },
  {
    icon: Compass,
    title: 'Our Approach',
    description: 'Innovation through practical application. Continuous improvement based on adjuster feedback. Maintaining the highest standards of accuracy and compliance. Building lasting relationships with our users and partners.',
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

export default function AboutPage(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">About One Stop Adjuster</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Leading the insurance technology revolution with innovative solutions that empower adjusters to work smarter, not harder
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 md:p-12 mb-16 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-[var(--color-mist)] leading-relaxed">
            <p>
              One Stop Adjuster was founded with a singular vision: to transform the way insurance claims are handled. We recognized the challenges faced by adjusters in the field — managing documentation, coordinating with multiple parties, and maintaining compliance — all while delivering exceptional service to policyholders.
            </p>
            <p>
              Our platform combines cutting-edge mobile technology with cloud-based workflows to create a seamless experience that puts everything adjusters need at their fingertips. From property damage assessments to complete claims management, OSA streamlines every step of the process.
            </p>
            <p>
              Today, we're proud to serve thousands of insurance professionals across the nation, helping them close claims faster, reduce errors, and deliver superior customer experiences.
            </p>
          </div>
        </motion.div>

        {/* Mission / Vision / Approach */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {values.map((value) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              className="glass rounded-2xl p-6 border border-transparent hover:border-[var(--color-gold)]/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-[var(--color-surf)]" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
              <p className="text-[var(--color-mist)] text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Meet the Team</span>
          </h2>
          <p className="text-[var(--color-mist)] max-w-xl mx-auto">
            Built by adjusters, for adjusters — with world-class engineering
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              className="glass rounded-2xl overflow-hidden group"
            >
              <div className="aspect-[4/3] bg-[var(--color-ocean)]/20 overflow-hidden">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-[var(--color-gold)] text-sm mb-3">{member.title}</p>
                <p className="text-[var(--color-mist)] text-sm leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
