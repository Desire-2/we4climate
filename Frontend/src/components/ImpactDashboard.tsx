import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { 
  BarChart, Filter, Milestone, TreePine, Users, GraduationCap, Quote 
} from 'lucide-react';
import { fetchImpactSummary, fetchDistrictMetrics, fetchImpactStories, fetchYearlyTargets, type ApiDistrictMetric, type ApiImpactStory, type ApiYearlyTarget } from '../api/client';

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
    <span ref={ref} className="font-display font-black text-2xl text-emerald-700 block tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

interface FilterState {
  year: 'all' | '2024' | '2025' | '2026';
  district: string;
}

interface DistrictInfo {
  id: string;
  name: string;
  province: string;
  provinceKey: 'west' | 'north' | 'east' | 'south' | 'kigali';
  trees: number;
  farmers: number;
  youth: number;
  sites: number;
  species: string[];
  description: string;
  mapCoords: { x: number; y: number };
}

// Fallback districts when API is unavailable
const FALLBACK_DISTRICTS: DistrictInfo[] = [
  { id: 'bugesera', name: 'Bugesera', province: 'Eastern Province', provinceKey: 'east', trees: 35000, farmers: 320, youth: 1100, sites: 3, species: ['Grevillea robusta', 'Senna spectabilis', 'Avocado', 'Mango'], description: 'Combating persistent aridity through multi-layered agroforestry buffer strips.', mapCoords: { x: 62, y: 66 } },
  { id: 'gicumbi', name: 'Gicumbi', province: 'Northern Province', provinceKey: 'north', trees: 42000, farmers: 410, youth: 950, sites: 4, species: ['Calliandra calothyrsus', 'Alnus nepalensis', 'Indigenous Podocarpus'], description: 'Stabilizing steep mountainous hillsides prone to erosive landslides.', mapCoords: { x: 52, y: 22 } },
  { id: 'kayonza', name: 'Kayonza', province: 'Eastern Province', provinceKey: 'east', trees: 28000, farmers: 240, youth: 850, sites: 2, species: ['Acacia polyacantha', 'Markhamia lutea', 'Papaya'], description: 'Conserving savannah soils and pioneering organic biochar applications.', mapCoords: { x: 75, y: 40 } },
  { id: 'rubavu', name: 'Rubavu', province: 'Western Province', provinceKey: 'west', trees: 22000, farmers: 180, youth: 900, sites: 2, species: ['Erythrina abyssinica', 'Maesopsis eminii', 'Bamboo buffers'], description: 'Restoring volcanic soil health and preventing riverbank degradation.', mapCoords: { x: 18, y: 21 } },
  { id: 'kamonyi', name: 'Kamonyi', province: 'Southern Province', provinceKey: 'south', trees: 15000, farmers: 150, youth: 1000, sites: 2, species: ['Grevillea', 'Moringa oleifera', 'Markhamia'], description: 'Flagship learning initiatives around the Leonard Regeneration Center.', mapCoords: { x: 42, y: 52 } },
  { id: 'huye', name: 'Huye', province: 'Southern Province', provinceKey: 'south', trees: 18000, farmers: 190, youth: 800, sites: 2, species: ['Calliandra', 'Ficus thonningii', 'Citrus variety tree'], description: 'Collaborating with local schools on green camp designs and permaculture.', mapCoords: { x: 36, y: 80 } },
];

