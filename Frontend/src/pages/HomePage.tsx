import { useState, useEffect, useCallback, useRef } from 'react';


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
  '/Images/Homepage_pictures/7.jpg',
  '/Images/Homepage_pictures/8.jpg',
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
        className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden pt-[100px]"
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

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-emerald-400 w-8'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Dark gradient overlay behind the hero text for readability over any image */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* Hero message — anchored at the bottom of the slideshow */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 px-4 text-center sm:bottom-20">
          <h1
            className="mx-auto max-w-6xl font-display text-xl font-bold leading-tight tracking-wider text-white sm:text-2xl md:text-3xl lg:text-4xl"
            style={{
              textShadow: [
                '0 1px 0 rgba(0,0,0,0.6)',
                '0 2px 0 rgba(0,0,0,0.5)',
                '0 3px 0 rgba(0,0,0,0.4)',
                '0 4px 0 rgba(0,0,0,0.35)',
                '0 5px 0 rgba(0,0,0,0.3)',
                '0 6px 2px rgba(0,0,0,0.25)',
                '0 8px 4px rgba(0,0,0,0.2)',
                '0 12px 8px rgba(0,0,0,0.15)',
              ].join(', '),
            }}
          >
            We Promote Regenerative Agriculture, Ecosystem Restoration, Climate Resilience And Education
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
                  src="/Images/What_We_Do/regenerative-agriculture.jpg"
                  alt="Regenerative Agriculture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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
                  src="/Images/What_We_Do/climate-education.jpg"
                  alt="Climate Education"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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
                  src="/Images/What_We_Do/research-innovation.jpg"
                  alt="Research & Innovation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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
                  src="/Images/How_We_Do_It/demonstrate-solutions.jpg"
                  alt="Demonstrate Solutions"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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
                  src="/Images/How_We_Do_It/empower-communities.jpg"
                  alt="Empower Communities"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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
                  src="/Images/How_We_Do_It/inspire-storytelling.jpg"
                  alt="Inspire Through Storytelling"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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
              <span>Join Us in restoring our planet by volunteering</span>
            </button>
          </div>
        </div>
      </section>

      {/* ────────────── OUR PARTNERS SECTION ────────────── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-50/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
              Our Partners
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              We collaborate with organizations and networks that share our vision for restoring landscapes,
              empowering communities, and building climate resilience across Rwanda and beyond.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center">
            {/* CFC */}
            <a
              href="https://collaborativeforchange.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
            >
              <div className="w-full h-28 flex items-center justify-center">
                <img
                  src="/Images/Partners_logos/CFC.png"
                  alt="Collaborative for Change"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </a>

            {/* REFARMERS */}
            <a
              href="https://www.refarmers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
            >
              <div className="w-full h-28 flex items-center justify-center">
                <img
                  src="/Images/Partners_logos/REFARMERS.jpg"
                  alt="REFARMERS"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </a>

            {/* WFF Rwanda */}
            <a
              href="https://worldfoodforumrwanda.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
            >
              <div className="w-full h-28 flex items-center justify-center">
                <img
                  src="/Images/Partners_logos/WFF-RWANDA.png"
                  alt="WFF Rwanda"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
