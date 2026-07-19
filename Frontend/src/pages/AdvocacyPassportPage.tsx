import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchActiveWeeklyChallenge, issueCertificate, recordChallengeCompletion } from '../api/client';
import type { ApiWeeklyChallengeQuestion } from '../api/client';

const fallbackQuestions: ApiWeeklyChallengeQuestion[] = [
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
      "Linking the energy and passion of local communities with the advice and experience of elders and experts",
      "Restricting green jobs solely to senior agency directors"
    ],
    correct: 2,
    explanation: "Intergenerational equity seeks to elevate community voices while establishing deep collaborations with elder specialists who hold structural insights."
  }
];

export default function AdvocacyPassportPage() {
  const [challengeTitle, setChallengeTitle] = useState<string | null>(null);
  const [challengeWeek, setChallengeWeek] = useState('');
  const [questions, setQuestions] = useState<ApiWeeklyChallengeQuestion[] | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(true);

  const activeQuestions = questions ?? fallbackQuestions;

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [certificateCode, setCertificateCode] = useState<string | null>(null);
  const [issuingCert, setIssuingCert] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    fetchActiveWeeklyChallenge().then((challenge) => {
      if (challenge && challenge.questions.length > 0) {
        setChallengeTitle(challenge.title);
        setChallengeWeek(
          `${new Date(challenge.week_start).toLocaleDateString()} – ${new Date(challenge.week_end).toLocaleDateString()}`
        );
        setQuestions(challenge.questions);
      }
      setChallengeLoading(false);
    });
  }, []);

  const handleAnswerClick = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === activeQuestions[currentQuestion].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (currentQuestion + 1 < activeQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleStartQuiz = () => {
    setEmailError('');
    if (!candidateName.trim()) {
      setQuizError('Please provide your name — it will appear on the digital certificate.');
      return;
    }
    if (candidateEmail.trim() && !isValidEmail(candidateEmail)) {
      setEmailError('Please enter a valid email address.');
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
    setCandidateEmail('');
    setEmailError('');
    setCertificateCode(null);
    setCurrentQuestion(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const printCertificate = () => window.print();

  const handleIssueAndPrint = async () => {
    if (issuingCert) return;
    setIssuingCert(true);
    const email = candidateEmail.trim() || candidateName.toLowerCase().replace(/\s+/g, '.') + '@we4climate.org';
    const cert = await issueCertificate({
      recipient_name: candidateName.trim(),
      recipient_email: email,
      score: 3,
    });
    if (cert) {
      setCertificateCode(cert.certificate_code);
      if (challengeTitle) {
        recordChallengeCompletion();
      }
    }
    setIssuingCert(false);
    printCertificate();
  };

  const progressPercent = quizStarted && !quizFinished
    ? ((currentQuestion + 1) / activeQuestions.length) * 100
    : 0;
  const isIntroScreen = !quizStarted && !quizFinished;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950">
      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-4 py-2 rounded-full border border-emerald-500/20 mb-6"
            >
              <i className="bi bi-shield-check text-emerald-300 text-sm" />
            </motion.div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                WELCOME TO WE4CLIMATE KNOWLEDGE HUB
              </span>
            </h1>
            <div className="mt-6 max-w-2xl mx-auto space-y-4">
              <p className="text-lg text-emerald-100/70 leading-relaxed">
                Test your climate and conservation literacy and  earn your official Climate Advocate Certificate, and become part of a growing network of people making a difference globally.
              </p>
              <p className="text-sm text-emerald-200/50 italic flex items-center justify-center gap-2">
                <i className="bi bi-share text-emerald-400 text-xs" />
                Share our platform with your teams!
              </p>
              <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-2xl p-5 text-left">
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Fill in your Name and email correctly and click begin the challenge, then start answering all questions.
                  You need to pass all the questions to get a certificate.
                  Upon completion, you can download your certificate automatically!
                </p>
              </div>
            </div>
          </motion.div>


        </div>
      </section>

      {/* ─── QUIZ / CERTIFICATE SECTION ─── */}
      <section className="pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Keep the reference-style section header visible throughout the challenge flow. */}
            <div className="flex border-b border-emerald-800/80">
              <div className="flex flex-1 items-center justify-center gap-3 border-b-2 border-emerald-400 bg-emerald-900/70 px-4 py-5 text-center text-base font-bold text-emerald-300 sm:text-lg">
                <i className="bi bi-award text-emerald-400 text-xl" />
                Advocacy Passport Challenge
              </div>
              <div className="flex flex-1 items-center justify-center gap-3 px-4 py-5 text-center text-base font-bold text-emerald-200/45 sm:text-lg">
                <i className="bi bi-patch-check text-emerald-200/35 text-xl" />
                Earn Your Certificate
              </div>
            </div>

            <div className={isIntroScreen ? '' : 'p-6 sm:p-10 lg:p-12'}>
              {/* ─── INTRO SCREEN ─── */}
              {!quizStarted && !quizFinished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
                    <div className="min-w-0">
                      <div className="mb-7 flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-800 text-emerald-400 shadow-inner shadow-emerald-950/30">
                          <i className="bi bi-award text-4xl" />
                        </div>
                        <span className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                          Advocacy Passport
                        </span>
                      </div>

                      <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                        Turn your climate knowledge into action.
                      </h2>
                      <p className="mt-5 text-lg leading-relaxed text-emerald-100/85 sm:text-xl lg:text-[22px]">
                        Test your climate and conservation literacy, earn your official Climate Advocate Certificate, and join a growing network of people making a difference.
                      </p>

                      <div className="mt-7 rounded-2xl border border-emerald-800/50 bg-emerald-950/45 p-5">
                        <p className="text-sm leading-relaxed text-emerald-100/80">
                          {challengeLoading ? (
                            <span className="flex items-center gap-2"><i className="bi bi-arrow-repeat animate-spin text-emerald-400" /> Loading this week's challenge...</span>
                          ) : challengeTitle ? (
                            <>Take on <strong className="text-emerald-300">this week's challenge:</strong> &ldquo;<span className="font-bold text-amber-300">{challengeTitle}</span>&rdquo;</>
                          ) : (
                            <>Complete the assessment with a <strong className="text-amber-300">perfect {activeQuestions.length}/{activeQuestions.length}</strong> score to unlock your official certificate.</>
                          )}
                        </p>
                        {challengeWeek && (
                          <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-emerald-950/60 px-3 py-1 text-[10px] font-mono text-emerald-300/60">
                            <i className="bi bi-calendar3 text-xs text-emerald-300/60" />
                            {challengeWeek}
                          </div>
                        )}
                      </div>

                      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-300/80">
                            <i className="bi bi-patch-check text-sm text-emerald-400" />
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full rounded-xl border border-emerald-800 bg-emerald-950/60 px-4 py-3 text-sm text-white placeholder-emerald-100/35 transition-all focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-300/80">
                            <i className="bi bi-envelope text-sm text-emerald-400" />
                            Email (optional)
                          </label>
                          <input
                            type="email"
                            value={candidateEmail}
                            onChange={(e) => {
                              setCandidateEmail(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            onBlur={() => {
                              if (candidateEmail.trim() && !isValidEmail(candidateEmail)) {
                                setEmailError('Please enter a valid email address.');
                              } else {
                                setEmailError('');
                              }
                            }}
                            placeholder="you@example.com"
                            className={`w-full rounded-xl border bg-emerald-950/60 px-4 py-3 text-sm text-white placeholder-emerald-100/35 transition-all focus:outline-none ${
                              emailError
                                ? 'border-rose-500 focus:border-rose-400'
                                : 'border-emerald-800 focus:border-emerald-400'
                            }`}
                          />
                          {emailError && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-400"
                            >
                              <i className="bi bi-exclamation-circle text-xs" />
                              {emailError}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {quizError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-400"
                        >
                          <i className="bi bi-exclamation-circle text-sm text-amber-400" />
                          {quizError}
                        </motion.p>
                      )}

                      <motion.button
                        onClick={handleStartQuiz}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-400 hover:to-amber-300"
                      >
                        <i className="bi bi-book text-lg" />
                        <span>Begin Challenge</span>
                        <i className="bi bi-arrow-right text-base" />
                      </motion.button>
                    </div>

                    <div className="group relative order-first aspect-[4/3] overflow-hidden rounded-3xl border border-emerald-700/40 shadow-2xl lg:order-last">
                      <img
                        src="/Images/pexels-kampus-5940708.jpg"
                        alt="Learner preparing for the Advocacy Passport challenge"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/45 via-transparent to-transparent" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── QUIZ ACTIVE SCREEN ─── */}
              {quizStarted && !quizFinished && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12"
                >
                  <div className="min-w-0 space-y-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-400/20">
                        <i className="bi bi-question-circle text-emerald-400 text-xl" />
                      </div>
                      <div>
                        <span className="text-sm font-mono text-emerald-400 font-semibold">
                          Question {currentQuestion + 1} of {activeQuestions.length}
                        </span>
                        <p className="text-[10px] uppercase tracking-wider text-emerald-300/50">Climate Literacy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/40 rounded-xl px-4 py-2">
                      <i className="bi bi-trophy text-amber-400 text-sm" />
                        <span className="text-sm font-bold text-emerald-300">{quizScore}/{activeQuestions.length}</span>
                      </div>
                    </div>

                  {/* Progress bar */}
                  <div className="w-full bg-emerald-950 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-2xl p-6">
                    <h3 className="font-display font-bold text-lg text-white leading-relaxed">
                      {activeQuestions[currentQuestion].text}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {activeQuestions[currentQuestion].options.map((opt, oIdx) => {
                      let btnClass = "bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/60 hover:border-emerald-600 text-gray-200 hover:text-white";
                      if (isAnswered) {
                        if (oIdx === activeQuestions[currentQuestion].correct) {
                          btnClass = "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-medium ring-1 ring-emerald-400/30";
                        } else if (selectedAnswer === oIdx) {
                          btnClass = "bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/30";
                        } else {
                          btnClass = "bg-emerald-950/20 border-emerald-950 text-gray-500 opacity-50";
                        }
                      }
                      return (
                        <motion.button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleAnswerClick(oIdx)}
                          whileHover={!isAnswered ? { scale: 1.01, x: 4 } : {}}
                          className={`w-full text-left px-5 py-4 rounded-xl text-sm transition-all duration-200 focus:outline-none flex items-center gap-3 ${btnClass}`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isAnswered && oIdx === activeQuestions[currentQuestion].correct
                              ? 'bg-emerald-500/30 text-emerald-300'
                              : isAnswered && selectedAnswer === oIdx
                                ? 'bg-rose-500/30 text-rose-300'
                                : 'bg-emerald-900/60 text-emerald-400'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                    {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-950/60 border border-emerald-800/40 rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center gap-2.5">
                        {selectedAnswer === activeQuestions[currentQuestion].correct ? (
                          <>
                            <div className="p-1.5 bg-emerald-500/20 rounded-full">
                              <i className="bi bi-check-circle-fill text-emerald-400 text-lg" />
                            </div>
                            <span className="font-bold text-emerald-300">That's right — well done!</span>
                          </>
                        ) : (
                          <>
                            <div className="p-1.5 bg-rose-500/20 rounded-full">
                              <i className="bi bi-x-circle text-rose-400 text-lg" />
                            </div>
                            <span className="font-bold text-rose-300">Not quite — here's what you need to know:</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-emerald-100/70 leading-relaxed pl-10">
                        {activeQuestions[currentQuestion].explanation}
                      </p>
                      <motion.button
                        onClick={handleNextQuestion}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-emerald-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                      >
                        <span>{currentQuestion + 1 < activeQuestions.length ? 'Next Question' : 'See Your Results'}</span>
                        <i className="bi bi-arrow-right text-sm" />
                      </motion.button>
                    </motion.div>
                    )}
                  </div>

                  <div className="group relative order-last aspect-[4/3] overflow-hidden rounded-3xl border border-emerald-700/40 shadow-2xl">
                    <img
                      src="/Images/pexels-kampus-5940708.jpg"
                      alt="Learner preparing for the Advocacy Passport challenge"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/45 via-transparent to-transparent" />
                  </div>
                </motion.div>
              )}

              {/* ─── FINISH SCREEN ─── */}
              {quizFinished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {quizScore === activeQuestions.length ? (
                    <>
                      {/* Perfect Score — Certificate */}
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="inline-flex p-4 bg-gradient-to-br from-amber-500/20 to-emerald-500/10 rounded-full border border-amber-400/20 mb-4"
                        >
                          <i className="bi bi-trophy text-amber-400 text-3xl" />
                        </motion.div>
                        <h2 className="font-display font-extrabold text-2xl text-emerald-300 flex items-center justify-center gap-3">
                          <i className="bi bi-star-fill text-amber-400 text-xl" />
                          Perfect Score! {quizScore}/{activeQuestions.length}
                          <i className="bi bi-star-fill text-amber-400 text-xl" />
                        </h2>
                        <p className="text-sm text-emerald-200/60 mt-2">
                          Your official We4Climate Community Advocate Certificate is ready
                        </p>
                      </div>

                      {/* Certificate Card */}
                      <div className="bg-white text-emerald-950 p-8 sm:p-10 rounded-2xl border-4 border-double border-emerald-700 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[380px] text-center">
                        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500 opacity-10 rounded-full blur-md" />
                        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500 opacity-10 rounded-full blur-md" />
                        <div className="absolute top-6 right-6 flex flex-col items-center opacity-30">
                          <div className="p-2 bg-emerald-800 rounded-full text-white">
                            <i className="bi bi-person-check text-lg" />
                          </div>
                          <span className="text-[7px] font-mono font-bold mt-0.5">VERIFIED</span>
                        </div>
                        <div className="absolute bottom-6 left-6 opacity-10">
                          <i className="bi bi-globe2 text-emerald-700 text-5xl" />
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[11px] uppercase font-mono font-bold tracking-[0.2em] text-emerald-800">
                            We4Climate Advocacy Network
                          </h5>
                          <div className="w-20 h-[2px] bg-emerald-600 mx-auto" />
                          <p className="font-display font-medium text-xs tracking-tight text-emerald-950/70 italic">
                            Kigali, Rwanda
                          </p>
                        </div>

                        <div className="my-4 space-y-2">
                          <span className="text-[9px] font-mono uppercase text-gray-400 block">This credential proudly verifies that</span>
                          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-emerald-900 border-b border-gray-100 pb-2 max-w-xs mx-auto tracking-tight select-all">
                            {candidateName}
                          </h3>
                          <span className="text-[9px] font-mono uppercase text-gray-500 block max-w-sm mx-auto">
                            Has completed the Core Climate Literacy and Ecosystem Restoration assessment
                          </span>
                        </div>

                        {certificateCode && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mx-auto max-w-[240px]">
                            <span className="text-[7px] font-mono uppercase tracking-widest text-emerald-600 block">
                              Certification Code
                            </span>
                            <span className="font-mono font-bold text-emerald-800 text-sm tracking-wider select-all">
                              {certificateCode}
                            </span>
                          </div>
                        )}

                        <p className="text-[8px] max-w-xs mx-auto text-gray-400 italic leading-relaxed mt-2">
                          "Empowering Rwandan communities to achieve sustainable development, elevate climate dialog platforms, and promote collaborative environmental equity."
                        </p>

                        <div className="mt-auto pt-4 flex justify-between items-end border-t border-gray-100 text-[8px] font-mono uppercase tracking-widest">
                          <div className="text-left">
                            <div className="flex items-center gap-1 border-b border-gray-200 pb-0.5">
                              <i className="bi bi-calendar3 text-gray-400 text-xs" />
                              <span className="text-gray-400 text-[9px]">{new Date().toLocaleDateString()}</span>
                            </div>
                            <span className="text-emerald-800/80 block mt-1">Issue Date</span>
                          </div>
                          <div className="text-center opacity-40 select-none">
                            <span className="font-serif italic font-bold text-gray-800 text-sm border-b border-gray-200 block -mt-2">W4C Kigali</span>
                            <span className="text-emerald-800/80 block mt-1">Secretary</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button
                          onClick={handleIssueAndPrint}
                          disabled={issuingCert}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-60 text-emerald-950 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          {issuingCert ? (
                            <><i className="bi bi-arrow-repeat animate-spin text-lg" /> Saving Certificate...</>
                          ) : (
                            <><i className="bi bi-printer text-lg" /> Print / Save PDF</>
                          )}
                        </motion.button>
                        <motion.button
                          onClick={handleResetQuiz}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3.5 bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-emerald-300 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          <i className="bi bi-arrow-repeat text-lg" />
                          Start Over
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Failed — less than perfect */}
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="inline-flex p-4 bg-rose-500/10 rounded-full border border-rose-500/20 mb-4"
                        >
                          <i className="bi bi-exclamation-circle text-rose-400 text-3xl" />
                        </motion.div>
                        <h2 className="font-display font-extrabold text-2xl text-rose-300">
                          Score: {quizScore}/{activeQuestions.length}
                        </h2>
                        <p className="mt-3 text-emerald-100/70 max-w-md mx-auto leading-relaxed">
                          Good effort, {candidateName}! To receive the official credential,
                          We4Climate requires a perfect {activeQuestions.length}/{activeQuestions.length} score.
                          Take a moment to review the materials, then give it another try.
                        </p>
                        <motion.button
                          onClick={() => {
                            setQuizStarted(false);
                            setQuizFinished(false);
                            setCurrentQuestion(0);
                            setQuizScore(0);
                            setSelectedAnswer(null);
                            setIsAnswered(false);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-6 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-emerald-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                        >
                          <i className="bi bi-arrow-repeat text-base" />
                          Try Again
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
