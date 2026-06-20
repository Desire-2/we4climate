import { Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer-coord" className="bg-emerald-950 text-white pt-16 pb-8 border-t border-emerald-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-emerald-900 pb-12">
          
          {/* Logo Brand information */}
          <div className="md:col-span-2 space-y-4">
            <button 
              onClick={scrollToTop} 
              className="flex items-center space-x-3 group focus:outline-none text-left"
            >
              <div className="relative flex-shrink-0">
                {/* Glow effect */}
                <div className="absolute -inset-1.5 bg-gradient-to-br from-emerald-400/30 via-emerald-500/10 to-transparent rounded-xl blur-md group-hover:blur-lg transition-all duration-500 group-hover:scale-110" />
                {/* Gradient border ring */}
                <div className="absolute -inset-[2px] rounded-[10px] bg-gradient-to-br from-emerald-400/50 via-emerald-500/20 to-emerald-800/30 group-hover:from-emerald-300/70 group-hover:via-emerald-400/40 group-hover:to-emerald-600/50 transition-all duration-500" />
                {/* Logo container */}
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] overflow-hidden ring-2 ring-inset ring-white/10 group-hover:ring-emerald-300/30 transition-all duration-500 group-hover:scale-105 group-active:scale-95 shadow-lg">
                  <img 
                    src="/logo.jpeg" 
                    alt="We4Climate Logo" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </div>
                {/* Corner accent dots */}
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping" />
                <span className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping delay-150" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-50 transition-colors duration-300">
                  We<span className="text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">4</span>Climate
                </span>
                <span className="text-[10px] text-emerald-400/60 uppercase font-mono tracking-widest">
                  Community-driven
                </span>
              </div>
            </button>
            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              We4Climate is an influential, community-driven, non-profit organization located in Kigali, Rwanda, promoting collaboration and community partnership networks for sustainable development, climate action, and green jobs.
            </p>
          </div>

          {/* Page Directory */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-mono text-emerald-400 font-bold mb-4">Directory</h4>
            <ul className="space-y-2 text-xs text-emerald-100/70">
              <li>
                <a href="#about" className="hover:text-emerald-300 transition-colors">Our Vision & Mission</a>
              </li>
              <li>
                <a href="#goals" className="hover:text-emerald-300 transition-colors">Strategic 10 Pillars</a>
              </li>
              <li>
                <a href="#interactive" className="hover:text-emerald-300 transition-colors">Climate Quiz & Pledges</a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-emerald-300 transition-colors">Green Careers Hub</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-300 transition-colors">Board Coordinates</a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-mono text-emerald-400 font-bold">Community Hubs</h4>
            <div className="flex gap-2.5">
              <a 
                href="https://www.facebook.com/We4Climate-103304555680933/" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 hover:text-emerald-100 border border-emerald-800 rounded-xl transition-all"
                aria-label="Facebook URL link"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com/Pryic2?t=Uoh07DaCZSyxjCqtQilHCQ&s=09" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 hover:text-emerald-100 border border-emerald-800 rounded-xl transition-all"
                aria-label="Twitter handle link"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/invites/contact/?i=18yke06prxy9g&utm_content=ivjx628" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 hover:text-emerald-100 border border-emerald-800 rounded-xl transition-all"
                aria-label="Instagram contact link"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/we4climate/" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 hover:text-emerald-100 border border-emerald-800 rounded-xl transition-all"
                aria-label="LinkedIn profile link"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <div className="text-xs text-emerald-100/60 leading-normal pt-1 flex items-center gap-1.5">
              <span>📧 info@we4climate.org</span>
            </div>
          </div>

        </div>

        {/* Lower content */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div className="space-y-1 sm:text-left">
            <p className="text-[10px] text-emerald-100/40">
              © {currentYear} We4Climate. Kigali, Rwanda. All Rights Reserved.
            </p>
            <p className="text-[9px] text-emerald-100/30 italic">
              Empowering Rwanda's communities to achieve sustainable environmental and biodiversity conservation.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-400 hover:text-emerald-200 border border-emerald-850 hover:border-emerald-500/40 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1 text-xs font-semibold focus:outline-none"
          >
            <span>Back to Top</span>
            <ArrowUp className="h-4 w-4 animate-bounce-slow" />
          </button>
        </div>

      </div>
    </footer>
  );
}
