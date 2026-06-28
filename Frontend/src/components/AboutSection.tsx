import { useState } from 'react';
import { Eye, Target, Sparkles, Globe, Leaf } from 'lucide-react';

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState<'vision' | 'mission'>('vision');

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ──────────── Vision + Mission Tabbed Card ──────────── */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-3xl border border-emerald-800 shadow-xl overflow-hidden">
            
            {/* Tab Buttons */}
            <div className="flex border-b border-emerald-800">
              <button
                onClick={() => setActiveTab('vision')}
                className={`flex-1 flex items-center justify-center gap-3 py-5 text-lg font-bold transition-all duration-300 ${
                  activeTab === 'vision'
                    ? 'bg-emerald-900/60 text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-200/50 hover:text-emerald-200 hover:bg-emerald-900/30'
                }`}
              >
                <Eye className={`h-6 w-6 ${activeTab === 'vision' ? 'text-emerald-400' : 'text-emerald-200/40'}`} />
                Our Vision
              </button>
              <button
                onClick={() => setActiveTab('mission')}
                className={`flex-1 flex items-center justify-center gap-3 py-5 text-lg font-bold transition-all duration-300 ${
                  activeTab === 'mission'
                    ? 'bg-emerald-900/60 text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-200/50 hover:text-emerald-200 hover:bg-emerald-900/30'
                }`}
              >
                <Target className={`h-6 w-6 ${activeTab === 'mission' ? 'text-emerald-400' : 'text-emerald-200/40'}`} />
                Our Mission
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8 sm:p-12 lg:p-14">
              {activeTab === 'vision' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                  {/* Vision Text */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-800 rounded-2xl text-emerald-400">
                        <Eye className="h-8 w-8" />
                      </div>
                      <span className="text-sm font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                        Our Vision
                      </span>
                    </div>
                    <p className="text-emerald-100/90 leading-relaxed text-xl sm:text-2xl lg:text-[22px]">
                      We envision a world where communities live in harmony with nature, 
                      restoring ecosystems, regenerating landscapes, and building resilient 
                      livelihoods through climate action and regenerative practices.
                    </p>
                  </div>

                  {/* Vision Image */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                    <img
                      src="/Images/Homepage_pictures/8.jpg"
                      alt="Vision - Harmony with Nature"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="p-2 bg-emerald-500/80 backdrop-blur-sm rounded-xl">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                  {/* Mission Image (reversed order on desktop) */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group order-1 lg:order-2">
                    <img
                      src="/Images/Homepage_pictures/4.jpg"
                      alt="Mission - Community Empowerment"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="p-2 bg-emerald-500/80 backdrop-blur-sm rounded-xl">
                        <Leaf className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Mission Text */}
                  <div className="order-2 lg:order-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-800 rounded-2xl text-emerald-400">
                        <Target className="h-8 w-8" />
                      </div>
                      <span className="text-sm font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                        Our Mission
                      </span>
                    </div>
                    <p className="text-emerald-100/90 leading-relaxed text-xl sm:text-2xl lg:text-[22px]">
                      To empower communities to regenerate landscapes, build climate resilience, 
                      and create sustainable livelihoods through restoration, education, 
                      innovation, and community action.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700">
            <Sparkles className="h-4 w-4" />
            <span>Restoring nature and empowering communities are inseparable</span>
          </div>
        </div>

      </div>
    </section>
  );
}
