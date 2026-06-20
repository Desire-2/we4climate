import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Users2, Leaf, Target, MapPin, ArrowRight, Compass, Shield, BookOpen, Calendar } from 'lucide-react';

interface ProgramDetail {
  id: string;
  title: string;
  category: string;
  heroImage: string;
  tagline: string;
  summary: string;
  objectives: string[];
  keyInclusion: string[];
  metrics: { label: string; value: string }[];
  location: string;
  status: string;
}

export default function ProgramsSection() {
  const [activeTab, setActiveTab] = useState<string>('leonard');

  const programs: ProgramDetail[] = [
    {
      id: 'leonard',
      title: 'Leonard Regeneration Center',
      category: 'Flagship Initiative',
      heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
      tagline: 'A regional hub for agroecology, eco-storytelling, and community resilience in Rwanda.',
      summary: 'The Leonard Regeneration Center represents We4Climate\'s crown jewel property. It functions as an experiential learning incubator, combining physical nursery assets, permaculture showfields, research facilities, and accommodation for community climate cohorts.',
      objectives: [
        'Establish a master-planned 5-hectare regenerative demonstration farm.',
        'Train over 500 local farmers per year in advanced agroforestry systems.',
        'Incubate community-focused eco-enterprises through continuous mentoring programs.',
        'Develop sustainable rainwater harvesting and solar irrigation test beds.'
      ],
      keyInclusion: [
        'Master Plan: Zoned permaculture, research quarters & eco-lodge cabins.',
        'Organic Compost Refinery with local community biochar testing.',
        'Native Seed Bank: Saving and multiplying 25 endangered indigenous tree varieties.',
        'The Storytelling Amphitheater: Hosting regional community assemblies.'
      ],
      metrics: [
        { label: 'Total Land Area', value: '5 Hectares' },
        { label: 'Annually Trained', value: '500+ Farmers' },
        { label: 'Indigenous Species', value: '25 Saved' },
        { label: 'Eco Projects incubated', value: '12 Startups' }
      ],
      location: 'Kamonyi District, Southern Province',
      status: 'Phase 2: Infrastructure Construction'
    },
    {
      id: 'leadership',
      title: 'Community Climate Leadership Hub',
      category: 'Education & Capacity',
      heroImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1200',
      tagline: 'Empowering local communities as climate champions.',
      summary: 'Our community-driven model addresses the knowledge gap in environmental leadership. Through structured cohorts, we provide local organizers with technical skills, scientific tools, digital advocacy tactics, and micro-grants to initiate local restoration projects across Rwanda.',
      objectives: [
        'Deploy Community Eco-Clubs in neighborhoods to run local green campaigns.',
        'Provide local community leaders with air quality and geographic monitoring tools.',
        'Host the annual Rwanda Community Climate Nexus Symposium with 300+ delegates.',
        'Deliver intensive digital storytelling bootcamps to scale climate empathy.'
      ],
      keyInclusion: [
        'Nexus Cohort Residency: 6-week intensive climate-action masterclass.',
        'Micro-grants for outstanding local community forest restoration campaigns.',
        'Advocacy Toolkit: Translated localized teaching guides in Kinyarwanda.',
        'Mentorship network connecting community members with global policy and research groups.'
      ],
      metrics: [
        { label: 'Community Certifiers', value: '1,200+ Trained' },
        { label: 'Active School Clubs', value: '45 Schools' },
        { label: 'Advocacy campaigns', value: '18 Launched' },
        { label: 'Seed Funding Shared', value: '15,000,000 RWF' }
      ],
      location: 'National (Rwanda-wide deployment)',
      status: 'Active (Now recruiting 2026 cohorts)'
    },
    {
      id: 'restoration',
      title: 'Ecosystem Restoration & Agroforestry',
      category: 'Ecology & Agriculture',
      heroImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
      tagline: 'Reclaiming degraded landscapes and securing biodiverse livelihood opportunities.',
      summary: 'Climate change calls for urgent landscape rehabilitation. We work with local smallholders on degraded hillsides in Rwanda to plant native ecological protection trees alongside cash crops, improving family income while locking carbon and restoring microclimates.',
      objectives: [
        'Reforest 100+ hectares of critical watersheds and steep riparian buffer zones.',
        'Intercrop nutrient-fixing trees directly into multi-layered farming plots.',
        'Establish Community-led nursery setups owned and managed by rural women.',
        'Measure direct biodiversity re-entry metrics (insects, bird populations).'
      ],
      keyInclusion: [
        'Watershed protection in Gicumbi and Bugesera water catchment zones.',
        'Women-run nurseries: Creating direct green jobs and financial security.',
        'Agroforestry models (integrating fruit trees: avocado, mango, papaya).',
        'Geo-tagged tracking system using community smartphone inputs.'
      ],
      metrics: [
        { label: 'Watershed Hectares', value: '120+ Ha Protected' },
        { label: 'Cooperative Nursery', value: '8 Female-led' },
        { label: 'Active Smallholders', value: '1,400+ Families' },
        { label: 'Survival Rate', value: '88% Verified' }
      ],
      location: 'Bugesera, Gicumbi, Kayonza, and Rubavu Districts',
      status: 'Active Implementation Phase'
    }
  ];

  const currentProgram = programs.find(p => p.id === activeTab) || programs[0];

  return (
    <section id="programs" className="py-24 bg-emerald-950 text-white relative overflow-hidden">
      {/* Visual Background Ornaments */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase bg-emerald-900/50 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
            Our Key Pillars
          </span>
          <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white">
            Programs & Projects
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100/80 leading-relaxed">
            Strengthening local food systems, empowering communities, and restoring vital ecosystems through direct, grassroots models in Rwanda.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-12 bg-emerald-900/30 p-2 rounded-2xl max-w-4xl mx-auto border border-white/5">
          {programs.map((program) => {
            const isActive = activeTab === program.id;
            return (
              <button
                key={program.id}
                onClick={() => setActiveTab(program.id)}
                className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 focus:outline-none ${
                  isActive
                    ? 'bg-emerald-500 text-emerald-950 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {program.id === 'leonard' && <Landmark className="h-5 w-5" />}
                {program.id === 'leadership' && <Users2 className="h-5 w-5" />}
                {program.id === 'restoration' && <Leaf className="h-5 w-5" />}
                <span className="truncate">{program.title}</span>
              </button>
            );
          })}
        </div>

        {/* Program showcase Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-emerald-900/20 rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl backdrop-blur-md"
          >
            {/* Visual Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square shadow-xl group border border-white/5">
                <img
                  src={currentProgram.heroImage}
                  alt={currentProgram.title}
                  className="w-full h-full object-cover transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 bg-emerald-500 text-emerald-950 font-bold font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  {currentProgram.category}
                </span>
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-emerald-300 font-medium text-xs sm:text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{currentProgram.location}</span>
                </div>
              </div>

              {/* Grid of Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {currentProgram.metrics.map((met, i) => (
                  <div key={i} className="bg-emerald-900/40 p-4 rounded-xl border border-white/5">
                    <span className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-400 block tracking-tight">
                      {met.value}
                    </span>
                    <span className="text-xs text-emerald-100/60 font-semibold uppercase tracking-wider block mt-1">
                      {met.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Status: {currentProgram.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
                  {currentProgram.title}
                </h3>
                <p className="mt-3 font-display text-emerald-300 text-lg sm:text-xl italic font-medium">
                  "{currentProgram.tagline}"
                </p>
                <p className="mt-4 text-emerald-100/80 leading-relaxed text-sm sm:text-base">
                  {currentProgram.summary}
                </p>

                {/* Objectives Checklist Split */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="flex items-center gap-1.5 font-bold text-emerald-300 text-sm sm:text-base uppercase tracking-wider border-b border-emerald-800/60 pb-2 mb-4">
                      <Target className="h-4.5 w-4.5 text-emerald-400" />
                      Key Objectives
                    </h4>
                    <ul className="space-y-3.5">
                      {currentProgram.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-100/80 leading-snug">
                          <span className="flex-shrink-0 h-4 w-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="flex items-center gap-1.5 font-bold text-emerald-300 text-sm sm:text-base uppercase tracking-wider border-b border-emerald-800/60 pb-2 mb-4">
                      <Compass className="h-4.5 w-4.5 text-emerald-400" />
                      Features & Plan
                    </h4>
                    <ul className="space-y-3.5">
                      {currentProgram.keyInclusion.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-100/80 leading-snug">
                          <span className="flex-shrink-0 text-emerald-400 mt-1">
                            <Shield className="h-3.5 w-3.5 fill-emerald-400/20" />
                          </span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Call to Action Row */}
              <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-800/40 rounded-xl">
                    <BookOpen className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-100/40 block font-semibold uppercase tracking-wider">
                      Flagship Hub Coordinator
                    </span>
                    <span className="text-sm font-bold text-white block">
                      Desire Bikorimana & Team
                    </span>
                  </div>
                </div>

                <a 
                  href="#contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl transition-all duration-300 shadow-md hover:translate-x-0.5"
                >
                  <span>Inquire / Partner on {activeTab === 'leonard' ? 'Center' : 'Programs'}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
