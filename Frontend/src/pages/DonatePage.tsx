import DonationPortal from '../components/DonationPortal';
import { motion } from 'motion/react';

export default function DonatePage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pt-24 min-h-screen bg-brand-50"
    >
      <DonationPortal />
    </motion.div>
  );
}
