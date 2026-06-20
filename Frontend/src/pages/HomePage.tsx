import { ArrowRight, TreePine, Award, Heart, HelpCircle, BookOpen, Briefcase } from 'lucide-react';
import Hero from '../components/Hero';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  treesPledgedTotal: number;
  handleScrollToSection: (id: string) => void;
}

export default function HomePage({ treesPledgedTotal, handleScrollToSection }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Prime Hero Section */}
      <Hero 
        onScrollToSection={handleScrollToSection} 
        treesPledgedTotal={treesPledgedTotal} 
      />

      {/* Main Pillars Grid Navigation - Highlighting modular pages */}
      <section className="py-24 bg-brand-50 relative z-10 border-t border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5cb85c] bg-emerald-50 px-3.5 py-1.5 rounded-full border border-[#5cb85c]/20">
              Interactive Hub
            </span>
            <h2 className="mt-4 font-display font-medium text-3xl sm:text-4xl text-gray-900 tracking-tight">
              Explore Our Community-Led Dimensions
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Every navigation is fully isolated to help you integrate backend systems, retrieve persistent databases, and query real-time Rwanda actions seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* About Pillar */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl w-fit text-[#5cb85c] mb-6">
                  <TreePine className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Our Dedicated Story</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Learn about our origins, intergenerational justice values, and the climate action frameworks we apply across local Rwandan communities.
                </p>
              </div>
              <button 
                onClick={() => navigate('/about')}
                className="flex items-center gap-2 text-sm font-bold text-[#5cb85c] hover:text-[#4ca84c] group transition-colors focus:outline-none"
              >
                <span>Read Story</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Programs Pillar */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl w-fit text-[#5cb85c] mb-6">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Core Action Programs</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  From agroforestry training to the revolutionary Leonard Regeneration Center hub, view the field campaigns we coordinate.
                </p>
              </div>
              <button 
                onClick={() => navigate('/programs')}
                className="flex items-center gap-2 text-sm font-bold text-[#5cb85c] hover:text-[#4ca84c] group transition-colors focus:outline-none"
              >
                <span>View Programs</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Impact Map Pillar */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl w-fit text-[#5cb85c] mb-6">
                  <span className="text-xl">🗺️</span>
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Interactive District Map</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Interact with real Rwandan provincial coordinates, filter distinct reforestation projects, and review live local analytics maps.
                </p>
              </div>
              <button 
                onClick={() => navigate('/impact')}
                className="flex items-center gap-2 text-sm font-bold text-[#5cb85c] hover:text-[#4ca84c] group transition-colors focus:outline-none"
              >
                <span>Explore Map</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Resources Pillar */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl w-fit text-[#5cb85c] mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Manuals & Publications</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Download certified agroecology training guidelines, read stories written by local restoring scientists, and mail for details.
                </p>
              </div>
              <button 
                onClick={() => navigate('/resources')}
                className="flex items-center gap-2 text-sm font-bold text-[#5cb85c] hover:text-[#4ca84c] group transition-colors focus:outline-none"
              >
                <span>Read Resources</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Donate Pillar */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl w-fit text-[#5cb85c] mb-6">
                  <Heart className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Secure Giving Terminal</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Provide direct support to eco-friendly seed acquisitions or nursery beds using automated MTN Push and safe simulated debit.
                </p>
              </div>
              <button 
                onClick={() => navigate('/donate')}
                className="flex items-center gap-2 text-sm font-bold text-[#5cb85c] hover:text-[#4ca84c] group transition-colors focus:outline-none"
              >
                <span>Support Us</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Action Desk */}
            <div className="bg-white p-8 rounded-2xl border border-emerald-500/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl w-fit text-[#5cb85c] mb-6">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">Quiz & Climate Pledge</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Test your real environmental awareness level, secure a custom PDF-ready Restorer Certificate, and register green commitments.
                </p>
              </div>
              <button 
                onClick={() => navigate('/action')}
                className="flex items-center gap-2 text-sm font-bold text-[#5cb85c] hover:text-[#4ca84c] group transition-colors focus:outline-none"
              >
                <span>Take Action Desk</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
