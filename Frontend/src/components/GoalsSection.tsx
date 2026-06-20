import { useState, useEffect } from 'react';
import { 
  Users, Lightbulb, GraduationCap, Users2, ShieldAlert, 
  Globe2, Landmark, ShieldCheck, HeartHandshake, Eye,
  ArrowRight, X, Sparkles, CheckCircle2, Target
} from 'lucide-react';
import { fetchImpactGoals, type ApiImpactGoal } from '../api/client';

// Fallback goals when API is unavailable (10 original pillars)
const FALLBACK_GOALS: ApiImpactGoal[] = [
  { id: 1, title: "Positive Community Perceptions", description: "Cultivate positive environmental priorities and habits in Rwanda's communities without causing generational friction.", icon: "Eye", milestone: "92% Positive feedback in regional neighborhood campaigns", action_details: "Participate in local eco-dialogues, share inspirational updates with your peers, and organize environment days in your community.", sort_order: 1, is_active: true, created_at: '' },
  { id: 2, title: "Community & Expert Dialogues", description: "Establish strong, respectful channels for environmental dialogue between local communities and senior climate professionals.", icon: "Users", milestone: "24 Climate Webinars & 12 Roundtables completed", action_details: "Register for our upcoming Dialogue series where we challenge policy-makers together.", sort_order: 2, is_active: true, created_at: '' },
  { id: 3, title: "Nature-Based Solutions (NBS)", description: "Train Rwandan community members to design and deploy nature-based systems for land restoration and climate resilience.", icon: "Lightbulb", milestone: "4 Local soil preservation pilots running in Kicukiro", action_details: "Join local training cohorts on terracing, agroforestry design, and watershed management.", sort_order: 3, is_active: true, created_at: '' },
  { id: 4, title: "Ecology Education", description: "Conduct dynamic environment, wildlife, and resource conservation classes across all rural and urban sectors.", icon: "GraduationCap", milestone: "45 Countryside learning modules distributed", action_details: "Volunteer as an environment guide to teach primary school children the fundamentals of ecosystem preservation.", sort_order: 4, is_active: true, created_at: '' },
  { id: 5, title: "Empower Local Communities", description: "Guarantee active community involvement and benefits inside every conservation project we sponsor.", icon: "Users2", milestone: "1,200+ Local residents directly employed", action_details: "Contribute to town hall agendas, hire local community caretakers, and buy local biological seeds.", sort_order: 5, is_active: true, created_at: '' },
  { id: 6, title: "Early-Age Sensitization", description: "Introduce nature protection values to children from infancy to nurture a generation of natural guardians.", icon: "ShieldAlert", milestone: "8 Primary school nature nurseries started", action_details: "Download we4climate children stories and coordinate environmental club playgroups in your estate.", sort_order: 6, is_active: true, created_at: '' },
  { id: 7, title: "National & Global Advocacy", description: "Represent the voices and insights of Rwandan communities in high-profile international summits like UNEP and COP.", icon: "Globe2", milestone: "Delegate entries submitted to COY and regional bodies", action_details: "Contribute to our annual policy recommendations report compiled by community leaders.", sort_order: 7, is_active: true, created_at: '' },
  { id: 8, title: "District Environmental Clubs", description: "Integrate, support, and connect active high-school and community club units coordinates at district levels.", icon: "Landmark", milestone: "15 Registered district clubs actively operating", action_details: "Register your local village group or school class as an official We4Climate district branch.", sort_order: 8, is_active: true, created_at: '' },
  { id: 9, title: "International Accord Support", description: "Promote education and local compliance with major biodiversity and safety targets (e.g., Paris Agreement, CBD).", icon: "ShieldCheck", milestone: "10 compliance toolkits compiled for local municipal leaders", action_details: "Review our compiled legal handbooks on local carbon offsets, municipal water protocols, and wildlife treaties.", sort_order: 9, is_active: true, created_at: '' },
  { id: 10, title: "Capacity & Skills Training", description: "Reinforce our membership resources with masterclasses, advice, research publications, and legal counsel.", icon: "HeartHandshake", milestone: "240 Trained leaders granted certificates of capability", action_details: "Enroll in the We4Climate Core Training program to secure verified conservation credentials.", sort_order: 10, is_active: true, created_at: '' },
];

