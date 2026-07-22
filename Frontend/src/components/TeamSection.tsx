import { useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

interface TeamMember {
  name: string;
  role: string;
  photo: string;
  bio: string;
  linkedin: string;
  objectPosition: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Leonard Iyamuremye',
    role: 'Founder & Director',
    photo: '/Images/Our_Team/leonard-iyamuremye.jpg',
    bio: 'Leonard Iyamuremye is a Rwandan environmental scientist, regeneration practitioner, and youth leader dedicated to restoring ecosystems and building resilient communities across Africa. He is the Founder and Director of We4Climate and leads the Leonard Regeneration Center, a living demonstration site for permaculture, regenerative agriculture, agroforestry, and ecological restoration in Muhanga District, Rwanda. Leonard also serves as the Africa Coordinator and Social Media Manager for the EcoRestoration Alliance and contributes to continental initiatives that promote youth engagement in climate action and food systems transformation. He holds a Master\'s degree in Environmental Economics and Natural Resource Management and recently earned a Permaculture Design Certificate (PDC) from Oregon State University, certified by the Permaculture Institute of North America (PINA). His work focuses on regenerative landscapes, water harvesting, food forest design, environmental education and empowering communities to restore both people and the planet.',
    linkedin: 'https://www.linkedin.com/in/leonard-iyamuremye-3b3050144/',
    objectPosition: '50% 12%',
  },
  {
    name: 'Dusengimana Florence',
    role: 'Communication Director',
    photo: '/Images/Our_Team/dusengimana-florence.jpg',
    bio: 'Florence Dusengimana is a Rwandan forestry and environmental professional passionate about building a greener, more resilient future, one community at a time. She holds a BSc (Honours) in Forestry from the University of Rwanda\'s College of Forestry and Biodiversity Conservation, and her career sits at the intersection of conservation, agroforestry and community empowerment. Florence currently serves as Communication Director at We4Climate, where she leads storytelling around community-driven climate action and youth empowerment, connecting audiences across LinkedIn, Instagram, X and Facebook to the real work happening on the ground. Her field experience runs deep and has shaped her belief that lasting environmental change starts with the people closest to the land. At her core, Florence believes that forests, farms and futures are all connected, and that the way forward is community by community, tree by tree.',
    linkedin: 'https://www.linkedin.com/in/dusengimana-florence-36748a307/',
    objectPosition: '50% 20%',
  },
  {
    name: 'Tuyizere Sandrine',
    role: 'Partnership Officer.',
    photo: '/Images/Our_Team/tuyizere-sandrine.jpg',
    bio: 'Tuyizere Sandrine is an Entrepreneurial Leadership graduate from the African Leadership University with a strong passion for climate action and environmental sustainability. She is interested in conservation, sustainable development, and using innovation and data to address environmental challenges and create lasting social impact.',
    linkedin: 'https://www.linkedin.com/in/sandrine-tuyizere-8829382a0/',
    objectPosition: '50% 20%',
  },
  {
    name: 'Bienvenue Ishimwe',
    role: 'Development Officer',
    photo: '/Images/Our_Team/bienvenue-ishimwe.jpg',
    bio: 'I am a Rwandan, curious, and kind leader who believes right, not might, makes right. I value hard work, love for people, and dignity in every facet of our lives. I find no greater happiness than in serving others. My hobbies include swimming, debating, reading, watching football, and listening to music. I particularly enjoy debating paradoxical and philosophical topics that seem to defy logic: the idea of God, free will, what happens when we die, why we exist, fiction as the foundation of life, the origin of suffering, the concept of impermanence, and many more things that do not make sense.',
    linkedin: 'https://www.linkedin.com/in/bienvenue-ishimwe-2a4388327/',
    objectPosition: '50% 20%',
  },
];

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="team" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-50/70 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-gray-900 tracking-tight">
            Our Team
          </h2>
          <p className="mt-5 indent-8 text-gray-600 leading-relaxed">
            Meet the people advancing regenerative agriculture, ecosystem restoration,
            environmental education, and climate resilience across Rwanda and Africa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {teamMembers.map((member, index) => {
            return (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                onClick={() => setSelectedMember(member)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedMember(member);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group relative h-full cursor-pointer"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white px-5 pb-6 pt-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl sm:px-6 sm:pt-10">
                  <div className="mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-full border-4 border-emerald-100 shadow-md sm:h-44 sm:w-44">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: member.objectPosition }}
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-5 flex flex-1 flex-col text-center">
                    <h3 className="font-display text-lg font-bold leading-tight text-gray-900 sm:text-xl">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-emerald-700 sm:text-sm">
                      {member.role}
                    </p>
                    <p className="mt-4 line-clamp-3 border-t border-gray-100 pt-4 text-left text-sm leading-relaxed text-gray-600 indent-6">
                      {member.bio}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A66C2] transition-colors hover:text-[#004182]"
                      >
                        LinkedIn
                      </a>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors group-hover:gap-2 group-hover:text-emerald-900">
                        Read more
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Full biography overlay, matching the detail interaction used by Our Theories of Change. */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-100 bg-white shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden sm:h-64">
                <img
                  src={selectedMember.photo}
                  alt={selectedMember.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: selectedMember.objectPosition }}
                />
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  aria-label="Close biography"
                  className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/35"
                >

                </button>
              </div>

              <div className="p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  {selectedMember.role}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
                  {selectedMember.name}
                </h3>
                <p className="mt-5 indent-8 text-base leading-relaxed text-gray-600">
                  {selectedMember.bio}
                </p>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
                  <a
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182]"
                  >
                    LinkedIn
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-md transition-colors hover:bg-emerald-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
