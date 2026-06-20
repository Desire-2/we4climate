import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  BarChart, Map, ChevronRight, Filter, Milestone, TreePine, Users, GraduationCap, Quote 
} from 'lucide-react';
import { fetchImpactSummary, fetchDistrictMetrics, fetchImpactStories, fetchYearlyTargets, type ApiDistrictMetric, type ApiImpactStory, type ApiYearlyTarget } from '../api/client';

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
  const [hoveredProvince, setHoveredProvince] = useState<'west' | 'north' | 'east' | 'south' | 'kigali' | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

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
  }, [filters, districts]);

  // Calculate aggregate metrics per province from real district data
  const provinceAggregates = useMemo(() => {
    const keys: DistrictInfo['provinceKey'][] = ['west', 'north', 'east', 'south', 'kigali'];
    const result: Record<string, { label: string; trees: number; members: number; farmers: number; sites: number; count: number }> = {};
    for (const key of keys) {
      const dists = districts.filter(d => d.provinceKey === key);
      const label = dists[0]?.province || key.charAt(0).toUpperCase() + key.slice(1);
      result[key] = {
        label,
        trees: dists.reduce((s, d) => s + d.trees, 0),
        members: dists.reduce((s, d) => s + d.youth, 0),
        farmers: dists.reduce((s, d) => s + d.farmers, 0),
        sites: dists.reduce((s, d) => s + d.sites, 0),
        count: dists.length,
      };
    }
    return result;
  }, [districts]);

  // Data-driven pin sizing proportional to trees_planted
  const pinSizes = useMemo(() => {
    const trees = districts.map(d => d.trees);
    const minT = Math.min(...trees);
    const maxT = Math.max(...trees);
    const range = maxT - minT || 1;
    const map: Record<string, { outerSize: number; innerSize: number }> = {};
    for (const d of districts) {
      const ratio = (d.trees - minT) / range;
      const outerSize = 10 + ratio * 26; // 10px (smallest) → 36px (largest)
      map[d.id] = { outerSize, innerSize: Math.max(3, outerSize * 0.35) };
    }
    return map;
  }, [districts]);

  // Build lookup map of API targets by year
  const targetsByYear = useMemo(() => {
    const map: Record<string, ApiYearlyTarget> = {};
    for (const t of apiTargets) {
      map[String(t.year)] = t;
    }
    return map;
  }, [apiTargets]);

  // Chart Progress data based on filters
  const chartData = useMemo(() => {
    const isAllYears = filters.year === 'all';
    
    // Build yearly trend from API targets, fallback to multipliers
    if (isAllYears) {
      if (apiTargets.length > 0) {
        // Use real target data — include all years that have targets
        return apiTargets.map((t) => ({
          name: String(t.year),
          trees: t.trees_target,
          youth: t.members_target,
          farmers: t.farmers_target,
          sites: t.sites_target,
        }));
      }
      // Fallback hardcoded progression
      return [
        { name: '2023', trees: 35000, youth: 1200, farmers: 340, sites: 5 },
        { name: '2024', trees: 68000, youth: 2800, farmers: 690, sites: 9 },
        { name: '2025', trees: 120000, youth: 4500, farmers: 1100, sites: 13 },
        { name: '2026', trees: computedStats.trees, youth: computedStats.youth, farmers: computedStats.farmers, sites: computedStats.sites },
      ];
    } else {
      // Single year view: use API target when available, fallback to multiplier
      const target = targetsByYear[filters.year];
      if (target) {
        return [
          { name: 'Q1', trees: Math.round(target.trees_target * 0.2), youth: Math.round(target.members_target * 0.2), farmers: Math.round(target.farmers_target * 0.2), sites: Math.max(1, Math.round(target.sites_target * 0.2)) },
          { name: 'Q2', trees: Math.round(target.trees_target * 0.45), youth: Math.round(target.members_target * 0.4), farmers: Math.round(target.farmers_target * 0.4), sites: Math.max(2, Math.round(target.sites_target * 0.4)) },
          { name: 'Q3', trees: Math.round(target.trees_target * 0.7), youth: Math.round(target.members_target * 0.75), farmers: Math.round(target.farmers_target * 0.7), sites: Math.max(3, Math.round(target.sites_target * 0.7)) },
          { name: 'Q4', trees: target.trees_target, youth: target.members_target, farmers: target.farmers_target, sites: target.sites_target },
        ];
      }
      // Fallback to multiplier
      const t = computedStats.trees;
      return [
        { name: 'Jan - Mar', trees: Math.round(t * 0.2), youth: Math.round(computedStats.youth * 0.2), farmers: Math.round(computedStats.farmers * 0.2), sites: Math.max(1, Math.round(computedStats.sites * 0.2)) },
        { name: 'Apr - Jun', trees: Math.round(t * 0.45), youth: Math.round(computedStats.youth * 0.4), farmers: Math.round(computedStats.farmers * 0.4), sites: Math.max(2, Math.round(computedStats.sites * 0.4)) },
        { name: 'Jul - Sep', trees: Math.round(t * 0.7), youth: Math.round(computedStats.youth * 0.75), farmers: Math.round(computedStats.farmers * 0.7), sites: Math.max(3, Math.round(computedStats.sites * 0.7)) },
        { name: 'Oct - Dec', trees: t, youth: computedStats.youth, farmers: computedStats.farmers, sites: computedStats.sites },
      ];
    }
  }, [filters.year, computedStats, apiTargets, targetsByYear]);

  const handleDistrictSelect = (id: string) => {
    setSelectedDistrictId(id === selectedDistrictId ? null : id);
    setFilters(prev => ({
      ...prev,
      district: id === selectedDistrictId ? 'all' : id
    }));
  };

  const currentActiveDistrictInfo = districts.find(d => d.id === (selectedDistrictId || filters.district));

  const activeProvince = useMemo(() => {
    if (!currentActiveDistrictInfo) return null;
    return currentActiveDistrictInfo.provinceKey;
  }, [currentActiveDistrictInfo]);

  const handleProvinceSelect = (provinceKey: 'west' | 'north' | 'east' | 'south' | 'kigali') => {
    const matched = districts.find(d => d.provinceKey === provinceKey);
    if (matched) {
      handleDistrictSelect(matched.id);
    } else {
      setFilters(prev => ({ ...prev, district: 'all' }));
      setSelectedDistrictId(null);
    }
  };

  return (
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

        {/* Dynamic Stats Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
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
        </div>

        {/* Core Dashboard Visual Section: Interactive Map + Progression Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Interactive Rwanda Map Container: Col span 7 */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg sm:text-xl text-gray-950 flex items-center gap-2">
                  <Map className="h-5 w-5 text-emerald-600" />
                  Interactive Projects Map
                </h3>
                <span className="text-xs text-gray-400 font-medium">Click coordinates/pins to explore</span>
              </div>
              <p className="text-sm text-gray-500 mb-6 font-medium">
                We4Climate operates targeted hubs in primary food systems, mountainside protective catchments, and regeneration nursery centers in Rwanda:
              </p>
            </div>

            {/* Interactive Geographic Canvas of Rwanda */}
            <div className="relative w-full aspect-[4/3] bg-emerald-50/20 rounded-2xl border border-emerald-100 p-2 overflow-hidden self-center max-w-xl shadow-inner shadow-emerald-950/5">
              
              {/* High-Fidelity SVG Map representing Rwanda's 5 Official Provinces */}
              <svg 
                viewBox="0 0 400 300" 
                className="absolute inset-0 w-full h-full p-2 select-none"
              >
                {/* Drop shadow effects */}
                <defs>
                  <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#059669" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Lake Kivu representation (accurate blue contours on western border) */}
                <path 
                  d="M 12 210 Q 30 180 18 135 T 32 85 T 25 55" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  opacity="0.15"
                />
                <path 
                  d="M 12 210 Q 30 180 18 135 T 32 85 T 25 55" 
                  fill="none" 
                  stroke="#60a5fa" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  opacity="0.3"
                />

                {/* Western Province Path */}
                <path
                  d="M 70 45 L 105 80 L 130 125 L 115 185 L 90 250 L 20 275 L 15 230 L 45 180 L 25 130 L 45 85 L 35 60 Z"
                  className={`transition-all duration-300 cursor-pointer stroke-white/60 stroke-[1.5] ${
                    (activeProvince === 'west' || hoveredProvince === 'west')
                      ? 'fill-emerald-600/35 stroke-emerald-500 stroke-2 filter'
                      : 'fill-emerald-800/[0.08] hover:fill-emerald-700/20'
                  }`}
                  style={(activeProvince === 'west' || hoveredProvince === 'west') ? { filter: 'url(#map-glow)' } : {}}
                  onClick={() => handleProvinceSelect('west')}
                  onMouseEnter={() => setHoveredProvince('west')}
                  onMouseLeave={() => setHoveredProvince(null)}
                />

                {/* Northern Province Path */}
                <path
                  d="M 70 45 L 120 25 L 160 15 L 200 18 L 250 30 L 230 115 L 195 115 L 130 125 L 105 80 Z"
                  className={`transition-all duration-300 cursor-pointer stroke-white/60 stroke-[1.5] ${
                    (activeProvince === 'north' || hoveredProvince === 'north')
                      ? 'fill-emerald-600/35 stroke-emerald-500 stroke-2 filter'
                      : 'fill-emerald-800/[0.08] hover:fill-emerald-700/20'
                  }`}
                  style={(activeProvince === 'north' || hoveredProvince === 'north') ? { filter: 'url(#map-glow)' } : {}}
                  onClick={() => handleProvinceSelect('north')}
                  onMouseEnter={() => setHoveredProvince('north')}
                  onMouseLeave={() => setHoveredProvince(null)}
                />

                {/* Eastern Province Path */}
                <path
                  d="M 250 30 L 330 25 L 385 110 L 365 235 L 290 250 L 230 255 L 240 155 L 230 115 Z"
                  className={`transition-all duration-300 cursor-pointer stroke-white/60 stroke-[1.5] ${
                    (activeProvince === 'east' || hoveredProvince === 'east')
                      ? 'fill-emerald-600/35 stroke-emerald-500 stroke-2 filter'
                      : 'fill-emerald-800/[0.08] hover:fill-emerald-700/20'
                  }`}
                  style={(activeProvince === 'east' || hoveredProvince === 'east') ? { filter: 'url(#map-glow)' } : {}}
                  onClick={() => handleProvinceSelect('east')}
                  onMouseEnter={() => setHoveredProvince('east')}
                  onMouseLeave={() => setHoveredProvince(null)}
                />

                {/* Southern Province Path */}
                <path
                  d="M 240 155 L 200 165 L 180 140 L 195 115 L 130 125 L 115 185 L 90 250 L 115 275 L 170 285 L 230 255 Z"
                  className={`transition-all duration-300 cursor-pointer stroke-white/60 stroke-[1.5] ${
                    (activeProvince === 'south' || hoveredProvince === 'south')
                      ? 'fill-emerald-600/35 stroke-emerald-500 stroke-2 filter'
                      : 'fill-emerald-800/[0.08] hover:fill-emerald-700/20'
                  }`}
                  style={(activeProvince === 'south' || hoveredProvince === 'south') ? { filter: 'url(#map-glow)' } : {}}
                  onClick={() => handleProvinceSelect('south')}
                  onMouseEnter={() => setHoveredProvince('south')}
                  onMouseLeave={() => setHoveredProvince(null)}
                />

                {/* Kigali Province Path (The Central Capital Hub) */}
                <path
                  d="M 195 115 L 230 115 L 240 155 L 200 165 L 180 140 Z"
                  className={`transition-all duration-300 cursor-pointer stroke-white/60 stroke-[1.5] ${
                    (activeProvince === 'kigali' || hoveredProvince === 'kigali')
                      ? 'fill-emerald-600/35 stroke-emerald-500 stroke-2 filter'
                      : 'fill-emerald-800/[0.08] hover:fill-emerald-700/20'
                  }`}
                  style={(activeProvince === 'kigali' || hoveredProvince === 'kigali') ? { filter: 'url(#map-glow)' } : {}}
                  onClick={() => handleProvinceSelect('kigali')}
                  onMouseEnter={() => setHoveredProvince('kigali')}
                  onMouseLeave={() => setHoveredProvince(null)}
                />

                  {/* Province Text Labels with soft shadows */}
                <text x="65" y="145" className="fill-emerald-800/40 font-display font-black text-[10px] uppercase tracking-wider pointer-events-none select-none">West</text>
                <text x="160" y="65" className="fill-emerald-800/40 font-display font-black text-[10px] uppercase tracking-wider pointer-events-none select-none">North</text>
                <text x="290" y="145" className="fill-emerald-800/40 font-display font-black text-[10px] uppercase tracking-wider pointer-events-none select-none">East</text>
                <text x="140" y="215" className="fill-emerald-800/40 font-display font-black text-[10px] uppercase tracking-wider pointer-events-none select-none">South</text>
                <text x="195" y="138" className="fill-emerald-950/70 font-display font-black text-[8px] uppercase tracking-wider pointer-events-none select-none">Kigali</text>
              </svg>

              {/* Province aggregate tooltip on hover */}
              {hoveredProvince && provinceAggregates[hoveredProvince] && (
                <div className="absolute top-2 right-2 z-30 bg-gray-950/90 backdrop-blur-sm text-white p-3 rounded-2xl border border-white/10 shadow-xl min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      hoveredProvince === 'west' ? 'bg-amber-400' :
                      hoveredProvince === 'north' ? 'bg-blue-400' :
                      hoveredProvince === 'east' ? 'bg-emerald-400' :
                      hoveredProvince === 'south' ? 'bg-purple-400' :
                      'bg-rose-400'
                    }`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{provinceAggregates[hoveredProvince].label}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{provinceAggregates[hoveredProvince].count} district{provinceAggregates[hoveredProvince].count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="text-[10px] text-gray-400">Trees</div>
                    <div className="text-[11px] font-bold text-right text-emerald-300">{provinceAggregates[hoveredProvince].trees.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">Members</div>
                    <div className="text-[11px] font-bold text-right text-blue-300">{provinceAggregates[hoveredProvince].members.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">Farmers</div>
                    <div className="text-[11px] font-bold text-right text-amber-300">{provinceAggregates[hoveredProvince].farmers.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400">Sites</div>
                    <div className="text-[11px] font-bold text-right text-purple-300">{provinceAggregates[hoveredProvince].sites}</div>
                  </div>
                </div>
              )}

              {/* Water indicators in appropriate places */}
              <span className="absolute bottom-20 left-4 text-[10px] text-blue-500/60 font-semibold italic font-sans tracking-wide select-none">Lake Kivu</span>
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-800/50 font-sans uppercase tracking-widest select-none">We4Climate Hubs Map</span>

              {/* Interactive Pulse Pins — size driven by trees_planted from real data */}
              {districts.map((dist) => {
                const isActive = (selectedDistrictId || filters.district) === dist.id;
                const isHovered = hoveredPin === dist.id;
                const sz = pinSizes[dist.id] || { outerSize: 14, innerSize: 5 };
                const outerPx = isActive ? sz.outerSize * 1.3 : isHovered ? sz.outerSize * 1.15 : sz.outerSize;
                const innerPx = isActive ? sz.innerSize * 1.3 : sz.innerSize;
                return (
                  <button
                    key={dist.id}
                    id={`map-pin-${dist.id}`}
                    onClick={() => handleDistrictSelect(dist.id)}
                    onMouseEnter={() => setHoveredPin(dist.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    className="absolute group z-20 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-full transition-all duration-300"
                    style={{ left: `${dist.mapCoords.x}%`, top: `${dist.mapCoords.y}%` }}
                  >
                    {/* Ring Pulse */}
                    <span className={`absolute rounded-full bg-emerald-500/30 animate-ping duration-1000 ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}
                      style={{ width: outerPx * 2.8, height: outerPx * 2.8, left: -(outerPx * 1.4), top: -(outerPx * 1.4) }}
                    />
                    
                    {/* Outer ring glow for active */}
                    <span
                      className={`absolute rounded-full border-2 transition-all duration-300 ${
                        isActive ? 'border-emerald-400/60' : 'border-emerald-500/20 group-hover:border-emerald-400/40'
                      }`}
                      style={{ width: outerPx * 1.6, height: outerPx * 1.6, left: -(outerPx * 0.8), top: -(outerPx * 0.8) }}
                    />

                    {/* Inner Solid Marker Circle */}
                    <span
                      className={`flex items-center justify-center rounded-full border-2 border-white transition-all duration-300 shadow-lg ${
                        isActive ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                      style={{ width: outerPx, height: outerPx }}
                    >
                      <span className="rounded-full bg-white" style={{ width: innerPx, height: innerPx }} />
                    </span>

                    {/* District name label */}
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-950/90 text-white text-[9px] font-bold rounded-lg whitespace-nowrap z-50 shadow-xl transition-all duration-200 pointer-events-none ${
                        isActive || isHovered ? 'opacity-100 translate-y-1' : 'opacity-0 translate-y-0'
                      }`}
                      style={{ top: outerPx * 0.8 + 4 }}
                    >
                      {dist.name} · {dist.trees.toLocaleString()} trees
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Map Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500 border-t border-gray-100 pt-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Hub Pin
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-600 inline-block border-2 border-white shadow-sm" /> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-5 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Province Region
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex gap-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                </span>
                Size = Impact
              </span>
              <span className="text-gray-400 font-normal">| Click pins, regions, or hover provinces</span>
            </div>
          </div>

          {/* Recharts Graphical visualization: Col span 5 */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-gray-950 flex items-center gap-2 mb-2">
                <BarChart className="h-5 w-5 text-emerald-600" />
                Growth & Trajectory over Time
              </h3>
              <p className="text-sm text-gray-500 font-medium pb-4 border-b border-gray-100">
                {filters.year === 'all' 
                  ? 'Year-over-year cumulative growth in key protective trees planted.'
                  : `Quarterly progression of climate impacts for selected year ${filters.year}.`
                }
              </p>
            </div>

            {/* Recharts Interactive Area Container */}
            <div className="w-full h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTrees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontFamily="inherit" 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    fontFamily="inherit" 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#f8fafc',
                      fontFamily: 'inherit',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    name="Trees Planted" 
                    type="monotone" 
                    dataKey="trees" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorTrees)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Rich District Detail Panel — driven by real API data */}
            <div className="mt-6 rounded-2xl border overflow-hidden transition-all duration-300">
              <AnimatePresence mode="wait">
                {currentActiveDistrictInfo ? (
                  <motion.div
                    key={currentActiveDistrictInfo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                          {currentActiveDistrictInfo.province}
                        </span>
                        <h4 className="text-lg font-display font-bold text-gray-900">
                          {currentActiveDistrictInfo.name} District
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-xl border border-emerald-200/50">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700">Active Node</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {currentActiveDistrictInfo.description}
                    </p>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-white/80 rounded-xl p-3 text-center border border-emerald-200/40">
                        <div className="text-xl font-display font-black text-emerald-700">{currentActiveDistrictInfo.trees.toLocaleString()}</div>
                        <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5"><TreePine className="h-3 w-3 inline mr-0.5" />Trees</div>
                      </div>
                      <div className="bg-white/80 rounded-xl p-3 text-center border border-blue-200/40">
                        <div className="text-xl font-display font-black text-blue-700">{currentActiveDistrictInfo.youth.toLocaleString()}</div>
                        <div className="text-[9px] text-blue-500 font-bold uppercase tracking-wider mt-0.5"><Users className="h-3 w-3 inline mr-0.5" />Members</div>
                      </div>
                      <div className="bg-white/80 rounded-xl p-3 text-center border border-amber-200/40">
                        <div className="text-xl font-display font-black text-amber-700">{currentActiveDistrictInfo.farmers.toLocaleString()}</div>
                        <div className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mt-0.5"><GraduationCap className="h-3 w-3 inline mr-0.5" />Farmers</div>
                      </div>
                      <div className="bg-white/80 rounded-xl p-3 text-center border border-purple-200/40">
                        <div className="text-xl font-display font-black text-purple-700">{currentActiveDistrictInfo.sites}</div>
                        <div className="text-[9px] text-purple-500 font-bold uppercase tracking-wider mt-0.5"><Milestone className="h-3 w-3 inline mr-0.5" />Sites</div>
                      </div>
                    </div>

                    {/* Species tags */}
                    {currentActiveDistrictInfo.species.length > 0 && (
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Priority Species</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentActiveDistrictInfo.species.map((s, i) => (
                            <span key={i} className="text-[10px] bg-white/80 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200/50 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Map coordinates */}
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 font-mono">
                      <span>Map: ({currentActiveDistrictInfo.mapCoords.x.toFixed(1)}, {currentActiveDistrictInfo.mapCoords.y.toFixed(1)})</span>
                      <button
                        onClick={() => { setSelectedDistrictId(null); setFilters(prev => ({ ...prev, district: 'all' })); }}
                        className="ml-auto text-emerald-600 hover:text-emerald-500 font-bold text-[10px] uppercase tracking-wider"
                      >
                        Clear selection
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="national-overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/60 rounded-2xl border border-emerald-200/30">
                        <Map className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-950 uppercase tracking-widest text-[10px] block mb-1">
                          National Overview
                        </span>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Showing collective nation-wide impact across <strong>{districts.length} district{districts.length !== 1 ? 's' : ''}</strong>.
                          Click any pin on the map or province region to explore detailed breakdowns of tree varieties, community metrics, and restoration targets.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><TreePine className="h-3.5 w-3.5 text-emerald-500" /> Pin size reflects trees planted</span>
                          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500/30" /> Pulse indicates active hub</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

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
