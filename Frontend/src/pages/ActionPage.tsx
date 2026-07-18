import InteractiveDesk from '../components/InteractiveDesk';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Trees, Users, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionPageProps {
  handlePledgeAdded: (count: number) => void;
}

export default function ActionPage({ handlePledgeAdded }: ActionPageProps) {
  const navigate = useNavigate();

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
                  Pledge
                </span>{' '}
                for the Planet
              </h1>

              <p className="mt-4 text-lg text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">
                Join a growing community of environmental advocates across Rwanda. 
                Commit to planting indigenous trees and track the collective impact we're making together.
              </p>
            </motion.div>

            {/* Quick action cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 bg-emerald-500/15 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Trees className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-display font-bold text-white text-sm mb-1">1. Submit Pledge</h3>
                <p className="text-xs text-emerald-200/60">Log your tree planting commitment with species and location details</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/15 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="font-display font-bold text-white text-sm mb-1">2. Get Certified</h3>
                <p className="text-xs text-emerald-200/60">Take the Advocacy Passport quiz to earn your official certificate</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 transition-all duration-300 group">
                <div className="p-2.5 bg-emerald-500/15 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-display font-bold text-white text-sm mb-1">3. Join Network</h3>
                <p className="text-xs text-emerald-200/60">Connect with advocates across Rwanda and amplify your impact</p>
              </div>
            </motion.div>

            {/* CTA to Passport */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-4"
            >
              <span className="text-sm text-emerald-100/60">Already pledged?</span>
              <button
                onClick={() => navigate('/advocacy-passport')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-emerald-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Leaf className="h-4 w-4" />
                Earn Your Certificate
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DESK ─── */}
      <InteractiveDesk onPledgeAdded={handlePledgeAdded} />
    </motion.div>
  );
}
