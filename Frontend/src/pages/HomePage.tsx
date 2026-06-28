import { useState, useEffect, useCallback, useRef } from 'react';
import { Trees, Users, BookOpen, Heart, Camera, Sprout, Globe } from 'lucide-react';

interface HomePageProps {
  treesPledgedTotal: number;
  handleScrollToSection: (id: string) => void;
}

// Images from public/Images/Homepage_pictures for hero slideshow
const HERO_IMAGES = [
  '/Images/Homepage_pictures/1.jpg',
  '/Images/Homepage_pictures/2.jpg',
  '/Images/Homepage_pictures/3.jpg',
  '/Images/Homepage_pictures/4.jpg',
  '/Images/Homepage_pictures/5.jpg',
  '/Images/Homepage_pictures/6.jpg',
  '/Images/Homepage_pictures/7.jpg',
  '/Images/Homepage_pictures/8.jpg',
  '/Images/Homepage_pictures/9.jpg',
  '/Images/Homepage_pictures/10.jpg',
  '/Images/Homepage_pictures/11.jpg',
  '/Images/Homepage_pictures/12.jpg',
  '/Images/Homepage_pictures/13.jpg',
  '/Images/Homepage_pictures/Education.jpg',
  '/Images/Homepage_pictures/Research.jpg',
];

/** Preload all hero images so they are ready when the slideshow transitions. */
function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // resolve anyway so slideshow isn't blocked
          img.src = url;
        }),
    ),
  );
}

export default function HomePage({ treesPledgedTotal }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesReady, setImagesReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload all images on mount
  useEffect(() => {
    preloadImages(HERO_IMAGES).then(() => setImagesReady(true));
  }, []);

  // Auto-slide every 4 seconds — start only after images are preloaded
  useEffect(() => {
    if (!imagesReady) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [imagesReady]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative">
      {/* ────────────── HERO SECTION ────────────── */}
      <section
        id="hero"
        className="relative min-h-[400px] md:min-h-[70vh] lg:min-h-screen max-h-[1000px] flex items-center justify-center overflow-hidden"
      >
        {/* Slideshow background */}
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              fetchPriority={index === currentSlide ? 'high' : 'low'}
              loading="eager"
            />
          </div>
        ))}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        {/* Slide indicators */}
        <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 max-w-[90vw] overflow-x-auto flex gap-1.5 sm:gap-2 px-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`flex-shrink-0 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-emerald-400 w-5 sm:w-8 h-1.5 sm:h-2.5'
                  : 'bg-white/40 hover:bg-white/70 w-1.5 sm:w-2.5 h-1.5 sm:h-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Hero content — transparent card, no buttons */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 md:py-12 lg:py-16">
          <h1            className="font-display text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] leading-relaxed max-w-5xl mx-auto">
            We are a{' '}
            <span className="text-emerald-300 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              community benefit organization
            </span>{' '}
            advancing regenerative agriculture, ecosystem restoration, environmental
            education, and climate resilience across Rwanda and Africa.
          </h1>
        </div>

      </section>

      {/* ────────────── WHAT WE DO SECTION ────────────── */}
      <section id="what-we-do" className="py-24 bg-brand-50 relative overflow-hidden">
        {/* Background ornament */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
              What We Do!
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              We restore degraded landscapes through regenerative agriculture, agroforestry,
              food forests, rainwater harvesting, and biodiversity conservation. Our
              demonstration sites empower communities to regenerate soils, restore ecosystems,
              and build climate resilience.
            </p>
          </div>

          {/* 3 cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Card 1 – Regenerative Agriculture */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/Images/Homepage_pictures/1.jpg"
                  alt="Regenerative Agriculture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/90 backdrop-blur-sm rounded-xl">
                    <Sprout className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Regenerative Agriculture</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                  Regenerative Agriculture & Ecosystem Restoration
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We restore degraded landscapes through regenerative agriculture,
                  agroforestry, food forests, rainwater harvesting, and biodiversity
                  conservation. Our demonstration sites empower communities to regenerate
                  soils, restore ecosystems, and build climate resilience.
                </p>
              </div>
            </div>

            {/* Card 2 – Climate Education */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/Images/Homepage_pictures/Education.jpg"
                  alt="Climate Education"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/90 backdrop-blur-sm rounded-xl">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Climate Education</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                  Climate Education & Community Empowerment
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We equip farmers, youth, women, and schools with practical knowledge and
                  skills through environmental education, training programs, workshops, and
                  our Kids4Food initiative, inspiring communities to become active stewards
                  of nature.
                </p>
              </div>
            </div>

            {/* Card 3 – Research & Innovation */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/Images/Homepage_pictures/Research.jpg"
                  alt="Research & Innovation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/90 backdrop-blur-sm rounded-xl">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Research & Innovation</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                  Research, Innovation & Partnerships
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We collaborate with communities, researchers, governments, and
                  international partners to develop, test, and scale innovative nature-based
                  solutions that strengthen livelihoods, restore landscapes, and contribute
                  to sustainable development across Rwanda and Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── HOW WE DO IT SECTION ────────────── */}
      <section id="how-we-do-it" className="py-24 bg-emerald-950 text-white relative overflow-hidden">
        {/* Background ornaments */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
              How We Do It
            </h2>
            <p className="mt-4 text-lg text-emerald-100/80 leading-relaxed">
              We combine on-the-ground demonstrations, community empowerment, and
              storytelling to create lasting environmental change.
            </p>
          </div>

          {/* 3 cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Card 1 – Demonstrate Solutions */}
            <div className="bg-emerald-900/30 border border-emerald-800/40 rounded-3xl overflow-hidden hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/Images/Homepage_pictures/4.jpg"
                  alt="Demonstrate Solutions"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/90 backdrop-blur-sm rounded-xl">
                    <Trees className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Demonstrate Solutions</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Step 1
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">
                  Demonstrate Solutions
                </h3>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  We establish living demonstration sites, including food forests,
                  regenerative farms, community nurseries, and rainwater harvesting
                  systems, where people can see, learn, and replicate nature-based
                  solutions.
                </p>
              </div>
            </div>

            {/* Card 2 – Empower Communities */}
            <div className="bg-emerald-900/30 border border-emerald-800/40 rounded-3xl overflow-hidden hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/Images/Homepage_pictures/5.jpg"
                  alt="Empower Communities"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/90 backdrop-blur-sm rounded-xl">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Empower Communities</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Step 2
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">
                  Empower Communities
                </h3>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  We work alongside farmers, youth, women, schools, and local leaders
                  through hands-on training, mentorship, and environmental education,
                  enabling communities to become active agents of restoration and climate
                  resilience.
                </p>
              </div>
            </div>

            {/* Card 3 – Inspire Through Storytelling */}
            <div className="bg-emerald-900/30 border border-emerald-800/40 rounded-3xl overflow-hidden hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
              <div className="relative h-52 overflow-hidden">
                <img
                  src="/Images/Homepage_pictures/6.jpg"
                  alt="Inspire Through Storytelling"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/90 backdrop-blur-sm rounded-xl">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm">Inspire Through Storytelling</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Step 3
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">
                  Inspire Through Storytelling
                </h3>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  We document and share stories of environmental restoration, innovation,
                  and community leadership through digital media, films, photography, and
                  campaigns, inspiring more people to take action for people and the planet.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <button
              onClick={() => scrollToSection('hero')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              <Heart className="h-5 w-5" />
              <span>Join Us in Restoring Our Planet</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
