import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Download, Check, ArrowRight, Play, BookOpen, Calendar, User, Eye, Search, AlertCircle, Loader2 
} from 'lucide-react';

interface Publication {
  id: string;
  title: string;
  category: 'Guide' | 'Report' | 'Tool';
  fileSize: string;
  pages: number;
  description: string;
  coverImage: string;
  downloadCount: number;
}

interface SuccessStory {
  id: string;
  title: string;
  category: 'Ecosystem' | 'Agroecology' | 'Community-hub';
  author: string;
  date: string;
  teaser: string;
  readTime: string;
  storyImage: string;
}

export default function StoriesAndResources() {
  const [activeTab, setActiveTab] = useState<'stories' | 'downloads'>('stories');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Downloader simulator states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [finishedDownloadId, setFinishedDownloadId] = useState<string | null>(null);

  const publications: Publication[] = [
    {
      id: 'guide',
      title: 'Rwanda Agroforestry Best Practice Guide',
      category: 'Guide',
      fileSize: '4.8 MB',
      pages: 36,
      description: 'A comprehensive, hand-drawn and localized guidebook specifying indigenous and protective tree species suitable for Rwanda\'s eastern and northern slopes, including ideal spacing and compound fertilization tips.',
      coverImage: '/Images/IMG_2008.jpg',
      downloadCount: 420
    },
    {
      id: 'report',
      title: 'We4Climate Annual Impact Report 2025',
      category: 'Report',
      fileSize: '3.2 MB',
      pages: 24,
      description: 'Full strategic and financial ledger showing exact details of trees seeded, survival percentages, community cohort residency graduation counts, and detailed funding disbursements in Rwanda.',
      coverImage: '/Images/IMG_2019.jpg',
      downloadCount: 290
    },
    {
      id: 'playbook',
      title: 'Community Green-Club Organizer Playbook',
      category: 'Tool',
      fileSize: '2.5 MB',
      pages: 18,
      description: 'A template guide designed for community climate assemblies, outlining step-by-step procedures for planning tree planting campaigns, conducting local plastic reduction cleanups, and managing digital story reels.',
      coverImage: '/Images/IMG_2023.jpg',
      downloadCount: 512
    }
  ];

  const stories: SuccessStory[] = [
    {
      id: 'story-1',
      title: 'Restoring Mountainside Integrity in Gicumbi',
      category: 'Ecosystem',
      author: 'Desire Bikorimana',
      date: 'May 12, 2026',
      readTime: '4 min read',
      teaser: 'How a combined force of school clubs and local smallholders re-established indigenous protections along 12 hectares of highly unstable ravines.',
      storyImage: '/Images/IMG_2038.jpg'
    },
    {
      id: 'story-2',
      title: 'Circular Waste: Brewing Biochar in Bugesera',
      category: 'Agroecology',
      author: 'Innocent N.',
      date: 'April 28, 2026',
      readTime: '5 min read',
      teaser: 'Exploring how local community-led hubs are transforming agricultural rice hulls into nutrient-binding compost to guard crops during drought.',
      storyImage: '/Images/IMG_2132.jpg'
    },
    {
      id: 'story-3',
      title: 'Inaugurating the Leonard Regeneration Center',
      category: 'Community-hub',
      author: 'Diane Umutoni',
      date: 'March 15, 2026',
      readTime: '6 min read',
      teaser: 'An overview of our newly constructed permaculture training fields, composting stations, and the collaborative amphitheater space in Kamonyi.',
      storyImage: '/Images/IMG_2283.jpg'
    }
  ];

  const filteredPublications = publications.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.teaser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (id: string) => {
    if (downloadingId !== null) return;
    setDownloadingId(id);
    setDownloadProgress(0);
    setFinishedDownloadId(null);

    // Increment progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingId(null);
            setFinishedDownloadId(id);
            // Auto hide tick mark after 4s
            setTimeout(() => setFinishedDownloadId(null), 4000);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <section id="resources" className="py-24 bg-white border-t border-gray-100 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Hub Nav controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-semibold tracking-widest text-emerald-700 uppercase bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300/30">
              Stories & Publications
            </span>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-gray-900">
              Knowledge & Stories Hub
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl">
              Access research-backed manuals, technical guides, impact ledgers, and inspirational success stories directly from our action fields.
            </p>
          </div>

          {/* Search bar controls */}
          <div className="relative max-w-sm w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search guides, media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
            />
          </div>
        </div>

        {/* Tab Selection Header */}
        <div className="flex border-b border-gray-200 mb-10 gap-8">
          <button
            onClick={() => { setActiveTab('stories'); setSearchTerm(''); }}
            className={`pb-4 text-base sm:text-lg font-bold border-b-2 transition-all focus:outline-none cursor-pointer ${
              activeTab === 'stories' 
                ? 'border-emerald-600 text-emerald-700' 
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            Organic Stories & Media ({filteredStories.length})
          </button>
          <button
            onClick={() => { setActiveTab('downloads'); setSearchTerm(''); }}
            className={`pb-4 text-base sm:text-lg font-bold border-b-2 transition-all focus:outline-none cursor-pointer ${
              activeTab === 'downloads' 
                ? 'border-emerald-600 text-emerald-700' 
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            Downloadable Guides & Reports ({filteredPublications.length})
          </button>
        </div>

        {/* Tab display views */}
        <AnimatePresence mode="wait">
          {activeTab === 'stories' ? (
            /* Blog/Success stories panel */
            <motion.div
              key="stories-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <article key={story.id} className="bg-white rounded-3xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img 
                          src={story.storyImage} 
                          alt={story.title}
                          className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-md z-10">
                          {story.category}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-3">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                            {story.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-emerald-600" />
                            {story.author}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-lg sm:text-xl text-gray-950 group-hover:text-emerald-700 duration-300 leading-snug">
                          {story.title}
                        </h3>
                        <p className="mt-3 text-sm text-gray-550 leading-relaxed font-normal line-clamp-3">
                          {story.teaser}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-gray-50 flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-400">{story.readTime}</span>
                      <a 
                        href="#contact"
                        className="text-emerald-700 hover:text-emerald-600 flex items-center gap-1 group/btn"
                      >
                        <span>Request PDF Copy</span>
                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-0.5" />
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-gray-400">
                  <AlertCircle className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No stories or blogs match your search phrase</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Publications & Reports panel */
            <motion.div
              key="downloads-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPublications.length > 0 ? (
                filteredPublications.map((pub) => {
                  const isDownloading = downloadingId === pub.id;
                  const isFinished = finishedDownloadId === pub.id;
                  return (
                    <article key={pub.id} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                      <div>
                        {/* Styled Cover Representation */}
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-gray-200">
                          <img 
                            src={pub.coverImage} 
                            alt={pub.title} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
                          <span className="absolute top-4 left-4 bg-emerald-500 text-emerald-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                            {pub.category}
                          </span>
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                            <span className="flex items-center gap-1 font-mono">
                              <FileText className="h-4 w-4" />
                              {pub.pages} Pages
                            </span>
                            <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm pr-2 text-[11px] font-bold">
                              {pub.fileSize}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-display font-bold text-lg text-gray-950 leading-snug">
                          {pub.title}
                        </h3>
                        <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
                          {pub.description}
                        </p>
                      </div>

                      {/* Download interaction */}
                      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
                        <span className="text-[10px] text-gray-400 font-mono">Downloads: {pub.downloadCount + (isFinished ? 1 : 0)} verified</span>
                        
                        <button
                          onClick={() => handleDownload(pub.id)}
                          disabled={isDownloading}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isFinished 
                              ? 'bg-emerald-600 text-white' 
                              : isDownloading 
                                ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-md'
                          }`}
                        >
                          {isFinished ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Downloaded!</span>
                            </>
                          ) : isDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Saving {downloadProgress}%...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-gray-400">
                  <AlertCircle className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No downloadable publications match your phrase</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality indicator banner */}
        <div className="mt-16 p-4 sm:p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-emerald-950">
            Are you a local researcher or representing a university? Inquire on collaborative publications and agroecology documentation by mailing <a href="mailto:info@we4climate.org" className="underline text-emerald-800 hover:text-emerald-700 font-bold">info@we4climate.org</a>.
          </p>
        </div>

      </div>
    </section>
  );
}
