import { useState } from 'react';
import { Target, Users, Landmark, UserCheck, CalendarDays, Compass } from 'lucide-react';

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision' | 'nexus'>('mission');

  const missionPoints = [
    {
      id: 1,
      title: "Empowering Rwandan Communities",
      desc: "Providing tools, knowledge, and authority to achieve robust environmental and biodiversity conservation from Kigali to nationwide districts."
    },
    {
      id: 2,
      title: "Elevating Community Voices",
      desc: "Establishing a premier platform for dialogues, where ideas are voiced, heard, and integrated into national climate frameworks."
    },
    {
      id: 3,
      title: "Linking to Green Projects & Initiatives",
      desc: "Bridging the gap between active community members, real-world internships, conservation grants, and decent sustainable green jobs."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-600 font-mono text-sm font-semibold tracking-wider uppercase bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-3">
            Who We Are
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            A Collaborative Climate Network For Communities
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Based in Kigali, Rwanda, we promote community equity and nature-based solutions to build a sustainable nationwide network.
          </p>
        </div>

        {/* Narrative & Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Story & Engagement */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-display font-bold text-2xl text-emerald-950">
              The Challenge and Our Commitment
            </h3>
            
            <p className="text-gray-600 text-base leading-relaxed">
              Rwanda is facing real, tangible impacts of climate change. As active community members, we refuse to remain passive observers. We understand that we are primary keys to unlocking sustainable mitigation and adaptation measures across our beautiful countryside.
            </p>

            <p className="text-gray-600 text-base leading-relaxed">
              True community empowerment isn't achieved in isolation. We link community groups directly with <span className="font-semibold text-emerald-700">elder generations and master experts</span> who have spent decades defending our soils and biodiversity. This collaborative framework transforms inspiration into technical capability.
            </p>

            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start space-x-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-base">Meaningful Engagement</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We organize local webinars, run countryside tree-planting projects, support community environmental scholars, and secure placements in crucial conservation channels.
                </p>
              </div>
            </div>

            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start space-x-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-base">Co-Designing Our Future</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We bridge the gap between community activists and national policy decision-makers, ensuring frontline communities are never forgotten in regional and global climate solutions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Tabs & Core Directives */}
          <div className="lg:col-span-5">
            <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Target className="h-48 w-48 text-emerald-400" />
              </div>

              {/* Sub-tabs header */}
              <div className="flex border-b border-emerald-900 mb-6 pb-2">
                <button
                  id="tab-btn-mission"
                  onClick={() => setActiveTab('mission')}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 tracking-tight transition-all uppercase ${
                    activeTab === 'mission' 
                      ? 'border-emerald-400 text-emerald-400' 
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Our Mission
                </button>
                <button
                  id="tab-btn-vision"
                  onClick={() => setActiveTab('vision')}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 tracking-tight transition-all uppercase ${
                    activeTab === 'vision' 
                      ? 'border-emerald-400 text-emerald-400' 
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Intergenerational equity
                </button>
              </div>

              {/* Tab Display Area */}
              {activeTab === 'mission' && (
                <div id="tab-content-mission" className="space-y-6">
                  <p className="text-emerald-100/90 text-sm leading-relaxed">
                    To establish an effective, sustainable nationwide environmental community network that promotes, informs, advocates, and mobilizes Rwandan communities to engage, resulting in conservation and decent green jobs.
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    {missionPoints.map((pt) => (
                      <div key={pt.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold text-xs">
                          {pt.id}
                        </div>
                        <div>
                          <h5 className="font-semibold text-emerald-300 text-sm">{pt.title}</h5>
                          <p className="text-xs text-gray-300 mt-1">{pt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'vision' && (
                <div id="tab-content-vision" className="space-y-4">
                  <div className="flex justify-center my-4">
                    <div className="p-4 bg-emerald-900/60 rounded-full border border-emerald-500/20">
                      <Users className="h-10 w-10 text-emerald-400" />
                    </div>
                  </div>
                  <h4 className="font-display font-semibold text-emerald-300 text-center text-lg">
                    The Expert-Community Synergy
                  </h4>
                  <p className="text-emerald-100/90 text-sm leading-relaxed text-center">
                    We4Climate operates on a peerless collaborative pairing mechanism. By connecting Kigali's active community members with senior forestry, biodiversity, & climate scientists, we ensure our action campaigns are highly rigorous, scientifically valid, and practically effective.
                  </p>
                  <blockquote className="border-l-2 border-emerald-400 pl-4 italic text-xs text-emerald-200/80 my-4">
                    "True sustainability is built when the energy and passion of communities are guided by the deep, on-ground wisdom of local elders and scientific experts."
                  </blockquote>
                </div>
              )}
            </div>

            {/* Quality Quote from Kigali team */}
            <div className="mt-6 p-6 rounded-2xl bg-brand-100/40 border border-emerald-500/10 text-center">
              <span className="text-xs font-mono text-emerald-800 uppercase tracking-widest block mb-2">Our Operational Base</span>
              <p className="text-sm font-semibold text-emerald-950">
                KK 508 St, Kicukiro, Kigali, Rwanda
              </p>
              <span className="text-xs text-gray-500 mt-1 block">Empowering local minds for systemic, global solutions.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
