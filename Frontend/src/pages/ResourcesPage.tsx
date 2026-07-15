import StoriesAndResources from '../components/StoriesAndResources';
import { motion } from 'motion/react';

export default function ResourcesPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pt-24 min-h-screen bg-brand-50"
    >
      <StoriesAndResources />
    </motion.div>
  );
}
