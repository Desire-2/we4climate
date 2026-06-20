import { ArrowRight, Globe, Award, Heart, Scroll } from 'lucide-react';

interface HeroProps {
  onScrollToSection: (id: string) => void;
  treesPledgedTotal: number;
}

export default function Hero({ onScrollToSection, treesPledgedTotal }: HeroProps) {
  const scrollToInteractive = () => {
    onScrollToSection('interactive');
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-950 pt-20"
    >
      {/* Background Image with Dark Emerald Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1920&q=80" 
          alt="Lush Forest of Rwanda" 
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-950/60 to-emerald-950" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-950 to-transparent" />
      </div>

      {/* Floating Sparkles & Abstract Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-bounce-slow" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        {/* Youth-led Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <Globe className="h-4 w-4 animate-spin-slow" />
          <span>Established in Kigali, Rwanda</span>
        </div>

        {/* Display Typography Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          We are <span className="text-emerald-400 relative inline-block">
            Linking Communities
            <span className="absolute left-0 bottom-1 w-full h-[6px] md:h-[8px] bg-emerald-400/20 rounded" />
          </span> to Nature & Tangible Climate Action
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-emerald-100/90 max-w-3xl mx-auto font-sans leading-relaxed">
          We4Climate is a community-driven, non-profit organization promoting collaboration, action, and equity in the environmental and climate nexus. Rooted in community solutions, we co-design a sustainable future together.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-cta-btn"
            onClick={scrollToInteractive}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-base shadow-xl shadow-emerald-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 focus:outline-none"
          >
            <span>Take the Community Pledge</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button
            id="hero-learn-btn"
            onClick={() => onScrollToSection('about')}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-base border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 focus:outline-none"
          >
            Read Our Story
          </button>
        </div>

        {/* Live Counter & Statistics Dashboard */}
        <div id="impact-bar" className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm max-w-5xl mx-auto">
          
          {/* Stat 1 */}
          <div className="flex flex-col items-center justify-center border-r border-emerald-500/10 last:border-0 pr-2 md:pr-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl mb-3">
              <span className="h-6 w-6 text-emerald-400 font-bold block text-center">🌍</span>
            </div>
            <span className="text-white font-display text-2xl md:text-3xl font-extrabold tracking-tight">Kigali</span>
            <span className="mt-1 text-xs md:text-sm text-emerald-300/80 font-mono uppercase tracking-wider text-center">Headquarters, Rwanda</span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center justify-center border-r border-emerald-500/10 last:border-0 px-2 md:px-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl mb-3">
              <Award className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-white font-display text-2xl md:text-3xl font-extrabold tracking-tight">30 Districts</span>
            <span className="mt-1 text-xs md:text-sm text-emerald-300/80 font-mono uppercase tracking-wider text-center">Community Outreach Units</span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center justify-center border-r border-emerald-500/10 last:border-0 px-2 md:px-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl mb-3">
              <Heart className="h-6 w-6 text-emerald-400 animate-pulse" />
            </div>
            <span className="text-white font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              {(1820 + treesPledgedTotal).toLocaleString()}
            </span>
            <span className="mt-1 text-xs md:text-sm text-emerald-300/80 font-mono uppercase tracking-wider text-center">Trees Planted / Pledged</span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center justify-center last:border-0 pl-2 md:pl-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl mb-3">
              <span className="h-6 w-6 text-emerald-400 font-bold block text-center">👥</span>
            </div>
            <span className="text-white font-display text-2xl md:text-3xl font-extrabold tracking-tight">Community First</span>
            <span className="mt-1 text-xs md:text-sm text-emerald-300/80 font-mono uppercase tracking-wider text-center">Driven and Designed</span>
          </div>

        </div>
      </div>
    </section>
  );
}
