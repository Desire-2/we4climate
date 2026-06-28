import ProgramsSection from '../components/ProgramsSection';
import { motion } from 'motion/react';

export default function ProgramsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pt-24 min-h-screen bg-brand-50"
    >
      <div className="bg-emerald-950 text-white py-16 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <h1 className="mt-2 font-display font-medium text-4xl sm:text-5xl text-white tracking-tight">
            Programs & Projects
          </h1>
          <p className="mt-4 text-emerald-100/90 text-sm sm:text-base max-w-3xl leading-relaxed">
            We transform ideas into action by restoring ecosystems, empowering communities, 
            and building climate resilience. Through innovation, education, and collaboration, 
            our programs create practical, community-led solutions that improve livelihoods 
            while regenerating nature.
          </p>
        </div>
      </div>

      <ProgramsSection />
    </motion.div>
  );
}
