import { useState, useEffect, FormEvent } from 'react';
import { 
  Briefcase, Search, Calendar, MapPin, 
  ArrowUpRight, X, CheckCircle2,
  Clock, BookOpen, Clock3, ExternalLink, Building2
} from 'lucide-react';
import { Opportunity, Webinar } from '../types';
import { submitApplication, fetchOpportunities, fetchWebinars, registerForWebinar, type ApiOpportunity, type ApiWebinar } from '../api/client';

const HARDCODED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp1', title: "Forestry & Agroforestry Field Assistant", type: 'Internship',
    location: 'Musanze (Northern Province)', deadline: "June 30, 2026",
    description: "Collaborate directly with senior local foresters and support community-led tree planting coordinates.",
    requirements: ["Enrolled in Environment, Forestry, or Agronomy", "Based in or able to relocate to Musanze", "Passion for soil and ecosystem restoration"],
  },
  {
    id: 'opp2', title: "District Environmental Club Coordinator", type: 'Volunteer',
    location: 'Bugesera & Kayonza', deadline: "July 05, 2026",
    description: "Empower primary and secondary school student units. Set up interactive nature tables and plant school orchards.",
    requirements: ["Exceptional team leadership skills", "Comfortable organizing district learning seminars", "Available at least 8 hours a week"],
  },
  {
    id: 'opp3', title: "Urban Wetland Advocacy Officer", type: 'Job',
    location: 'Kigali (Kicukiro HQ)', deadline: "July 15, 2026",
    description: "Manage campaigns raising urban biodiversity awareness around Kigali's major valleys and restored parks.",
    requirements: ["Bachelor's in Environmental Science or PR", "Fluent in English and Kinyarwanda", "Proven history of running ecological campaigns"],
  },
  {
    id: 'opp4', title: "Nature-Based Solutions Development Leader", type: 'Job',
    location: 'Kigali (Kicukiro HQ)', deadline: "July 28, 2026",
    description: "Design technical models for community soil restoration and hillside binding across Rwanda.",
    requirements: ["2+ years in biodiversity conservation or NBS", "Understanding of CBD and Paris Agreement targets", "Passionate trainer for intergenerational equity"],
  },
];

function apiOppToOpportunity(api: ApiOpportunity): Opportunity {
  return {
    id: String(api.id),
    title: api.title,
    type: api.type as Opportunity['type'],
    location: api.location,
    deadline: api.deadline || 'Rolling',
    description: api.description,
    requirements: api.requirements,
    is_external: api.is_external,
    external_url: api.external_url,
  };
}

