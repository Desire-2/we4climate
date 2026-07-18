import ImpactDashboard from '../components/ImpactDashboard';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Leaf, Globe, Quote } from 'lucide-react';

export default function ImpactPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="pt-24 min-h-screen bg-brand-50"
    >
      {/* ──────────── HERO BANNER ──────────── */}
      <div className="bg-emerald-950 text-white py-20 sm:py-28 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(5,150,105,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(52,211,153,0.03),transparent_70%)]" />
        
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-16 left-[15%] w-32 h-32 border border-emerald-400/10 rounded-full"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-[20%] w-20 h-20 bg-emerald-500/5 rounded-full blur-sm"
          animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 left-[25%] w-16 h-16 border border-emerald-400/10 rounded-lg rotate-45"
          animate={{ y: [0, -12, 0], rotate: [45, 55, 45] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-32 right-[30%] w-24 h-24 bg-emerald-400/[0.03] rounded-full blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Subtle leaf-like floating icons */}
        <motion.div
          className="absolute top-1/4 right-[10%] text-emerald-500/10"
          animate={{ y: [0, -25, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="h-12 w-12" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 left-[8%] text-emerald-400/10"
          animate={{ y: [0, 20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <Globe className="h-10 w-10" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-900/50 px-4 py-2 rounded-full border border-emerald-500/20 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight"
            >
              Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                Impact
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-emerald-100/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              From regenerating degraded landscapes to empowering communities — every number 
              represents a real story of restoration, resilience, and hope across Rwanda.
            </motion.p>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <motion.a
                href="#dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-emerald-200 rounded-xl text-sm font-semibold border border-white/10 hover:border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore the Data</span>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </motion.div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient transition */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-50 to-transparent" />
      </div>

      {/* ──────────── IMPACT DASHBOARD ──────────── */}
      <ImpactDashboard />

      {/* ──────────── OUR TEAM & IMPACT GALLERY ──────────── */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ─── Team Section ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >

            <h2 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight mt-3">
              The People Behind the Mission
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              A passionate team working every day to restore landscapes, empower communities, 
              and build climate resilience across Rwanda and Africa.
            </p>
          </motion.div>

          {/* ─── Team Member Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                name: 'Leonard IYAMUREMYE',
                role: 'Managing Director',
                photo: '/Images/Our_Team/leonard-iyamuremye.jpg',
                bio: 'Leading strategic direction and overseeing all restoration programs across Rwanda.',
                objectPosition: '50% 12%',
              },
              {
                name: 'Dusengimana Florence',
                role: 'Communication Director',
                photo: '/Images/Our_Team/dusengimana-florence.jpg',
                bio: 'Driving awareness, storytelling, and community engagement through strategic communications.',
                objectPosition: '50% 20%',
              },
              {
                name: 'Bienvenue Ishimwe',
                role: 'Development Officer',
                photo: '/Images/Our_Team/bienvenue-ishimwe.jpg',
                bio: 'Building partnerships and securing resources to scale our impact across the region.',
                objectPosition: '50% 20%',
              },
              {
                name: 'TUYIZERE Sandrine',
                role: 'Partnership Officer',
                photo: '/Images/Our_Team/tuyizere-sandrine.jpg',
                bio: 'Cultivating relationships with local and international partners to amplify our mission.',
                objectPosition: '50% 20%',
              },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-center pt-8 sm:pt-10 px-4 sm:px-6 pb-6">
                  {/* Photo - circular headshot */}
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md shrink-0">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: member.objectPosition }}
                      loading="lazy"
                    />
                  </div>

                  {/* Name, Role, Bio under the image */}
                  <div className="text-center mt-5">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-gray-900 leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-emerald-700 text-xs sm:text-sm font-semibold mt-0.5">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed mt-3 pt-3 border-t border-gray-100">
                      {member.bio}
                    </p>
                  </div>

                  {/* Hover decorative accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── Bottom Quote ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <Quote className="h-4 w-4 opacity-50" />
              <span className="italic">Together, we are restoring our planet — one landscape, one community at a time.</span>
              <Quote className="h-4 w-4 opacity-50 rotate-180" />
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient transition */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

    </motion.div>
  );
}
