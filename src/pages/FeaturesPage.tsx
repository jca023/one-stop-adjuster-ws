import { motion } from 'framer-motion';
import {
  Smartphone, Camera, FileText, MapPin, Shield, Clock,
  BarChart3, Zap, FileCheck, Briefcase, Users, CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Full-featured experience on all iOS Apple devices including iPhone and iPad. Access your work seamlessly from any platform.',
  },
  {
    icon: Camera,
    title: 'Photo Documentation',
    description: 'Capture, annotate, and organize claim photos directly in the app. AI-powered photo labeling automatically categorizes and tags your images for faster documentation. Automatic cloud sync ensures all documentation is instantly available.',
  },
  {
    icon: FileText,
    title: 'Digital Reports',
    description: 'FEMA Flood required documents come pre-populated and ready for immediate use, streamlining your workflow from day one. Capture on-the-spot policyholder signatures directly on any report, then seamlessly share polished documentation for instant submittal.',
  },
  {
    icon: MapPin,
    title: 'Mapping & Scheduling',
    description: 'Optimize your field operations with intelligent mapping and scheduling capabilities. OSA enables efficient claim scheduling with automated route selection, ensuring seamless navigation and maximizing adjuster productivity throughout the workday.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Built on SOC 2 compliant platforms with two-factor authentication for all users. We follow strict security guidelines to safeguard your sensitive information. Your data is protected with enterprise-grade security measures at every level.',
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Instant synchronization across all devices. Keep all stakeholders informed with automatic notifications and status updates.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Powerful analytics that span the entire claims ecosystem. Adjusters stay sharp with real-time task tracking and due date alerts. I/A firms gain visibility into team performance, while Carriers maintain oversight of claim accuracy and timelines.',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Seamless API integration that receives claims directly into your workflow, eliminating duplicate data entry. Arrive on-site and begin your inspection immediately. When complete, upload directly to your estimating software for effortless processing.',
  },
  {
    icon: FileCheck,
    title: 'Compliance Management',
    description: 'Automated compliance tracking ensures your files remain organized and deadlines are met before they become problems. With built-in alerts and streamlined documentation, compliance becomes your competitive advantage.',
  },
  {
    icon: Briefcase,
    title: 'OSA Manager',
    description: 'Your command center for operational excellence. The strategic hub where I/A firms, carriers, and vendors unite under one powerful platform. Gain complete visibility into the end-to-end claims lifecycle and drive faster cycle times.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Whether you have 5 adjusters or 50, real-time data synchronization keeps everyone connected. From inspection to final signature, every team member stays aligned with instant updates and shared access.',
  },
  {
    icon: CheckCircle,
    title: 'Quality Assurance',
    description: 'Intelligent checks and balances validate your work in real-time, catching discrepancies before they become problems. Built-in guidance at each phase streamlines your process and ensures nothing gets overlooked.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesPage(): React.JSX.Element {
  return (
    <section className="pt-32 pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Powerful Features for Modern Adjusters</span>
          </h1>
          <p className="text-[var(--color-mist)] text-lg max-w-2xl mx-auto">
            Everything you need to manage claims efficiently, all in one comprehensive platform
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="glass rounded-2xl p-6 group hover:border-[var(--color-gold)]/30 border border-transparent transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-ocean)]/20 flex items-center justify-center mb-4 group-hover:bg-[var(--color-gold)]/20 transition-colors">
                <feature.icon className="w-6 h-6 text-[var(--color-surf)] group-hover:text-[var(--color-gold)] transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-[var(--color-mist)] text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