export default function GoalsSection() {
  const [selectedGoal, setSelectedGoal] = useState<ApiImpactGoal | null>(null);
  const [goals, setGoals] = useState<ApiImpactGoal[]>(FALLBACK_GOALS);

  useEffect(() => {
    fetchImpactGoals().then((data) => {
      if (data.length > 0) setGoals(data);
    });
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye className="h-6 w-6 text-emerald-400" />;
      case 'Users': return <Users className="h-6 w-6 text-emerald-400" />;
      case 'Lightbulb': return <Lightbulb className="h-6 w-6 text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="h-6 w-6 text-emerald-400" />;
      case 'Users2': return <Users2 className="h-6 w-6 text-emerald-400" />;
      case 'ShieldAlert': return <ShieldAlert className="h-6 w-6 text-emerald-400" />;
      case 'Globe2': return <Globe2 className="h-6 w-6 text-emerald-400" />;
      case 'Landmark': return <Landmark className="h-6 w-6 text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck className="h-6 w-6 text-emerald-400" />;
      case 'HeartHandshake': return <HeartHandshake className="h-6 w-6 text-emerald-400" />;
      case 'Target': return <Target className="h-6 w-6 text-emerald-400" />;
      default: return <Sparkles className="h-6 w-6 text-emerald-400" />;
    }
  };

  return (
    <section id="goals" className="py-24 bg-gradient-to-b from-white to-emerald-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-700 font-mono text-sm font-semibold tracking-wider uppercase bg-emerald-100 px-4 py-1.5 rounded-full inline-block mb-3">
            Our Strategy
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            10 Pillars of Change for Rwanda
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            The charter objectives guiding We4Climate. Click any pillar card to explore milestones and live participation tactics.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {goals.map((goal) => (
            <div 
              key={goal.id} 
              id={`goal-card-${goal.id}`}
              onClick={() => setSelectedGoal(goal)}
              className="bg-emerald-950 border border-emerald-900 rounded-3xl p-6 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer shadow-lg shadow-emerald-950/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between">
                <div className="p-3.5 bg-emerald-900/60 rounded-2xl border border-emerald-500/10">
                  {getIcon(goal.icon)}
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                  Pillar {goal.id}
                </span>
              </div>

              <h3 className="mt-6 font-display font-bold text-lg text-white leading-tight group-hover:text-emerald-300 transition-colors">
                {goal.title}
              </h3>

              <p className="mt-2.5 text-sm text-gray-300 line-clamp-3 leading-relaxed">
                {goal.description}
              </p>

              <div className="mt-5 pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-400">
                <span className="font-mono font-medium truncate max-w-[180px] flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  {goal.milestone}
                </span>
                <span className="font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Goal Detail Modal Overlay */}
        {selectedGoal && (
          <div 
            id="goal-detail-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/85 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-emerald-100 transform transition-all duration-300 scale-100 max-h-[85vh] overflow-y-auto">
              
              {/* Close Button */}
              <button 
                id="close-goal-modal"
                onClick={() => setSelectedGoal(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-900 rounded-2xl">
                  {getIcon(selectedGoal.icon)}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    Pillar {selectedGoal.id}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-gray-900 mt-1">
                    {selectedGoal.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-mono font-semibold text-gray-400">Strategic Vision</h4>
                  <p className="text-gray-700 text-sm sm:text-base mt-1.5 leading-relaxed">
                    {selectedGoal.description}
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 block">Current Milestone Status</span>
                    <span className="text-emerald-950 text-sm font-semibold">{selectedGoal.milestone}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-800 block">How Rwandan Communities Can Support This</span>
                  <p className="text-gray-700 text-sm mt-1.5 leading-relaxed">
                    {selectedGoal.action_details}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  id="modal-act-btn"
                  onClick={() => {
                    setSelectedGoal(null);
                    const element = document.getElementById('interactive');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md focus:outline-none"
                >
                  Go to Action Desk
                </button>
                <button
                  id="modal-close-btn"
                  onClick={() => setSelectedGoal(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all focus:outline-none"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
