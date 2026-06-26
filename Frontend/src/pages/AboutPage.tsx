import AboutSection from '../components/AboutSection';
import GoalsSection from '../components/GoalsSection';
import { motion } from 'motion/react';

export default function AboutPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pt-24 min-h-screen bg-brand-50"
    >
      <div className="bg-emerald-950 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight">
            Who We Are
          </h1>
          <p className="mt-4 text-emerald-100/80 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            We4Climate is a Rwanda-based Community Benefit Initiative dedicated to advancing 
            climate action through regenerative agriculture, ecosystem restoration, environmental 
            education, research, and storytelling. We believe that restoring nature and empowering 
            communities are inseparable, and that local action can create lasting global impact.
          </p>
        </div>
      </div>

      <AboutSection />
      
      <div className="border-t border-emerald-100/60 my-6" />
      
      <GoalsSection />
    </motion.div>
  );
}
