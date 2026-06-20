import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Smartphone, Check, ArrowRight, ShieldCheck, Heart, Sparkles, Award, RotateCcw, HelpCircle, Loader2 
} from 'lucide-react';

export default function DonationPortal() {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'RWF'>('USD');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'phone'>('stripe');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  
  // Payment specifics
  const [cardNumber, setCardNumber] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [telco, setTelco] = useState<'mtn' | 'airtel'>('mtn');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Suggested quick selection amounts per currency
  const suggestions = {
    USD: [10, 25, 50, 100],
    EUR: [10, 25, 50, 100],
    RWF: [5000, 15000, 30000, 60000]
  };

  const activeAmount = customAmount !== '' ? Number(customAmount) : amount;

  // Impact calculations
  const impactStats = {
    trees: currency === 'RWF' ? Math.floor(activeAmount / 1200) : activeAmount * 1,
    workshops: currency === 'RWF' ? Math.floor(activeAmount / 15000) : Math.floor(activeAmount / 12),
    nurseries: currency === 'RWF' ? Math.floor(activeAmount / 60000) : Math.floor(activeAmount / 50)
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    if (val === '') {
      setAmount(25);
    }
  };

  const handleSuggestionSelect = (num: number) => {
    setAmount(num);
    setCustomAmount('');
  };

  const handleStartSimulation = (e: FormEvent) => {
    e.preventDefault();
    if (!donorName) {
      alert('Please state your name for the Restorer Certificate.');
      return;
    }
    setIsSimulating(true);
    setSimulationStep(1);

    // Step 1: Connecting (1s)
    setTimeout(() => {
      setSimulationStep(2);
      // Step 2: Contacting payment provider or sending push (1.5s)
      setTimeout(() => {
        if (paymentMethod === 'phone') {
          setSimulationStep(3); // Waiting for active MoMo Pin entry
        } else {
          // Stripe goes directly to success
          setSimulationStep(4);
          setTimeout(() => {
            setIsSimulating(false);
            setIsSuccess(true);
          }, 1500);
        }
      }, 1500);
    }, 1200);
  };

  const handleApproveMoMoPin = () => {
    setSimulationStep(4);
    setTimeout(() => {
      setIsSimulating(false);
      setIsSuccess(true);
    }, 1500);
  };

  const resetDonation = () => {
    setIsSimulating(false);
    setIsSuccess(false);
    setSimulationStep(0);
    setCustomAmount('');
    setAmount(25);
    setDonorName('');
    setDonorEmail('');
    setCardNumber('');
    setPhoneNumber('');
  };

  return (
    <section id="donate" className="py-24 bg-emerald-950 bg-gradient-to-b from-emerald-950 to-emerald-900 text-white relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-emerald-200 uppercase bg-emerald-950 px-3.5 py-1.5 rounded-full border border-emerald-500/40 inline-flex items-center gap-1.5">
            <Heart className="h-4.5 w-4.5 text-rose-400 fill-rose-400" /> Secure Online Giving
          </span>
          <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-2">
            Support Our Work
          </h2>
          <p className="mt-3 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Choose a recurring or single gift to help young climate leaders construct nursery beds, purchase local organic seed supplies, and train Rwandese farmers.
          </p>
        </div>

        {/* Dashboard Grid split: Input column on left, impact column on right */}
        <div className="max-w-5xl mx-auto bg-emerald-900/20 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div 
                key="donation-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Form controls column: span 7 */}
                <form onSubmit={handleStartSimulation} className="lg:col-span-7 p-6 sm:p-10 border-r border-white/10">
                  <h3 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    Configure Contribution
                  </h3>

                  {/* 1. Pick Currency */}
                  <div className="mb-6">
                    <label className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-2">Select Currency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['USD', 'EUR', 'RWF'] as const).map(curr => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => {
                            setCurrency(curr);
                            setAmount(curr === 'RWF' ? 15000 : 25);
                            setCustomAmount('');
                          }}
                          className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                            currency === curr 
                              ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-extrabold' 
                              : 'bg-emerald-900/30 text-emerald-200 border-white/5 hover:bg-white/5'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Amount choices */}
                  <div className="mb-6">
                    <label className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-2">Select Gift Amount</label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {suggestions[currency].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSuggestionSelect(num)}
                          className={`py-3 rounded-xl text-sm sm:text-base font-bold transition-all ${
                            amount === num && customAmount === ''
                              ? 'bg-emerald-500 text-emerald-950 scale-[1.03] shadow-md border-emerald-400' 
                              : 'bg-emerald-950/50 text-emerald-100/80 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {currency === 'RWF' ? `${(num/1000).toFixed(0)}k` : `$${num}`}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-300">
                        Other Amount:
                      </span>
                      <input
                        type="number"
                        placeholder="Enter custom amount"
                        value={customAmount}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        className="w-full bg-emerald-950/60 border border-white/10 rounded-xl py-3 pl-32 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-white/20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400 uppercase">
                        {currency}
                      </span>
                    </div>
                  </div>

                  {/* 3. Donor Personal Particulars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-1.5">Full Name (Certificate Name)</label>
                      <input
                        type="text"
                        required
                        placeholder="Desire Bikorimana"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full bg-emerald-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="donor@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full bg-emerald-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* 4. Payment Gateway Option */}
                  <div className="mb-6">
                    <label className="text-xs text-emerald-300 font-bold uppercase tracking-wider block mb-2">Checkout Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Credit Card Stripe */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('stripe')}
                        className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                          paymentMethod === 'stripe'
                            ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-black' 
                            : 'bg-emerald-950/40 text-emerald-200 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Stripe Credit Card</span>
                      </button>

                      {/* Rwanda Mobile Money */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('phone')}
                        className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                          paymentMethod === 'phone'
                            ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-black' 
                            : 'bg-emerald-950/40 text-emerald-200 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        <Smartphone className="h-4 w-4" />
                        <span>Rwanda Mobile Money</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Details details block */}
                  <div className="mb-8 p-4 bg-emerald-950/40 rounded-2xl border border-white/5">
                    {paymentMethod === 'stripe' ? (
                      <div className="space-y-3">
                        <label className="text-xs text-emerald-300/80 font-mono tracking-wider block">Mock Debit / Credit Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="4242 4242 4242 4242 (Stripe Standard)"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-emerald-900/30 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Telco selections */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setTelco('mtn')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              telco === 'mtn' ? 'bg-[#ffcc00] text-black' : 'bg-emerald-900/60 text-white/70'
                            }`}
                          >
                            MTN Mobile Money
                          </button>
                          <button
                            type="button"
                            onClick={() => setTelco('airtel')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              telco === 'airtel' ? 'bg-[#ff0000] text-white' : 'bg-emerald-900/60 text-white/70'
                            }`}
                          >
                            Airtel Money
                          </button>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs text-emerald-300/80 font-mono tracking-wider block">Rwanda Phone Number (MoMo Link)</label>
                          <input
                            type="text"
                            required
                            placeholder="+250 78x xxx xxx / 079..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-emerald-900/30 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission triggers */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-extrabold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
                  >
                    <span>Authorize Secure Donation</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-emerald-200/50">
                    <ShieldCheck className="h-4 w-4" />
                    <span>256-bit Gatekeeper encryption standard. Authorized via secure SSL handshakes.</span>
                  </div>
                </form>

                {/* Right side Visual Impact equivalent projection column: span 5 */}
                <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 p-6 sm:p-10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#5cb85c] font-black block mb-2">Estimated Climate Value Matrix</span>
                    <h4 className="font-display font-medium text-lg text-emerald-300">Your impact equivalents for this selected pledge:</h4>
                    
                    <div className="mt-8 space-y-6">
                      {/* Tree seedlings equivalent */}
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-800/60 flex items-center justify-center font-bold text-emerald-300">
                          {impactStats.trees || 1}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">Native seed development</h5>
                          <p className="text-xs text-emerald-100/60 mt-0.5 leading-snug">
                            Ensures {impactStats.trees || 1} indigenous and fruit saplings grown from localized seed beds and managed by local women cooperatives.
                          </p>
                        </div>
                      </div>

                      {/* Smallholder Workshop training equivalent */}
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-900/60 flex items-center justify-center font-bold text-blue-300">
                          {impactStats.workshops || 1}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">Farmer agroecology training</h5>
                          <p className="text-xs text-[#bcedf8] mt-0.5 leading-snug">
                            Supports {impactStats.workshops || 1} rural smallholder families with fully equipped permaculture curriculum handbooks.
                          </p>
                        </div>
                      </div>

                      {/* Cooperative Starter Kit equivalent */}
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-900/60 flex items-center justify-center font-bold text-amber-300">
                          {impactStats.nurseries || 1}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">Soil protection tools</h5>
                          <p className="text-xs text-amber-200/60 mt-0.5 leading-snug">
                            Distributes nursery implements like high-pressure manual sprayers, soil containers, and nutrient inoculating agents.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quotes Box matching climate context */}
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-xs text-emerald-300/80 italic leading-relaxed">
                      "Every tree counts towards mitigating landslides in the northern mountains and dry winds in Eastern Rwanda. Thank you for your partnership."
                    </p>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-2">
                      - Desire Bikorimana, Executive Director
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Success certificate layout screen */
              <motion.div 
                key="donation-certificate"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="p-6 sm:p-12 text-center"
              >
                <div className="max-w-2xl mx-auto bg-white text-emerald-950 rounded-2xl p-6 sm:p-10 shadow-2xl relative border border-emerald-100 overflow-hidden text-left">
                  
                  {/* Outer border/badge style details */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                  <div className="absolute top-6 right-6 opacity-10">
                    <Award className="h-32 w-32" />
                  </div>

                  {/* Header of official document */}
                  <div className="flex items-center gap-3.5 mb-8 border-b border-gray-100 pb-6 justify-between flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-sm uppercase tracking-wider text-emerald-900">Certificate of Stewardship</h4>
                        <span className="text-[9px] text-[#5cb85c] font-bold tracking-widest font-mono">WE4CLIMATE • RWANDA ORGANIC TEAM</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-mono block">Certificate #</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">W4C-KGL-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                  </div>

                  {/* Certificate main content */}
                  <div className="space-y-6">
                    <p className="text-xs text-gray-500 uppercase font-mono tracking-widest text-center">This is presented with pride and honor to</p>
                    <h5 className="font-display font-black text-2xl sm:text-3xl text-center text-emerald-950 border-b-2 border-emerald-500/20 pb-2 max-w-lg mx-auto">
                      {donorName || 'Generous Friend'}
                    </h5>

                    <p className="text-center text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed mt-4">
                      For being designated an official **Earth Steward** of the We4Climate Rwandan restoration program. Through a generous investment of <strong className="text-emerald-700 font-extrabold">{currency === 'RWF' ? `${activeAmount.toLocaleString()} RWF` : `${activeAmount} ${currency}`}</strong>, you have successfully co-funded the sustainable development of **{impactStats.trees || 1} native protective trees** in the vital catchment hubs of Rwanda.
                    </p>

                    {/* Verified Seals */}
                    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100 text-center">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono">Trees Funded</span>
                        <span className="text-base sm:text-lg font-bold text-emerald-800">{impactStats.trees || 1} Saplings</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono">Date Issued</span>
                        <span className="text-base sm:text-lg font-bold text-emerald-800">
                          {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-mono">Project Verified</span>
                        <span className="text-sm sm:text-base font-bold text-emerald-800 flex items-center justify-center gap-1">
                          <Check className="h-4 w-4 text-emerald-600" /> Yes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return button */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      // Trigger native print flow
                      window.print();
                    }}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-bold text-sm shadow-md"
                  >
                    Print Certificate
                  </button>
                  
                  <button
                    onClick={resetDonation}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Make Another Donation</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Full screen simulator Overlay */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-4 text-white"
          >
            <div className="max-w-md w-full bg-emerald-900/90 border border-white/15 p-6 sm:p-8 rounded-3xl text-center shadow-2xl relative">
              <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto mb-6" />

              {simulationStep === 1 && (
                <div>
                  <h4 className="text-lg font-bold">Contacting Payment Gateway</h4>
                  <p className="text-sm text-emerald-200/70 mt-2">
                    Securing encrypted tunneling pipeline with {paymentMethod === 'stripe' ? 'Stripe Inc. servers...' : 'Mobile Money router...'}
                  </p>
                </div>
              )}

              {simulationStep === 2 && (
                <div>
                  <h4 className="text-lg font-bold">Encrypting Authorization Keys</h4>
                  <p className="text-sm text-emerald-200/70 mt-2">
                    Setting up multi-token transaction signature headers with local banks...
                  </p>
                </div>
              )}

              {simulationStep === 3 && (
                <div>
                  <h4 className="text-lg font-bold text-amber-300">Pending MoMo Pin Authorization</h4>
                  <p className="text-sm text-emerald-100/90 mt-2">
                     A mock payment push has been sent to <strong className="text-white">{phoneNumber}</strong>. Approve the transaction prompt on your screen to complete the donation.
                  </p>
                  
                  {/* Interactive approval action button */}
                  <div className="mt-6 p-4 bg-emerald-950/80 rounded-2xl border border-white/5">
                    <span className="text-xs text-emerald-300/60 block font-mono">SIMULATED PHONE COMPANION PROMPT</span>
                    <button
                      type="button"
                      onClick={handleApproveMoMoPin}
                      className="mt-3 w-full py-2.5 bg-[#ffcc00] hover:bg-[#ffe066] text-black rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                    >
                      <span>Approve MTN / Airtel Push Prompt Pin</span>
                    </button>
                  </div>
                </div>
              )}

              {simulationStep === 4 && (
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <Check className="h-5 w-5 bg-emerald-500 text-emerald-950 rounded-full p-0.5" /> 
                    Transaction Approved
                  </h4>
                  <p className="text-sm text-emerald-200/70 mt-2">
                    Creating and verifying your digital We4Climate Earth Stewardship certificate index...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
