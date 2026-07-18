import InteractiveDesk from '../components/InteractiveDesk';
import { motion } from 'motion/react';

interface ActionPageProps {
  handlePledgeAdded: (count: number) => void;
}

export default function ActionPage({ handlePledgeAdded }: ActionPageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
                Make Your{' '}
                <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                  Promise
                </span>{' '}
                to the Planet
              </h1>

              <p className="mt-4 text-lg text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">
                Join a growing community of people across Rwanda who care about the environment.
                Share your tree-planting commitment and watch our collective impact grow.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DESK ─── */}
      <InteractiveDesk onPledgeAdded={handlePledgeAdded} />
    </motion.div>
  );
}
