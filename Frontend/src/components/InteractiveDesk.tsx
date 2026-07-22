import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Pledge } from '../types';
import { fetchPledges, createPledge } from '../api/client';

interface InteractiveDeskProps {
  onPledgeAdded: (treesCount: number) => void;
}

export default function InteractiveDesk({ onPledgeAdded }: InteractiveDeskProps) {

  // Pledges State
  const [pledgedList, setPledgedList] = useState<Pledge[]>([]);
  const [pledgeName, setPledgeName] = useState('');
  const [pledgeDistrict, setPledgeDistrict] = useState('Kicukiro (Kigali)');
  const [pledgeCount, setPledgeCount] = useState(10);
  const [pledgeAction, setPledgeAction] = useState('Organizing an environmental club event');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  const rwandanDistricts = [
    'Kicukiro (Kigali)', 'Nyarugenge (Kigali)', 'Gasabo (Kigali)',
    'Musanze', 'Rubavu', 'Huye', 'Kayonza', 'Rwamagana', 'Gicumbi', 'Bugesera', 'Karongi'
  ];

  const presetActions = [
    'Planting indigenous tree species (e.g., Markhamia)',
    'Organizing an environmental club event',
    'Hosting on-ground cleanup campaigns',
    'Sensitizing local children and nursery cohorts',
    'Researching local biodiversity issues'
  ];

  // Load existing pledges – try API first, fall back to LocalStorage
  useEffect(() => {
    const load = async () => {
      const apiData = await fetchPledges();
      if (apiData.length > 0) {
        const mapped: Pledge[] = apiData.map((p) => ({
          id: String(p.id),
          name: p.name,
          district: p.district,
          treesCount: p.trees_count,
          action: p.tree_type,
          timestamp: new Date(p.timestamp).toLocaleDateString(),
        }));
        setPledgedList(mapped);
        localStorage.setItem('we4climate_pledges', JSON.stringify(mapped));
        return;
      }
      // Fallback to localStorage
      const cached = localStorage.getItem('we4climate_pledges');
      if (cached) {
        try {
          setPledgedList(JSON.parse(cached));
        } catch {
          /* ignore */
        }
      } else {
        // Default inspiring list
        const defaults: Pledge[] = [
          {
            id: '1', name: 'Iradukunda Alice', district: 'Kicukiro (Kigali)',
            treesCount: 25, action: 'Planting indigenous tree species (e.g., Markhamia)',
            timestamp: new Date().toLocaleDateString(),
          },
          {
            id: '2', name: 'Niyonsaba Moses', district: 'Musanze',
            treesCount: 50, action: 'Sensitizing local children and nursery cohorts',
            timestamp: new Date().toLocaleDateString(),
          },
          {
            id: '3', name: 'Keza Diane', district: 'Gasabo (Kigali)',
            treesCount: 15, action: 'Organizing an environmental club event',
            timestamp: new Date().toLocaleDateString(),
          },
        ];
        setPledgedList(defaults);
        localStorage.setItem('we4climate_pledges', JSON.stringify(defaults));
      }
    };
    load();
  }, []);

  // Handle Pledge Submission
  const handlePledgeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pledgeName.trim()) return;

    // Try API first
    const apiResult = await createPledge({
      name: pledgeName.trim(),
      district: pledgeDistrict,
      trees_count: pledgeCount,
      tree_type: pledgeAction,
    });

    if (apiResult) {
      const newPledge: Pledge = {
        id: String(apiResult.id),
        name: apiResult.name,
        district: apiResult.district,
        treesCount: apiResult.trees_count,
        action: apiResult.tree_type,
        timestamp: new Date(apiResult.timestamp).toLocaleDateString(),
      };
      const updated = [newPledge, ...pledgedList];
      setPledgedList(updated);
      localStorage.setItem('we4climate_pledges', JSON.stringify(updated));
    } else {
      // Fallback: save locally
      const newPledge: Pledge = {
        id: Date.now().toString(),
        name: pledgeName.trim(),
        district: pledgeDistrict,
        treesCount: pledgeCount,
        action: pledgeAction,
        timestamp: new Date().toLocaleDateString(),
      };
      const updated = [newPledge, ...pledgedList];
      setPledgedList(updated);
      localStorage.setItem('we4climate_pledges', JSON.stringify(updated));
    }

    onPledgeAdded(pledgeCount);
    setPledgeName('');
    setPledgeSuccess(true);
    setTimeout(() => setPledgeSuccess(false), 4000);
  };

  return (
    <section id="interactive" className="py-24 bg-gradient-to-b from-emerald-900 via-emerald-950 to-emerald-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Pledge Terminal (Full Width) */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-emerald-950/80 to-emerald-950/60 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Tree Pledge Registry</h3>
                  <p className="text-xs text-emerald-200/60 mt-0.5">Commit to planting indigenous trees across Rwanda</p>
                </div>
              </div>

              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5 flex items-center gap-1.5">
                      Your Full Name
                    </label>
                    <input 
                      type="text" 
                      value={pledgeName}
                      onChange={(e) => setPledgeName(e.target.value)}
                      placeholder="e.g. Ineza Grace"
                      className="w-full bg-emerald-950/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-100/35 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5 flex items-center gap-1.5">
                      Rwanda District
                    </label>
                    <select 
                      value={pledgeDistrict}
                      onChange={(e) => setPledgeDistrict(e.target.value)}
                      className="w-full bg-emerald-950/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer"
                    >
                      {rwandanDistricts.map(idx => (
                        <option key={idx} className="bg-emerald-950 text-white" value={idx}>{idx}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5 flex items-center gap-1.5">
                      Trees to Plant
                    </label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="500" 
                        value={pledgeCount}
                        onChange={(e) => setPledgeCount(parseInt(e.target.value) || 1)}
                        className="w-24 bg-emerald-950/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm text-white text-center focus:outline-none transition-all"
                        required
                      />
                      <span className="text-xs text-emerald-200/70 flex items-center gap-1">
                        indigenous species
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5 flex items-center gap-1.5">
                      Activity Type
                    </label>
                    <select 
                      value={pledgeAction}
                      onChange={(e) => setPledgeAction(e.target.value)}
                      className="w-full bg-emerald-950/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer"
                    >
                      {presetActions.map(act => (
                        <option key={act} className="bg-emerald-950 text-white" value={act}>{act}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-pledge-btn"
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-emerald-950 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.01] active:scale-95 focus:outline-none flex items-center justify-center gap-2"
                >
                  Log Pledge & Update Tracker
                </button>
              </form>

              {/* Success toast */}
              {pledgeSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="pledge-success-toast"
                  className="mt-4 p-4 bg-emerald-900/90 border border-emerald-400/40 text-emerald-300 rounded-xl flex items-center gap-3 text-sm"
                >
                  <span>Pledge recorded! Thank you for contributing to our community tracker.</span>
                </motion.div>
              )}

              {/* Pledge ledger */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-emerald-300/80 flex items-center gap-1.5">
                    Recent Commitments
                  </h4>
                  <span className="bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    Live Feed
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {pledgedList.map((pledge) => (
                    <motion.div
                      key={pledge.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3.5 bg-emerald-950/40 border border-emerald-500/10 rounded-2xl flex items-center justify-between gap-3 hover:bg-emerald-900/40 hover:border-emerald-500/30 transition-all duration-200 group"
                    >
                      <div className="truncate flex items-center gap-3 min-w-0">
                        <div className="hidden sm:flex w-9 h-9 rounded-full bg-gradient-to-br from-emerald-800/50 to-emerald-700/30 border border-emerald-700/30 items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">

                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white truncate max-w-[140px]">{pledge.name}</span>
                            <span className="text-[10px] bg-emerald-800/50 text-emerald-300 px-2 py-0.5 rounded-md uppercase font-mono flex items-center gap-0.5 border border-emerald-700/20">

                              {pledge.district.split(' ')[0]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 mt-1 truncate flex items-center gap-1">

                            {pledge.action}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right ml-2">
                        <div className="font-display font-black text-emerald-400 text-lg leading-none">+{pledge.treesCount}</div>
                        <span className="text-[9px] uppercase font-mono text-emerald-300/50">trees</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Why This Matters — Full-width banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-950/60 to-emerald-950/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-emerald-400/20 flex-shrink-0">

              </div>
              <div className="flex-1">
                <h4 className="text-sm uppercase tracking-wider font-mono text-emerald-300/80 mb-2">
                  Why This Matters
                </h4>
                <p className="text-sm text-emerald-100/70 leading-relaxed">
                  Every tree pledge contributes to Rwanda's goal of restoring 
                  <strong className="text-emerald-300"> 2 million hectares</strong> of degraded land by 2030.
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-300/80 bg-emerald-950/50 rounded-xl px-4 py-3 border border-emerald-800/30 max-w-sm">

                <span>Indigenous species like Markhamia lutea and Newtonia buchananii help preserve Rwanda's unique biodiversity</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
