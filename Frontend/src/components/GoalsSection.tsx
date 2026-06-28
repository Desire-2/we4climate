import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, Users, Shield, Camera, Handshake, Lightbulb,
  ArrowRight, X, Sparkles, Leaf, Heart
} from 'lucide-react';

interface TheoryOfChange {
  id: number;
  title: string;
  statement: string;
  icon: ReactNode;
  image: string;
  color: string;
}

const THEORIES: TheoryOfChange[] = [
  {
    id: 1,
    title: 'Regenerate Ecosystems, Restore Life',
    statement: 'When communities adopt regenerative agriculture, agroforestry, and ecosystem restoration practices, then degraded landscapes recover, biodiversity increases, soil health improves, and communities become more resilient to climate change.',
    icon: <Sprout className="h-6 w-6" />,
    image: '/Images/Leonard/IMG_1132.jpg',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    id: 2,
    title: 'Empower People, Transform Communities',
    statement: 'When farmers, youth, women, and schools gain practical knowledge, skills, and leadership opportunities, then they become agents of change who restore their environments, strengthen livelihoods, and inspire others to take action.',
    icon: <Users className="h-6 w-6" />,
    image: '/Images/Leonard/IMG_1259.jpg',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 3,
    title: 'Build Climate Resilience Through Nature',
    statement: 'When communities invest in nature-based solutions such as food forests, rainwater harvesting, biodiversity conservation, and sustainable land management, then they become better prepared to withstand droughts, floods, and other climate-related challenges while securing food and water for future generations.',
    icon: <Shield className="h-6 w-6" />,
    image: '/Images/Leonard/IMG_1295.jpg',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    id: 4,
    title: 'Share Stories, Inspire Action',
    statement: 'When local restoration efforts and community innovations are documented and shared through storytelling, media, and education, then more people become aware, inspired, and motivated to replicate successful environmental solutions within their own communities.',
    icon: <Camera className="h-6 w-6" />,
    image: '/Images/IMG_9085.jpg',
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: 5,
    title: 'Collaborate to Scale Impact',
    statement: 'When communities, researchers, governments, businesses, and development partners collaborate and exchange knowledge, then innovative solutions can be scaled more effectively, accelerating ecosystem restoration and sustainable development across Rwanda and Africa.',
    icon: <Handshake className="h-6 w-6" />,
    image: '/Images/Homepage_pictures/IMG_9789.jpg',
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 6,
    title: 'Innovation Drives Regeneration',
    statement: 'When scientific research, indigenous knowledge, digital technologies, and community experience are integrated into environmental action, then more effective, evidence-based, and locally appropriate solutions emerge to address climate change, land degradation, and biodiversity loss.',
    icon: <Lightbulb className="h-6 w-6" />,
    image: '/Images/IMG_2583.jpg',
    color: 'from-rose-500 to-rose-700',
  },
];

export default function GoalsSection() {
  const [selectedTheory, setSelectedTheory] = useState<TheoryOfChange | null>(null);

  return (
    <section id="theories-of-change" className="py-24 bg-gradient-to-b from-white to-emerald-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            Our Theories of Change
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            We believe lasting environmental change happens when healthy ecosystems, empowered 
            communities, innovation, and collaboration work together. These theories of change 
            describe the pathways through which our work contributes to a more regenerative, 
            climate-resilient, and sustainable future for Rwanda and Africa.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {THEORIES.map((theory) => (
            <motion.div
              key={theory.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: theory.id * 0.1 }}
              onClick={() => setSelectedTheory(theory)}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image section with overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={theory.image}
                  alt={theory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Icon badge */}
                <div className={`absolute top-4 left-4 p-2.5 bg-gradient-to-br ${theory.color} rounded-xl shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                  {theory.icon}
                </div>

                {/* Number badge */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                  {String(theory.id).padStart(2, '0')}
                </div>

                {/* Bottom gradient label */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-white text-xs font-medium">Theory of Change</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display font-bold text-lg text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {theory.title}
                </h3>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                  "{theory.statement}"
                </p>

                {/* Read more */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all flex items-center gap-1">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <Sparkles className="h-4 w-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTheory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTheory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100"
            >
              {/* Modal image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={selectedTheory.image}
                  alt={selectedTheory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className={`absolute bottom-4 left-4 p-3 bg-gradient-to-br ${selectedTheory.color} rounded-xl shadow-lg text-white`}>
                  {selectedTheory.icon}
                </div>
                <button
                  onClick={() => setSelectedTheory(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${selectedTheory.color} text-white`}>
                    Theory {String(selectedTheory.id).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">/ 06</span>
                </div>
                <h3 className="font-display font-bold text-2xl text-gray-900 mt-3 mb-4">
                  {selectedTheory.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  "{selectedTheory.statement}"
                </p>

                {/* Bottom action */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Heart className="h-4 w-4 text-emerald-500" />
                    <span>Theory of Change</span>
                  </div>
                  <button
                    onClick={() => setSelectedTheory(null)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl text-sm transition-all shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
