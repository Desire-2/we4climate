import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { BarChart, Quote } from 'lucide-react';
import { fetchImpactStories, type ApiImpactStory } from '../api/client';

// ── Animated counter that counts up when scrolled into view ──
function AnimatedCounter({ from = 0, to, suffix = '', duration = 2 }: { from?: number; to: number; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(from);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = performance.now();
      let rafId: number;
      
      const tick = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        // easeOut cubic: 1 - (1-t)^3
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(from + (to - from) * eased));
        
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className="block font-display text-4xl font-black tabular-nums text-emerald-700 sm:text-5xl">
      {displayValue}{suffix}
    </span>
  );
}

export default function ImpactDashboard() {
  const [apiStories, setApiStories] = useState<ApiImpactStory[]>([]);

  useEffect(() => {
    fetchImpactStories().then((stories) => {
      if (stories.length > 0) setApiStories(stories);
    });
  }, []);
  return (
    <section id="dashboard" className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-brand-50 py-20 scroll-mt-24">
      <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="absolute -right-40 bottom-24 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-gray-900">
              Action Metrics & Impact
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl">
              From regenerating degraded landscapes to empowering communities — every number represents a real story of restoration, resilience, and hope across Rwanda.
            </p>
          </div>

        </div>

        {/* ──────────── OUR IMPACT — ANIMATED STATS WITH COUNTERS ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="mb-8 flex items-center gap-4 border-b border-emerald-100 pb-5">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-emerald-100 p-3 shadow-sm"
            >
              <BarChart className="h-5 w-5 text-emerald-700" />
            </motion.div>
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-gray-900">
                Our Impact at a Glance
              </h3>
              <p className="text-sm text-gray-500">Real results from our work across Rwanda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            {/* Stat 1 — Farm Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/Regeneration.jpg" alt="Regeneration Farm Center" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={1} duration={1.5} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Regeneration farm center established</span>
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 2 — Farmers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/empowered.jpg" alt="Farmers Empowerment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={200} suffix="+" duration={2} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Farmers empowered with training</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 3 — Conferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/International.jpg" alt="International Conferences" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={5} suffix="+" duration={1.5} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">International conference participation</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 4 — Children */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/engaged.jpg" alt="Children Engaged" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={50} suffix="+" duration={1.8} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Children engaged in our projects</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 5 — Seedlings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/seedlings.jpg" alt="Agroforestry Seedlings" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={600} suffix="+" duration={2.5} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Agroforestry seedlings donated</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 6 — Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/created.jpg" alt="Jobs Created" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={60} suffix="+" duration={2} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Jobs created for local communities</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 7 — Kids Restoration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/activities.jpg" alt="Kids Restoration" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={800} suffix="+" duration={2.5} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Kids engaged in restoration activities</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 8 — Schools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/Primary.jpg" alt="Schools Empowered" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={2} suffix="+" duration={1.5} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Primary schools empowered</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 9 — Kitchen Gardens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/Kitchen.jpg" alt="Kitchen Gardens" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={2} suffix="+" duration={1.5} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">Operational kitchen gardens</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat 10 — Visitors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-72">
                <img src="/Images/Homepage_pictures/IMG_7097.jpg" alt="International Visitors" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-5 text-center sm:p-6">
                <AnimatedCounter from={0} to={10} suffix="+" duration={1.8} />
                <span className="text-sm text-gray-500 font-medium leading-snug block mt-1">International visitors hosted</span>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stories & Testimonial – dynamic from API with hardcoded fallback */}
        {/* Stories & Testimonial – dynamic from API with hardcoded fallback */}
        {true && (
          <div className="bg-emerald-950 rounded-3xl p-8 text-white border border-emerald-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Success Stories from Beneficiaries</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
              {(apiStories.length > 0 ? apiStories : [
                { id: 0, name: 'Anathole Murekezi', title: 'Smallholder Shareholder • Kayonza District', quote: 'Being selected for the agroforestry multiplier training model saved my banana crops from the harsh summer. By intercropping nitrogen-fixing shrubs, my soil moisture improved drastically, giving extra safety margin for my family\'s nourishment.', initials: 'AM', district_name: 'Kayonza', is_active: true, sort_order: 0, created_at: '' },
                { id: 0, name: 'Diane Umutoni', title: 'Nexus Cohort Alumna • Kigali-wide advocacy', quote: 'The intensive cohort bootcamp at We4Climate equips community environmental advocates like myself with hands-on tools. I successfully started an organic waste charcoal briquette company, directly employing 6 local community members and protecting forests from charcoal cutters.', initials: 'DU', district_name: 'Kigali', is_active: true, sort_order: 0, created_at: '' },
              ]).slice(0, 4).map((story, i) => (
                <div key={story.id || i} className="bg-emerald-900/40 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <Quote className="h-8 w-8 text-emerald-400 opacity-30 mb-4" />
                    <p className="text-sm sm:text-base text-emerald-100/90 italic leading-relaxed">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-white/5">
                    <div className="h-11 w-11 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-emerald-300 border border-emerald-700 text-sm">
                      {story.initials || story.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{story.name}</h4>
                      <span className="text-[11px] text-emerald-300 font-medium">{story.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
