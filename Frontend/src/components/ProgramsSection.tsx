import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  Landmark, Trees, Droplets, Globe, Apple, 
  Hexagon, MapPin, ExternalLink, Sparkles, ArrowRight
} from 'lucide-react';

interface ProgramItem {
  id: string;
  title: string;
  icon: typeof Landmark;
  description: string;
  image: string;
  link?: { text: string; url: string };
  color: string;
  gradientFrom: string;
}

const programs: ProgramItem[] = [
  {
    id: 'leonard',
    title: 'Leonard Regeneration Center',
    icon: Landmark,
    description:
      'Our flagship community regeneration hub in Muhanga District serves as a living laboratory for regenerative agriculture, food forests, agroforestry, biodiversity conservation, sustainable livelihoods, environmental education, and climate innovation. The center welcomes farmers, youth, schools, researchers, and visitors to learn, practice, and replicate regenerative solutions.',
    image: '/Images/IMG_1422.jpg',
    link: { text: 'View on Google Maps', url: 'https://maps.app.goo.gl/d3KMrb2sfRR2wk156' },
    color: 'emerald',
    gradientFrom: 'from-emerald-900/80',
  },
  {
    id: 'nursery',
    title: 'Community Tree Nursery Initiative',
    icon: Trees,
    description:
      'We establish community tree nurseries to produce high-quality fruit trees, indigenous trees, and agroforestry seedlings that support ecosystem restoration, food security, and climate resilience. Beyond seedling production, the initiative provides hands-on training in nursery management, tree propagation, and restoration practices, enabling communities and schools to establish their own green spaces and food forests.',
    image: '/Images/Nursery.jpg',
    link: { text: 'Learn more about our nurseries', url: '#nursery-details' },
    color: 'green',
    gradientFrom: 'from-green-900/80',
  },
  {
    id: 'rainwater',
    title: 'Rainwater Harvesting & Water Resilience',
    icon: Droplets,
    description:
      'We promote sustainable water management through rainwater harvesting, connected ponds, water storage systems, and landscape restoration. By capturing and conserving rainwater, we improve irrigation, increase resilience to drought, restore watershed functions, and demonstrate practical climate adaptation solutions for farming communities.',
    image: '/Images/Rainwater.jpg',
    color: 'sky',
    gradientFrom: 'from-sky-900/80',
  },
  {
    id: 'restoration',
    title: 'Ecosystem Restoration & Climate Action',
    icon: Globe,
    description:
      'We restore degraded landscapes through agroforestry, tree growing, watershed restoration, biodiversity conservation, and sustainable land management. Working alongside communities, we implement nature-based solutions that improve ecosystem health, strengthen climate resilience, and support sustainable food systems.',
    image: '/Images/Restoration.jpg',
    color: 'teal',
    gradientFrom: 'from-teal-900/80',
  },
  {
    id: 'kids4food',
    title: 'Kids4Food',
    icon: Apple,
    description:
      'Kids4Food inspires the next generation of environmental leaders by integrating food forests, school gardens, agriculture clubs, and climate education into schools. The program provides children with practical skills while nurturing a lifelong commitment to caring for nature and building resilient communities.',
    image: '/Images/Kids4Food.jpg',
    link: { text: 'Learn more about Kids4Food', url: '#kids4food-details' },
    color: 'amber',
    gradientFrom: 'from-amber-900/80',
  },
  {
    id: 'apiary',
    title: 'Community Apiary Project',
    icon: Hexagon,
    description:
      'Our Community Apiary Project promotes sustainable beekeeping as a nature-based livelihood that supports biodiversity, pollination, and ecosystem health. We establish community-managed apiaries, provide practical training in modern beekeeping, and empower youth, women, and local cooperatives to produce high-quality honey and other bee products. By integrating beekeeping with food forests, agroforestry, and ecosystem restoration, the project creates sustainable income opportunities while enhancing pollination, increasing agricultural productivity, and fostering environmental stewardship within local communities.',
    image: '/Images/Apiary.jpg',
    color: 'orange',
    gradientFrom: 'from-orange-900/80',
  },
];