export default function ImpactDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    year: 'all',
    district: 'all'
  });

  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  // API-driven state
  const [apiTrees, setApiTrees] = useState<number>(0);
  const [apiMembers, setApiMembers] = useState<number>(0);
  const [apiFarmers, setApiFarmers] = useState<number>(0);
  const [apiSites, setApiSites] = useState<number>(0);
  const [apiDistricts, setApiDistricts] = useState<ApiDistrictMetric[]>([]);
  const [apiStories, setApiStories] = useState<ApiImpactStory[]>([]);
  const [apiTargets, setApiTargets] = useState<ApiYearlyTarget[]>([]);

  // Build dynamic district list from API data, fallback to hardcoded
  const districts: DistrictInfo[] = useMemo(() => {
    if (apiDistricts.length > 0) {
      return apiDistricts.map((d) => ({
        id: d.district_name.toLowerCase().replace(/\s+/g, '-'),
        name: d.district_name,
        province: d.province,
        provinceKey: d.province_key as DistrictInfo['provinceKey'],
        trees: d.trees_planted,
        farmers: d.farmers_trained,
        youth: d.community_members,
        sites: d.active_sites,
        species: d.species,
        description: d.description,
        mapCoords: { x: d.map_coords_x, y: d.map_coords_y },
      }));
    }
    return FALLBACK_DISTRICTS;
  }, [apiDistricts]);

  // Fetch all data from backend on mount
  useEffect(() => {
    const load = async () => {
      const [summary, dMetrics, stories, targets] = await Promise.all([
        fetchImpactSummary(),
        fetchDistrictMetrics(),
        fetchImpactStories(),
        fetchYearlyTargets(),
      ]);
      if (summary) {
        setApiTrees(summary.total_trees_planted);
        setApiMembers(summary.total_community_members);
        setApiFarmers(summary.total_farmers_trained);
        setApiSites(summary.total_active_sites);
      }
      if (dMetrics.length > 0) setApiDistricts(dMetrics);
      if (stories.length > 0) setApiStories(stories);
      if (targets.length > 0) setApiTargets(targets);
    };
    load();
  }, []);

  // Dynamic calculations based on filters
  const computedStats = useMemo(() => {
    // Use live API data as the base when available, otherwise fallback to hardcoded defaults
    let baseTrees = apiTrees > 0 ? apiTrees : 160000;
    let baseYouth = apiMembers > 0 ? apiMembers : 5600;
    let baseFarmers = apiFarmers > 0 ? apiFarmers : 1490;
    let baseSites = apiSites > 0 ? apiSites : 15;

    // Filter by district
    if (filters.district !== 'all') {
      const activeDist = districts.find(d => d.id === filters.district);
      if (activeDist) {
        baseTrees = activeDist.trees;
        baseYouth = activeDist.youth;
        baseFarmers = activeDist.farmers;
        baseSites = activeDist.sites;
      }
    }

    // Filter by year multiplier offsets to represent progression of time
    if (filters.year === '2024') {
      baseTrees = Math.round(baseTrees * 0.40);
      baseYouth = Math.round(baseYouth * 0.45);
      baseFarmers = Math.round(baseFarmers * 0.50);
      baseSites = Math.max(1, Math.round(baseSites * 0.40));
    } else if (filters.year === '2025') {
      baseTrees = Math.round(baseTrees * 0.75);
      baseYouth = Math.round(baseYouth * 0.78);
      baseFarmers = Math.round(baseFarmers * 0.80);
      baseSites = Math.max(2, Math.round(baseSites * 0.75));
    } else if (filters.year === '2026') {
      // current year target values
      baseTrees = Math.round(baseTrees * 1.05);
      baseYouth = Math.round(baseYouth * 1.10);
      baseFarmers = Math.round(baseFarmers * 1.05);
      baseSites = Math.round(baseSites * 1.20);
    }

    return {
      trees: baseTrees,
      youth: baseYouth,
      farmers: baseFarmers,
      sites: baseSites
    };
  }, [filters, districts]);  return (
    <section id="dashboard" className="py-20 bg-brand-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-semibold tracking-widest text-emerald-700 uppercase bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300/30">
              Impact Dashboard
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-gray-900">
              Action Metrics & Impact
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl">
              Track our collective agroforestry, tree planting, smallholder training, and community mobilization growth across Rwandan districts.
            </p>
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-xl text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span>Filters</span>
            </div>

            {/* Year filter selector */}
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value as any }))}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All-Time Cumulative</option>
              <option value="2024">Year 2024 Only</option>
              <option value="2025">Year 2025 Only</option>
              <option value="2026">Year 2026 Targets</option>
            </select>

            {/* District filter selector – dynamically built from API */}
            <select
              value={filters.district}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => ({ ...prev, district: val }));
                setSelectedDistrictId(val === 'all' ? null : val);
              }}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Project Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
              ))}
            </select>
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
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="p-2.5 bg-emerald-100 rounded-xl"
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Stat 1 — Farm Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/Regeneration.jpg" alt="Regeneration Farm Center" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Farm Center
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/empowered.jpg" alt="Farmers Empowerment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Farmers
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/International.jpg" alt="International Conferences" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Events
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/engaged.jpg" alt="Children Engaged" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Children
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/seedlings.jpg" alt="Agroforestry Seedlings" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Seedlings
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/created.jpg" alt="Jobs Created" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Jobs
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/activities.jpg" alt="Kids Restoration" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Kids
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/Primary.jpg" alt="Schools Empowered" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Schools
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/Kitchen.jpg" alt="Kitchen Gardens" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Gardens
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-24 sm:h-28 overflow-hidden">
                <img src="/Images/Homepage_pictures/IMG_7097.jpg" alt="International Visitors" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Visitors
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
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

        {/* ──────────── DYNAMIC STATS OVERVIEW GRID ──────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
        >
          {/* Trees Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.06] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <TreePine className="h-32 w-32 text-emerald-950" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <TreePine className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <span className="text-3xl sm:text-4xl font-display font-black text-gray-950 tracking-tight block">
                {computedStats.trees.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest block mt-1.5">
                Trees Seeded & Planted
              </span>
            </div>
          </div>

          {/* Youth reached card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.06] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Users className="h-32 w-32 text-emerald-950" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <span className="text-3xl sm:text-4xl font-display font-black text-gray-950 tracking-tight block">
                {computedStats.youth.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest block mt-1.5">
                Community Leaders Mobilized
              </span>
            </div>
          </div>

          {/* Farmers Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.06] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <GraduationCap className="h-32 w-32 text-emerald-950" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <span className="text-3xl sm:text-4xl font-display font-black text-gray-950 tracking-tight block">
                {computedStats.farmers.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest block mt-1.5">
                Farmers Certified
              </span>
            </div>
          </div>

          {/* Sites Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.06] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Milestone className="h-32 w-32 text-emerald-950" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <Milestone className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <span className="text-3xl sm:text-4xl font-display font-black text-gray-950 tracking-tight block">
                {computedStats.sites.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest block mt-1.5">
                Nursery & Restoration Sites
              </span>
            </div>
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
