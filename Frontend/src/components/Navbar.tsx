import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Mail, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, ChevronDown, ChevronRight, Home, Info, 
  Award, BarChart3, Heart, Briefcase, BookOpen, HelpCircle, Phone 
} from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isMobileTakeActionOpen, setIsMobileTakeActionOpen] = useState(true); // Open by default for maximum discoverability
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile navigation drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Main navigation items shown in header
  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/programs', label: 'Programs', icon: Award },
    { path: '/impact', label: 'Impact', icon: BarChart3 },
    { path: '/donate', label: 'Donate', icon: Heart },
    { path: '/opportunities', label: 'Opportunities', icon: Briefcase }
  ];

  // Take Action Dropdown/collapsible sub-items
  const takeActionItems = [
    { path: '/resources', label: 'Resources Manuals', icon: BookOpen },
    { path: '/action', label: 'Action Desk', icon: HelpCircle },
    { path: '/contact', label: 'Get in Touch', icon: Phone }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsDropdownHovered(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Checks if any sub-item is active
  const isTakeActionActive = () => {
    return takeActionItems.some(item => location.pathname === item.path);
  };

  return (
    <>
      <nav 
        id="main-nav"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-emerald-950/95 backdrop-blur-md shadow-lg border-b border-white/10' 
            : 'bg-emerald-950/25 backdrop-blur-[2px]'
        }`}
      >
        {/* Top green bar matching Arcos Network layout */}
        <div 
          id="top-info-bar"
          className={`bg-[#5cb85c] text-white text-xs transition-all duration-300 overflow-hidden ${
            isScrolled ? 'max-h-0 py-0 opacity-0 pointer-events-none' : 'max-h-12 py-3 opacity-100'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Email and Organization Indicator */}
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-white/95" />
              <a 
                href="mailto:info@we4climate.org" 
                className="font-semibold hover:underline text-white transition-all tracking-wide text-xs sm:text-sm"
              >
                info@we4climate.org
              </a>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="text-white/90 font-mono text-[11px] sm:text-xs tracking-wider hidden sm:inline">
              </span>
            </div>

            {/* Social Icons exactly matching branding */}
            <div className="flex items-center space-x-3.5 sm:space-x-4">
              <a 
                href="https://facebook.com/We4Climate-103304555680933/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white hover:text-emerald-100 transition-all transform hover:scale-110"
                aria-label="Facebook URL link"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com/Pryic2?t=Uoh07DaCZSyxjCqtQilHCQ&s=09" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white hover:text-emerald-100 transition-all transform hover:scale-110"
                aria-label="Twitter handle link"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/invites/contact/?i=18yke06prxy9g&utm_content=ivjx628" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white hover:text-emerald-110 transition-all transform hover:scale-110"
                aria-label="Instagram contact link"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/we4climate/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white hover:text-emerald-110 transition-all transform hover:scale-110"
                aria-label="LinkedIn profile link"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white hover:text-emerald-110 transition-all transform hover:scale-110"
                aria-label="YouTube channel link"
              >
                <Youtube className="h-4 w-4" />
              </a>
              
              {/* Flickr Custom dots indicators on the far right */}
              <a 
                href="https://flickr.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 hover:opacity-90 transition-all transform hover:scale-110 py-0.5"
                title="Flickr Stream"
                aria-label="Flickr link"
              >
                <span className="w-2.5 h-2.5 bg-[#0063db] rounded-full inline-block" />
                <span className="w-2.5 h-2.5 bg-[#ff0084] rounded-full inline-block" />
              </a>
            </div>
          </div>
        </div>

        {/* Main navigation row */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isScrolled ? 'py-3 sm:py-4' : 'py-4 sm:py-6'
        }`}>
          <div className="flex items-center justify-between">
            {/* Brand Logo - Scaled elegantly on mobile to prevent wrapping */}
            <button 
              id="logo-button"
              onClick={() => handleNavClick('/')} 
              className="flex items-center space-x-2.5 sm:space-x-3 group focus:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md flex-shrink-0">
                <img 
                  src="/logo.jpeg" 
                  alt="We4Climate Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-tight text-white leading-none">
                  We<span className="text-emerald-400">4</span>Climate
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-300/90 uppercase font-mono tracking-widest mt-0.5 sm:mt-1 font-bold">
                </span>
              </div>
            </button>

            {/* Desktop Navigation for large screens */}
            <div className="hidden xl:flex items-center space-x-0.5">
              {mainNavItems.map((item) => (
                <button
                  key={item.path}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm xl:text-base font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? 'text-emerald-300 bg-emerald-900/60 border-b-2 border-emerald-400 shadow-sm' 
                      : 'text-gray-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* "Take Action" Dropdown Menu container triggered on Hover */}
              <div 
                id="take-action-dropdown-container"
                className="relative group ml-2.5"
                onMouseEnter={() => setIsDropdownHovered(true)}
                onMouseLeave={() => setIsDropdownHovered(false)}
              >
                <button
                  id="take-action-dropdown-trigger"
                  className={`px-4.5 py-2.5 rounded-xl font-bold text-sm xl:text-base flex items-center gap-1.5 transition-all duration-300 focus:outline-none cursor-pointer ${
                    isTakeActionActive()
                      ? 'bg-emerald-400 text-emerald-950 font-black shadow-md'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 hover:scale-[1.03]'
                  }`}
                >
                  <span>Take Action</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownHovered ? 'rotate-180' : ''}`} />
                </button>

                {/* Floater Dropdown Menu Panel */}
                <div 
                  id="take-action-dropdown-menu"
                  className={`absolute right-0 mt-2.5 w-52 bg-emerald-950/98 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl py-2 z-50 transform origin-top-right transition-all duration-200 ${
                    isDropdownHovered 
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
                  }`}
                >
                  <div className="px-3.5 py-1 mb-1 border-b border-white/5 text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                    Interactive Desk Action
                  </div>
                  {takeActionItems.map((subItem) => (
                    <button
                      key={subItem.path}
                      id={`dropdown-nav-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleNavClick(subItem.path)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all duration-200 ${
                        isActive(subItem.path)
                          ? 'text-emerald-300 bg-emerald-900/60 font-bold' 
                          : 'text-gray-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <subItem.icon className="h-4 w-4 text-emerald-400" />
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hamburger / Menu toggle on mobile and small tablet screens */}
            <div className="xl:hidden flex items-center space-x-2">
              <button
                id="cta-mini-donate"
                onClick={() => handleNavClick('/donate')}
                className="px-3.5 py-2 sm:px-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg sm:rounded-xl text-xs sm:text-sm shadow transition-all duration-300"
              >
                Donate
              </button>
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 sm:p-2.5 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Toggle Navigation Drawer"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7 sm:h-8 sm:w-8" /> : <Menu className="h-7 w-7 sm:h-8 sm:w-8" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Full Screen Mobile Drawer for stellar user experience on small screens (rendered outside container-blurred nav to allow perfect viewport-fixed sizing and z-index ordering) */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-nav-backdrop"
          className="xl:hidden fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div 
        id="mobile-nav-sheet"
        className={`xl:hidden fixed top-0 right-0 bottom-0 z-[99999] w-full max-w-xs sm:max-w-sm bg-emerald-950 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sticky Header inside the drawer */}          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#011f18]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="/logo.jpeg" 
                alt="We4Climate Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-black text-lg text-white">We4Climate Menu</span>
          </div>
          <button
            id="mobile-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Unified Scrollable Container */}
        <div className="flex-grow overflow-y-auto bg-emerald-950 px-4 py-5 space-y-6">
          {/* Main Exploratory links */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-3 px-3">
              Explore Dimensions
            </div>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  id={`nav-mobile-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-base font-semibold flex items-center justify-between transition-all ${
                    active
                      ? 'text-emerald-300 bg-emerald-900/40 border-l-4 border-emerald-400 shadow-inner' 
                      : 'text-gray-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${active ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/20" />
                </button>
              );
            })}
          </div>

          {/* Accent-Colored Take Action Group */}
          <div className="border-t border-white/10 pt-5">
            <button
              id="mobile-take-action-trigger"
              onClick={() => setIsMobileTakeActionOpen(!isMobileTakeActionOpen)}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-base font-bold flex items-center justify-between transition-all bg-emerald-900/20 border border-white/5 ${
                isMobileTakeActionOpen || isTakeActionActive()
                  ? 'text-emerald-300'
                  : 'text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">⚡</span>
                <span>Take Action Hub</span>
              </div>
              <ChevronDown className={`h-5 w-5 transform transition-transform duration-300 ${isMobileTakeActionOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`transition-all duration-300 overflow-hidden ${
                isMobileTakeActionOpen ? 'max-h-80 mt-2' : 'max-h-0'
              }`}
            >
              <div className="pl-2 pr-1 py-1 space-y-1.5 bg-[#011f18] rounded-2xl border border-white/5">
                {takeActionItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const active = isActive(subItem.path);
                  return (
                    <button
                      key={subItem.path}
                      id={`nav-mobile-sub-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleNavClick(subItem.path)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                        active
                          ? 'text-emerald-300 bg-emerald-900/50 font-bold shadow-inner' 
                          : 'text-gray-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <SubIcon className={`h-4.5 w-4.5 ${active ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Contact & Action CTA Footer flowing naturally directly below links inside scroll view */}
          <div className="border-t border-white/10 pt-5 space-y-4">
            <button
              onClick={() => handleNavClick('/action')}
              className="w-full text-center py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-sm tracking-wide shadow-lg block focus:outline-none cursor-pointer"
            >
              Environmental Quiz & Pledge
            </button>
            <div className="text-center text-xs text-gray-300 flex flex-col items-center gap-1 bg-[#011f18] p-3 rounded-xl border border-white/5">
              <span>Need help? Inquiry & publications:</span>
              <a href="mailto:info@we4climate.org" className="text-emerald-400 font-bold hover:underline">
                info@we4climate.org
              </a>
            </div>

            {/* Compact Social Badges inside slideout */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <a href="https://facebook.com/We4Climate-103304555680933/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors border border-transparent p-1 rounded">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/Pryic2?t=Uoh07DaCZSyxjCqtQilHCQ&s=09" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors border border-transparent p-1 rounded">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/invites/contact/?i=18yke06prxy9g&utm_content=ivjx628" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors border border-transparent p-1 rounded">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/we4climate/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors border border-transparent p-1 rounded">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://flickr.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:opacity-100 transition-opacity p-1 border border-transparent rounded">
                <span className="w-2.5 h-2.5 bg-[#0063db] rounded-full inline-block" />
                <span className="w-2.5 h-2.5 bg-[#ff0084] rounded-full inline-block" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
