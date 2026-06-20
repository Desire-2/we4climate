import { useState, useEffect, FormEvent } from 'react';
import { Award, Trees, CheckCircle2, AlertCircle, Share2, HelpCircle, ChevronRight, UserCheck } from 'lucide-react';
import { Pledge } from '../types';

interface InteractiveDeskProps {
  onPledgeAdded: (treesCount: number) => void;
}

export default function InteractiveDesk({ onPledgeAdded }: InteractiveDeskProps) {
  // Pledges State
  const [pledgedList, setPledgedList] = useState<Pledge[]>([]);
  const [pledgeName, setPledgeName] = useState('');
  const [pledgeDistrict, setPledgeDistrict] = useState('Kicukiro (Kigali)');
  const [pledgeCount, setPledgeCount] = useState(10);
  const [pledgeAction, setPledgeAction] = useState('Organizing an environmental club event');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [quizError, setQuizError] = useState('');

  const questions = [
    {
      text: "Which prominent wetland forest in Kigali is a focus of Rwandan ecosystem restoration?",
      options: [
        "Nyandungu Eco-Tourism Park",
        "Akagera Savannah Reserve",
        "Nyungwe National Canopy",
        "Mukura Forest Area"
      ],
      correct: 0,
      explanation: "Nyandungu Eco-Park is a landmark 121-hectare wetland restoration project right in Kigali, serving as a beacon of urban biodiversity."
    },
    {
      text: "What major nature-based solution is widely recommended for reducing soil erosion on Rwanda's high hill slopes?",
      options: [
        "Unregulated urban sprawl",
        "Progressive terracing and agroforestry planting",
        "Monoculture chemical farming",
        "Heavy concrete retaining dams"
      ],
      correct: 1,
      explanation: "Progressive and radical terracing paired with agroforestry binds the tropical soil on Rwanda's high hillsides, preventing heavy rainwater runoff."
    },
    {
      text: "How does We4Climate define 'Intergenerational Equity'?",
      options: [
        "Excluding elder experts from climate project designs",
        "Replacing traditional knowledge entirely with AI scripts",
        "Linking the energy and passion of local communities with the advice/experience of elders and experts",
        "Restricting green jobs solely to senior agency directors"
      ],
      correct: 2,
      explanation: "Intergenerational equity seeks to elevate community voices while establishing deep collaborations with elder specialists who hold structural insights."
    }
  ];

  const rwandanDistricts = [
    'Kicukiro (Kigali)', 'Nyarugenge (Kigali)', 'Gasabo (Kigali)',
    'Musanze', 'Rubavu', 'Huye', 'Kayonza', 'Rwamagana', 'Gicumbi', 'Bugesera', 'Karongi'
  ];

  const presetActions = [
    'Planting indigenous tree species (e.g., Markhamia)',
    'Organizing an environmental club event',
    'Hosting on-ground cleanup campaigns',
    'Sensitizing local children and nursery cohorts',
    'Researching local biodiversity issues'
  ];

  // Load existing pledges from LocalStorage
  useEffect(() => {
    const cached = localStorage.getItem('we4climate_pledges');
    if (cached) {
      try {
        setPledgedList(JSON.parse(cached));
      } catch (e) {
        // Fallback standard
      }
    } else {
      // Default inspiring list
      const defaults: Pledge[] = [
        {
          id: '1',
          name: 'Iradukunda Alice',
          district: 'Kicukiro (Kigali)',
          treesCount: 25,
          action: 'Planting indigenous tree species (e.g., Markhamia)',
          timestamp: new Date().toLocaleDateString()
        },
        {
          id: '2',
          name: 'Niyonsaba Moses',
          district: 'Musanze',
          treesCount: 50,
          action: 'Sensitizing local children and nursery cohorts',
          timestamp: new Date().toLocaleDateString()
        },
        {
          id: '3',
          name: 'Keza Diane',
          district: 'Gasabo (Kigali)',
          treesCount: 15,
          action: 'Organizing an environmental club event',
          timestamp: new Date().toLocaleDateString()
        }
      ];
      setPledgedList(defaults);
      localStorage.setItem('we4climate_pledges', JSON.stringify(defaults));
    }
  }, []);

  // Handle Pledge Submission
  const handlePledgeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pledgeName.trim()) return;

    const newPledge: Pledge = {
      id: Date.now().toString(),
      name: pledgeName.trim(),
      district: pledgeDistrict,
      treesCount: pledgeCount,
      action: pledgeAction,
      timestamp: new Date().toLocaleDateString()
    };

    const updated = [newPledge, ...pledgedList];
    setPledgedList(updated);
    localStorage.setItem('we4climate_pledges', JSON.stringify(updated));
    onPledgeAdded(pledgeCount);

    setPledgeName('');
    setPledgeSuccess(true);
    setTimeout(() => setPledgeSuccess(false), 4000);
  };

  // Handle Quiz Logic
  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleStartQuiz = () => {
    if (!candidateName.trim()) {
      setQuizError('Please supply your name to print on the digital certificate.');
      return;
    }
    setQuizError('');
    setQuizStarted(true);
    setCurrentQuestion(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleResetQuiz = () => {
    setQuizStarted(false);
    setCandidateName('');
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <section id="interactive" className="py-24 bg-emerald-900 text-white relative">
      {/* Decorative leaf SVGs */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-300 font-mono text-sm font-semibold tracking-wider uppercase bg-emerald-950 px-4 py-1.5 rounded-full inline-block mb-3 border border-emerald-500/20">
            Aesthetic Hub
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Community Action Desk & Certificate Terminal
          </h2>
          <p className="mt-4 text-emerald-100/80 text-lg leading-relaxed">
            Record your direct on-ground conservation tree pledge or prove your climate literacy to unlock your personalized We4Climate Action Certificate.
          </p>
        </div>

        {/* Action Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Module 1: Pledge Terminal (Left - Col 7) */}
          <div className="lg:col-span-7 bg-emerald-950/65 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20 text-emerald-300">
                <Trees className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Community Tree Pledge Registry</h3>
                <p className="text-xs text-emerald-200/60 mt-0.5">Commit indigenous seed planting and live tracker updates</p>
              </div>
            </div>

            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5">Your Full Name</label>
                  <input 
                    type="text" 
                    value={pledgeName}
                    onChange={(e) => setPledgeName(e.target.value)}
                    placeholder="e.g. Ineza Grace"
                    className="w-full bg-emerald-900/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2 text-sm text-white placeholder-emerald-100/35 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5">Country / Rwanda District</label>
                  <select 
                    value={pledgeDistrict}
                    onChange={(e) => setPledgeDistrict(e.target.value)}
                    className="w-full bg-emerald-900/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-all cursor-pointer"
                  >
                    {rwandanDistricts.map(idx => (
                      <option key={idx} className="bg-emerald-950 text-white" value={idx}>{idx}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5">Indigenous Trees Proposed</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      min="1" 
                      max="500" 
                      value={pledgeCount}
                      onChange={(e) => setPledgeCount(parseInt(e.target.value) || 1)}
                      className="w-24 bg-emerald-900/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2 text-sm text-white text-center focus:outline-none transition-all"
                      required
                    />
                    <span className="text-xs text-emerald-200/70">Markhamia, Newtonia, etc.</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-1.5">Operational Activity Target</label>
                  <select 
                    value={pledgeAction}
                    onChange={(e) => setPledgeAction(e.target.value)}
                    className="w-full bg-emerald-900/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-all cursor-pointer text-ellipsis overflow-hidden"
                  >
                    {presetActions.map(act => (
                      <option key={act} className="bg-emerald-950 text-white" value={act}>{act}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="submit-pledge-btn"
                className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-sm shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-95 focus:outline-none"
              >
                Log Pledge & Sync Live Tracker
              </button>
            </form>

            {/* Simulated success popup */}
            {pledgeSuccess && (
              <div id="pledge-success-toast" className="mt-4 p-4 bg-emerald-900/90 border border-emerald-400 text-emerald-300 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span>Pledge recorded! Thanks for syncing your contribution to our Kigali central ledger.</span>
              </div>
            )}

            {/* Pledging list ledger */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <h4 className="text-xs uppercase tracking-wider font-mono text-emerald-300/80 mb-4 flex items-center justify-between">
                <span>Recent Community Commitments Ledger</span>
                <span className="bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px]">Real-time Feed</span>
              </h4>
              
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {pledgedList.map((pledge) => (
                  <div key={pledge.id} className="p-3.5 bg-emerald-900/30 border border-emerald-500/10 rounded-2xl flex items-center justify-between gap-3 hover:bg-emerald-900/50 transition-colors">
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">{pledge.name}</span>
                        <span className="text-[10px] bg-emerald-800/80 text-emerald-300 px-2 py-0.5 rounded-md uppercase font-mono">{pledge.district}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1 truncate">{pledge.action}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="font-display font-black text-emerald-400 block text-lg">+{pledge.treesCount}</span>
                      <span className="text-[9px] uppercase font-mono text-emerald-300/50 block">Trees</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module 2: Climate Quiz & Certificate Terminal (Right - Col 5) */}
          <div className="lg:col-span-5 bg-emerald-950/65 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl relative backdrop-blur-sm select-none">
            
            {/* Standard Quiz Idle Screen */}
            {!quizStarted && !quizFinished && (
              <div id="quiz-intro-panel" className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20 text-emerald-300">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">We4Climate Advocacy Passport</h3>
                    <p className="text-xs text-emerald-200/60 mt-0.5">Test expertise, unlock credentials</p>
                  </div>
                </div>

                <p className="text-sm text-emerald-100/80 leading-relaxed max-w-sm">
                  Earn your customized digital **Community Climate Advocate Certificate**. Complete a short three-question climate challenges evaluation base 3/3 score.
                </p>

                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider font-mono text-emerald-300/80">Advocate Name for Certificate</label>
                  <input 
                    type="text" 
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter full name for signing"
                    className="w-full bg-emerald-900/60 border border-emerald-800 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-100/35 focus:outline-none transition-all"
                  />
                  {quizError && (
                    <span className="text-xs text-amber-400 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {quizError}</span>
                  )}
                </div>

                <button
                  onClick={handleStartQuiz}
                  id="start-quiz-btn"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-xl font-bold text-sm shadow-md transition-all duration-300 focus:outline-none"
                >
                  Initiate Challenge
                </button>
              </div>
            )}

            {/* Quiz Active Screen */}
            {quizStarted && !quizFinished && (
              <div id="quiz-question-panel" className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-xs bg-emerald-900 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono">Score: {quizScore}/{questions.length}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-emerald-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <h4 className="font-display font-bold text-base leading-snug text-white">
                  {questions[currentQuestion].text}
                </h4>

                <div className="space-y-2.5">
                  {questions[currentQuestion].options.map((opt, oIdx) => {
                    let btnClass = "bg-emerald-900/40 border border-emerald-850 hover:bg-emerald-900/70 hover:border-emerald-700 text-gray-200";
                    if (isAnswered) {
                      if (oIdx === questions[currentQuestion].correct) {
                        btnClass = "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-medium";
                      } else if (selectedAnswer === oIdx) {
                        btnClass = "bg-rose-500/20 border-rose-500 text-rose-300";
                      } else {
                        btnClass = "bg-emerald-900/20 border-emerald-950 text-gray-400 opacity-60";
                      }
                    }
                    return (
                      <button
                        key={oIdx}
                        disabled={isAnswered}
                        onClick={() => handleAnswerClick(oIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-4 bg-emerald-900/60 border border-emerald-800 rounded-2xl text-xs space-y-2 animate-fade-in">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      {selectedAnswer === questions[currentQuestion].correct ? '✓ Clean Insight!' : '✗ Learning Moment:'}
                    </span>
                    <p className="text-emerald-100/80 leading-relaxed">
                      {questions[currentQuestion].explanation}
                    </p>
                    <button
                      onClick={handleNextQuestion}
                      className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 tracking-wider transition-colors"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Result & Certificate Generator */}
            {quizFinished && (
              <div id="quiz-finish-panel" className="space-y-6">
                
                {/* Score Success 3/3 */}
                {quizScore === questions.length ? (
                  <div id="certificate-display-block" className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex p-3 bg-amber-500/15 rounded-full border border-amber-400/20 text-amber-400 mb-2 animate-pulse">
                        <Award className="h-8 w-8" />
                      </div>
                      <h3 className="font-display font-extrabold text-xl text-emerald-300">Perfect Score! 3/3 Checked</h3>
                      <p className="text-xs text-slate-300 mt-1">Your official We4Climate Community Advocate Certificate is generated</p>
                    </div>

                    {/* Highly stylized printable vector Certificate */}
                    <div 
                      id="printable-certificate-card"
                      className="bg-white text-emerald-950 p-6 sm:p-8 rounded-2xl border-4 border-double border-emerald-700 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.41/1] text-center"
                    >
                      {/* Gold Vector seal */}
                      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-amber-500 opacity-20 rounded-full blur-sm" />
                      <div className="absolute top-4 right-4 flex flex-col items-center opacity-40">
                        <div className="p-1 bg-emerald-800 rounded-full text-white">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <span className="text-[6px] font-mono font-bold mt-0.5">VERIFIED</span>
                      </div>

                      {/* Header */}
                      <div className="space-y-1">
                        <h5 className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-800">We4Climate Advocacy Network</h5>
                        <div className="w-16 h-[2px] bg-emerald-600 mx-auto" />
                        <h4 className="font-display font-medium text-xs tracking-tight text-emerald-950 italic">Kigali, Rwanda</h4>
                      </div>

                      {/* Name placeholder with custom spacing */}
                      <div className="my-3 space-y-1">
                        <span className="text-[8px] font-mono uppercase text-gray-400 block">This credentials proudly verify that</span>
                        <h3 className="font-display font-extrabold text-base md:text-lg text-emerald-900 border-b border-gray-100 pb-1 max-w-[240px] mx-auto tracking-tight select-all">
                          {candidateName}
                        </h3>
                        <span className="text-[8px] font-mono uppercase text-gray-500 block">Has completed the Core Climate Literacy and Ecosystem Restoration assessment</span>
                      </div>

                      {/* Core values */}
                      <p className="text-[7px] max-w-[280px] mx-auto text-gray-400 italic leading-normal">
                        "Empowering Rwandan communities to achieve sustainable development, elevate climate dialog platforms, and promote collaborative environmental equity."
                      </p>

                      {/* Date & Signature block */}
                      <div className="mt-4 flex justify-between items-end border-t border-gray-100 pt-3 text-[7px] font-mono uppercase tracking-widest">
                        <div className="text-left w-20">
                          <span className="text-gray-400 border-b border-gray-200 pb-0.5 block">{new Date().toLocaleDateString()}</span>
                          <span className="text-emerald-800/80 block mt-1">Issue Date</span>
                        </div>
                        <div className="w-16 h-1 w-12 text-center opacity-30 select-none">
                          <span className="font-serif italic font-bold text-gray-800 text-xs text-center border-b border-gray-200 block -mt-2">W4C Kigali</span>
                          <span className="text-emerald-800/80 block mt-1 text-[7px]">Secretary</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={printCertificate}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all focus:outline-none"
                      >
                        Print/Save PDF
                      </button>
                      <button
                        onClick={handleResetQuiz}
                        className="w-full py-2.5 bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all focus:outline-none"
                      >
                        Reset Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  // Failed status (less than perfect score)
                  <div id="quiz-fail-block" className="text-center py-6 space-y-4">
                    <div className="inline-flex p-3 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-400 mb-2">
                      <AlertCircle className="h-8 w-8 animate-bounce" />
                    </div>
                    <h3 className="font-display font-extrabold text-xl text-rose-300">Score: {quizScore}/3</h3>
                    <p className="text-sm text-emerald-100/70 max-w-sm mx-auto leading-normal">
                      Excellent attempt, {candidateName}! To qualify for the official credential, We4Climate requires a perfect 3/3 score.
                    </p>
                    <button
                      onClick={handleStartQuiz}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-block focus:outline-none"
                    >
                      Challenge Again
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