const colorMap: Record<string, { badge: string; border: string; shadow: string; accent: string }> = {
  emerald: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/20 hover:border-emerald-500/40', shadow: 'shadow-emerald-500/5', accent: 'text-emerald-400' },
  green: { badge: 'bg-green-500/20 text-green-300 border-green-500/30', border: 'border-green-500/20 hover:border-green-500/40', shadow: 'shadow-green-500/5', accent: 'text-green-400' },
  sky: { badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30', border: 'border-sky-500/20 hover:border-sky-500/40', shadow: 'shadow-sky-500/5', accent: 'text-sky-400' },
  teal: { badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30', border: 'border-teal-500/20 hover:border-teal-500/40', shadow: 'shadow-teal-500/5', accent: 'text-teal-400' },
  amber: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', border: 'border-amber-500/20 hover:border-amber-500/40', shadow: 'shadow-amber-500/5', accent: 'text-amber-400' },
  orange: { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', border: 'border-orange-500/20 hover:border-orange-500/40', shadow: 'shadow-orange-500/5', accent: 'text-orange-400' },
};

const LEONARD_IMAGES = [
  '/Images/Leonard/IMG_0874.jpg',
  '/Images/Leonard/IMG_1132.jpg',
  '/Images/Leonard/IMG_1259.jpg',
  '/Images/Leonard/IMG_1295.jpg',
  '/Images/Leonard/Copy of IMG_2403.jpg',
  '/Images/Leonard/IMG_2556.jpg',
  '/Images/Leonard/IMG_2576.jpg',
  '/Images/Leonard/IMG_2578.jpg',
  '/Images/Leonard/IMG_2988.jpg',
  '/Images/Leonard/IMG_2989.jpg',
  '/Images/Leonard/IMG_3038.jpg',
  '/Images/Leonard/IMG_8536.jpg',
  '/Images/Leonard/IMG_8681.jpg',
];

export default function ProgramsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [leonardSlide, setLeonardSlide] = useState(0);

  // Auto-advance Leonard slideshow every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLeonardSlide((prev) => (prev + 1) % LEONARD_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <section className="py-24 bg-emerald-950 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-400/3 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase bg-emerald-900/50 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Our Initiatives
          </span>
          <h2 className="mt-6 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white">
            Transforming Communities Through Action
          </h2>
          <p className="mt-4 text-emerald-100/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Each program is designed hand-in-hand with local communities — restoring landscapes, 
            building skills, and creating lasting climate resilience across Rwanda.
          </p>
        </motion.div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {programs.map((program, index) => {
            const colors = colorMap[program.color];
            const isExpanded = expandedId === program.id;
            const Icon = program.icon;

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative rounded-3xl overflow-hidden border ${colors.border} ${colors.shadow} bg-emerald-900/30 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Image container */}
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  {/* Slideshow for Leonard card, static image for others */}
                  {program.id === 'leonard' ? (
                    <>
                      {LEONARD_IMAGES.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Leonard Regeneration Center - ${i + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            i === leonardSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                          }`}
                          fetchPriority={i < 2 ? 'high' : 'low'}
                          decoding="async"
                        />
                      ))}
                      {/* Slide indicator dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                        {LEONARD_IMAGES.map((_, i) => (
                          <span
                            key={i}
                            className={`block rounded-full transition-all duration-300 ${
                              i === leonardSlide
                                ? 'bg-emerald-400 w-3 h-1.5'
                                : 'bg-white/30 w-1.5 h-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${program.gradientFrom} via-emerald-950/40 to-transparent`} />
                  
                  {/* Top badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${colors.badge} backdrop-blur-sm`}>
                      <Icon className="h-3.5 w-3.5" />
                      {program.title.split(' ').slice(0, 1).join(' ')}
                    </span>
                  </div>

                </div>

                {/* Card body */}
                <div className="p-5 sm:p-6">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight mb-3">
                    {program.title}
                  </h3>
                  <p className={`text-emerald-100/80 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-4'}`}>
                    {program.description}
                  </p>

                  {/* Expand/Collapse toggle */}
                  {program.description.length > 250 && (
                    <button
                      onClick={() => toggleExpanded(program.id)}
                      className="mt-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Footer actions */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    {program.link ? (
                      <a
                        href={program.link.url}
                        target={program.link.url.startsWith('http') ? '_blank' : undefined}
                        rel={program.link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 hover:text-emerald-950 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                      >
                        {program.link.text}
                        {program.link.url.startsWith('http') ? (
                          <ExternalLink className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5" />
                        )}
                      </a>
                    ) : (
                      <div />
                    )}
                    <div className="flex items-center gap-1 text-emerald-100/40 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>Rwanda</span>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_70%)]" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-emerald-100/60 text-sm">
            Want to partner, volunteer, or learn more about a specific program?{' '}
            <a href="/contact" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium transition-colors">
              Get in touch with us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
