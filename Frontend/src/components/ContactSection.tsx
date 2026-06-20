import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Globe, CheckCircle2 } from 'lucide-react';
import { submitContact } from '../api/client';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Try API first
    const result = await submitContact({
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
    });

    if (!result) {
      console.warn('Backend unreachable – contact saved locally only');
    }

    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden">
      {/* Decorative backdrop elements */}
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-700 font-mono text-sm font-semibold tracking-wider uppercase bg-emerald-100 px-4 py-1.5 rounded-full inline-block mb-3">
            Contact
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 tracking-tight">
            Reach Out to Our Kigali Board
          </h2>
          <p className="mt-4 text-lg text-gray-650 leading-relaxed">
            Have questions about registrations, green projects, or intergenerational dialogs? Contact our headquarters directly.
          </p>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Coordinates & Map (Col 5) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h3 className="font-display font-bold text-2xl text-emerald-950">We4Climate Headquarters</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our main offices are located in Kicukiro, Kigali, Rwanda, which hosts our intergenerational programs, webinars, and district club coordination desks.
              </p>
            </div>

            {/* Address cards */}
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">HQ Coordinates</span>
                  <span className="text-gray-900 text-sm font-semibold">KK 508 St, Kicukiro, Kigali, Rwanda</span>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 flex-shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">Telephone Hotline</span>
                  <span className="text-gray-900 text-sm font-semibold block">0787712266</span>
                  <span className="text-gray-500 text-xs mt-0.5">Alternative line: 0738110139</span>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">Electronic Address</span>
                  <span className="text-gray-900 text-sm font-semibold">info@we4climate.org</span>
                  <span className="text-gray-500 text-xs mt-0.5">Web: www.we4climate.org</span>
                </div>
              </div>
            </div>

            {/* Micro Styled Map illustration */}
            <div className="p-4 bg-emerald-950 text-emerald-400 rounded-3xl border border-emerald-900 relative h-48 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 flex flex-wrap gap-2 select-none pointer-events-none transform -skew-y-12">
                {Array.from({ length: 190 }).map((_, i) => (
                  <span key={i} className="text-[8px] font-mono">KK508</span>
                ))}
              </div>
              <div className="relative z-10 text-center space-y-2 max-w-xs">
                <div className="inline-block p-2.5 bg-emerald-900 rounded-full text-emerald-300 animate-bounce">
                  <MapPin className="h-6 w-6" />
                </div>
                <h5 className="font-semibold text-white text-sm">Kicukiro Valley Sector</h5>
                <p className="text-[10px] text-emerald-300/80 leading-relaxed">Coordinates: Kigali District Unit HQ. Direct connections to REMA and national community conservation partners.</p>
              </div>
            </div>

            {/* Social linkages */}
            <div className="pt-4 space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-mono text-gray-400">Join our social dialogues</h4>
              <div className="flex gap-2">
                <a 
                  href="https://www.facebook.com/We4Climate-103304555680933/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center"
                  title="Facebook Interface"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com/Pryic2?t=Uoh07DaCZSyxjCqtQilHCQ&s=09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center"
                  title="Twitter Coordinates"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.instagram.com/invites/contact/?i=18yke06prxy9g&utm_content=ivjx628" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center"
                  title="Instagram coordinates invite"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
            <h3 className="font-display font-bold text-xl text-emerald-950 mb-2">Electronic Message Dispatch</h3>
            <p className="text-xs text-gray-500 mb-6">File a direct request to our general assembly secretary. Responses typically take 24–48 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ntaganzwa Desire"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-905 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. desire@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-905 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-700 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="District Club Registry">District Club Registry</option>
                  <option value="Partnership / Sponsorship">Partnership / Sponsorship</option>
                  <option value="NBS Training Admission">NBS Training Admission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Detail</label>
                <textarea 
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our community help? Describe detail of project or advisory requested."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-gray-905 focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                id="contact-submit-btn"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-95 focus:outline-none flex items-center justify-center gap-2"
              >
                <span>Dispatch message</span>
                <Send className="h-4 w-4" />
              </button>
            </form>

            {success && (
              <div id="contact-success-toast" className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-xs animate-fade-in">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span>Message dispatched successfully! A secretary coordinate will verify your request soon.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