const typeConfig: Record<string, { label: string; colors: string }> = {
  Job: { label: 'Job', colors: 'bg-amber-100 text-amber-800 border-amber-200' },
  Internship: { label: 'Internship', colors: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  Volunteer: { label: 'Volunteer', colors: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  Workshop: { label: 'Workshop', colors: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export default function OpportunityHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Job' | 'Internship' | 'Volunteer' | 'Workshop'>('All');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantCover, setApplicantCover] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(HARDCODED_OPPORTUNITIES);
  const [loadingOpps, setLoadingOpps] = useState(true);

  // Webinar state (fetched from API)
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [registeredWebinarIds, setRegisteredWebinarIds] = useState<number[]>([]);
  const [webinarsLoading, setWebinarsLoading] = useState(true);

  // Fetch opportunities and webinars from the backend API
  useEffect(() => {
    const load = async () => {
      setLoadingOpps(true);
      const apiOpps = await fetchOpportunities();
      if (apiOpps && apiOpps.length > 0) {
        setOpportunities(apiOpps.map(apiOppToOpportunity));
      }
      setLoadingOpps(false);

      const apiWebinars = await fetchWebinars();
      if (apiWebinars.length > 0) {
        setWebinars(apiWebinars.map((w) => ({
          id: String(w.id),
          title: w.title,
          speaker: w.speaker_title ? `${w.speaker} (${w.speaker_title})` : w.speaker,
          date: w.date,
          time: w.time,
          registeredCount: w.registered_count,
          description: w.description,
        })));
      } else {
        // Fallback hardcoded webinars when API is unreachable
        setWebinars([
          {
            id: 'w1',
            title: "Intergenerational Action: Community Dialogue with Elder Experts",
            speaker: "Dr. Jean d'Amour (REMA) & We4Climate Delegates",
            date: "June 25, 2026", time: "2:00 PM - 4:00 PM CAT",
            registeredCount: 84,
            description: "Establishing vital knowledge channels between seasoned conservation guardians and active community members."
          },
          {
            id: 'w2',
            title: "Radical Terracing and Nature-Based Hillside Solutions",
            speaker: "Umuhoza Sonia (Ecosystem Integrity Lead)",
            date: "July 12, 2026", time: "10:30 AM - 12:00 PM CAT",
            registeredCount: 42,
            description: "Practical methods for land degradation prevention, agroforestry integration, and hillside binding."
          }
        ]);
      }
      setWebinarsLoading(false);
    };
    load();
  }, []);

  // Filters
  const filteredOpps = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || opp.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Deadline indicator
  const deadlineColor = (deadline: string) => {
    if (deadline === 'Rolling') return 'text-emerald-600';
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'text-rose-500';
    if (days < 14) return 'text-amber-600';
    return 'text-gray-500';
  };

  const handleApplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!applicantEmail.trim() || !selectedOpp) return;

    const result = await submitApplication({
      opportunity_id: selectedOpp.id,
      applicant_name: applicantEmail.trim().split('@')[0] || 'Opportunity Applicant',
      applicant_email: applicantEmail.trim(),
      cover_letter: applicantCover.trim(),
    });

    if (!result) console.warn('Backend unreachable – application saved locally only');

    setApplySuccess(true);
    setApplicantEmail('');
    setApplicantCover('');
    setTimeout(() => {
      setApplySuccess(false);
      setSelectedOpp(null);
    }, 4000);
  };

  const handleRegisterWebinar = async (id: string) => {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      // Fallback for hardcoded webinars (no API)
      if (registeredWebinarIds.includes(id)) return;
      setRegisteredWebinarIds(prev => [...prev, id]);
      setWebinars(prev => prev.map(web => web.id === id ? { ...web, registeredCount: web.registeredCount + 1 } : web));
      return;
    }
    if (registeredWebinarIds.includes(numId)) return;
    const result = await registerForWebinar(numId);
    if (result) {
      setRegisteredWebinarIds(prev => [...prev, numId]);
      setWebinars(prev => prev.map(web =>
        web.id === id ? { ...web, registeredCount: result.registered_count } : web
      ));
    }
  };

  const FILTER_OPTIONS = ['All', 'Job', 'Internship', 'Volunteer', 'Workshop'] as const;

  return (
    <section id="opportunities" className="py-24 bg-white relative">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-700 font-mono text-sm font-semibold tracking-wider uppercase bg-emerald-100 px-4 py-1.5 rounded-full inline-block mb-3">
            Get Involved
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            Decent Green Jobs & Learning Platforms
          </h2>
          <p className="mt-4 text-lg text-gray-650 leading-relaxed">
            Linking our energetic community members to constructive, compensated internships, leadership roles, and expert-led webinars across Rwanda.
          </p>
        </div>

        {/* Opportunities and Webinars Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Opportunities Section (Left - Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <h3 className="font-display font-bold text-xl text-emerald-950 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <span>Green Postings Finder</span>
              </h3>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs, locations..." 
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 hover:bg-gray-100/60 border border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((filt) => (
                <button
                  key={filt}
                  onClick={() => setActiveFilter(filt)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                    activeFilter === filt
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filt === 'All' ? 'All' : `${filt}s`}
                </button>
              ))}
            </div>

            {/* Postings Stream */}
            <div className="space-y-4">
              {loadingOpps ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <p className="text-sm text-gray-500">Loading opportunities…</p>
                  </div>
                </div>
              ) : filteredOpps.length > 0 ? (
                filteredOpps.map((opp) => {
                  const typeCfg = typeConfig[opp.type] || { label: opp.type, colors: 'bg-gray-100 text-gray-600' };
                  return (
                    <div 
                      key={opp.id}
                      id={`opp-card-${opp.id}`}
                      className="p-5 border border-gray-100 hover:border-emerald-500/30 rounded-2xl bg-gray-50/50 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 max-w-md">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider border ${typeCfg.colors}`}>
                            {typeCfg.label}
                          </span>
                          {opp.is_external && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-sky-100 text-sky-700 border-sky-200">
                              <ExternalLink className="h-3 w-3" />
                              External
                            </span>
                          )}
                          <span className="text-gray-400 font-mono text-[10px] flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {opp.location}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {opp.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {opp.description}
                        </p>
                        <div className={`flex items-center gap-1 text-[10px] font-mono ${deadlineColor(opp.deadline)}`}>
                          <Clock className="h-3 w-3" />
                          <span>Deadline: {opp.deadline}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                        {opp.is_external && opp.external_url ? (
                          <a
                            href={opp.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            id={`opp-external-btn-${opp.id}`}
                            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200/50 hover:border-sky-500 text-sky-700 rounded-xl text-xs font-bold transition-all shadow-sm focus:outline-none flex items-center gap-1.5 group-hover:scale-[1.03]"
                          >
                            <span>Apply Externally</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <button
                            onClick={() => setSelectedOpp(opp)}
                            id={`opp-apply-btn-${opp.id}`}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 hover:border-emerald-500 text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-sm focus:outline-none flex items-center gap-1 group-hover:scale-[1.03]"
                          >
                            <span>Apply Unit</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No active green postings fit your filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Webinars Section (Right - Col 5) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-emerald-950 to-emerald-900/90 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <BookOpen className="h-48 w-48 text-emerald-400" />
            </div>

            <div className="flex items-center gap-3 mb-6 border-b border-emerald-850 pb-4">
              <div className="p-2.5 bg-emerald-800/75 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Calendar className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Webinar Classroom</h3>
                <p className="text-[10px] text-emerald-300/70">Expert-led training modules & dialog rooms</p>
              </div>
            </div>

            <div className="space-y-6">
              {webinars.map((web) => (
                <div key={web.id} className="p-4 border border-emerald-800/60 bg-emerald-900/30 rounded-2xl space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" /> {web.date} @ {web.time}
                    </span>
                    <span className="text-[9px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      {web.registeredCount} active seats
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white hover:text-emerald-300 transition-colors">{web.title}</h4>
                  <div className="text-[11px] text-emerald-100/70 leading-relaxed">
                    <span className="block font-semibold text-emerald-300">Host: {web.speaker}</span>
                    <p className="mt-1">{web.description}</p>
                  </div>
                  <button
                    onClick={() => handleRegisterWebinar(web.id)}
                    disabled={registeredWebinarIds.includes(parseInt(web.id, 10)) || registeredWebinarIds.includes(web.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-none ${
                      registeredWebinarIds.includes(parseInt(web.id, 10)) || registeredWebinarIds.includes(web.id)
                        ? 'bg-emerald-900 border border-emerald-700 text-emerald-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-950/20 active:scale-95'
                    }`}
                  >
                    {registeredWebinarIds.includes(parseInt(web.id, 10)) || registeredWebinarIds.includes(web.id) ? (
                      <><CheckCircle2 className="h-4 w-4" /><span>Seat Registered!</span></>
                    ) : (
                      <span>Secure Register Invitation</span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-dashed border-emerald-800 bg-emerald-950/40 text-center">
              <span className="text-xs text-gray-300 block">Want to present your own nature-based research?</span>
              <button 
                onClick={() => {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                Submit abstract pitch to Kicukiro Board
              </button>
            </div>
          </div>
        </div>

        {/* Opportunity Application Modal Overlay - only for internal opps */}
        {selectedOpp && !selectedOpp.is_external && (
          <div id="opp-apply-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/85 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedOpp(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">
                  {selectedOpp.type} Enrollment Desk
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-gray-900 mt-1.5">
                  Apply: {selectedOpp.title}
                </h3>
                <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" /> Located: {selectedOpp.location}
                </span>
              </div>

              {applySuccess ? (
                <div id="opp-apply-success" className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-2xl space-y-3 text-center">
                  <div className="inline-flex p-3 bg-emerald-100 rounded-full text-emerald-600 mb-1">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-base">Application Submitted!</h4>
                  <p className="text-xs leading-relaxed max-w-sm mx-auto">
                    Thanks for your interest. Our recruitment desk in Kicukiro will evaluate your application shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-mono font-semibold text-gray-400">Position Details</h4>
                    <p className="text-gray-650 text-xs mt-1 leading-relaxed">{selectedOpp.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-mono font-semibold text-gray-400 mb-1.5">Minimum Qualifications</h4>
                    <ul className="space-y-1.5">
                      {selectedOpp.requirements.map((req, rIdx) => (
                        <li key={rIdx} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email Address</label>
                      <input 
                        type="email" 
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="e.g. grace@gmail.com"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Why do you want to join this campaign?</label>
                      <textarea 
                        rows={3}
                        value={applicantCover}
                        onChange={(e) => setApplicantCover(e.target.value)}
                        placeholder="Your interests, goals, and availability."
                        className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-all resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                    <button type="submit" id="opp-submit-apply-btn" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md focus:outline-none">
                      Process Application
                    </button>
                    <button type="button" onClick={() => setSelectedOpp(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs transition-all focus:outline-none">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
