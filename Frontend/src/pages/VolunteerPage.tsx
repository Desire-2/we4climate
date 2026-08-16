import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { submitVolunteerApplicationNew } from '../api/client';

const PROGRAMS = [
  'Regenerative Agriculture',
  'Agroforestry',
  'Food Forest Development',
  'Tree Nursery',
  'Environmental Education',
  'Climate Literacy',
  'Community Development',
  'School Gardens',
  'Climate Storytelling',
  'Photography & Videography',
  'Research',
  'GIS & Mapping',
  'Biodiversity Monitoring',
  'Website Development',
  'Graphic Design',
  'Fundraising',
  'Communications',
  'Social Media',
  'Administration',
  'Event Organization',
  'Other',
];

const CONDUCT_ITEMS = [
  'Respect local culture and communities',
  'Protect the environment',
  'Follow safety procedures',
  'Respect diversity and inclusion',
  'Comply with Leonard Regeneration Center policies',
];

const STEPS = [
  { title: 'About you', description: 'Your personal and emergency contact details.' },
  { title: 'Your placement', description: 'The work you want to support and your dates.' },
  { title: 'Your experience', description: 'Your skills, motivation, and goals.' },
  { title: 'Your stay', description: 'Health, accommodation, and travel details.' },
  { title: 'Documents', description: 'Consent, commitments, and attachments.' },
  { title: 'Review', description: 'Check everything before sending.' },
];

type VolunteerFormState = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  passportNumber: string;
  email: string;
  phone: string;
  occupation: string;
  organization: string;
  emergencyFullName: string;
  emergencyRelationship: string;
  emergencyCountry: string;
  emergencyPhone: string;
  emergencyEmail: string;
  programs: string[];
  otherProgram: string;
  arrivalDate: string;
  departureDate: string;
  lengthOfStay: string;
  availability: string;
  educationalBackground: string;
  professionalExperience: string;
  technicalSkills: string;
  languagesSpoken: string;
  previousVolunteerExperience: string;
  relevantCertifications: string;
  motivation: string;
  hopeToLearn: string;
  contribution: string;
  medicalConditions: string;
  allergies: string;
  dietaryRequirements: string;
  emergencyMedicalInformation: string;
  needAccommodation: string;
  roomPreference: string;
  needInvitationLetter: string;
  needAirportPickup: string;
  expectedArrivalAirport: string;
  flightDetails: string;
  mediaConsent: string;
  conduct: string[];
  applicantName: string;
  signature: string;
  declarationDate: string;
  declarationAccepted: boolean;
};

type AttachmentKey = 'passportCopy' | 'passportPhoto' | 'cv' | 'motivationLetter' | 'recommendationLetter' | 'certificates';
type Attachments = Record<AttachmentKey, File | null>;

const initialForm: VolunteerFormState = {
  fullName: '', gender: '', dateOfBirth: '', nationality: '', countryOfResidence: '', passportNumber: '', email: '', phone: '', occupation: '', organization: '',
  emergencyFullName: '', emergencyRelationship: '', emergencyCountry: '', emergencyPhone: '', emergencyEmail: '',
  programs: [], otherProgram: '', arrivalDate: '', departureDate: '', lengthOfStay: '', availability: '',
  educationalBackground: '', professionalExperience: '', technicalSkills: '', languagesSpoken: '', previousVolunteerExperience: '', relevantCertifications: '',
  motivation: '', hopeToLearn: '', contribution: '', medicalConditions: '', allergies: '', dietaryRequirements: '', emergencyMedicalInformation: '',
  needAccommodation: '', roomPreference: '', needInvitationLetter: '', needAirportPickup: '', expectedArrivalAirport: '', flightDetails: '',
  mediaConsent: '', conduct: [], applicantName: '', signature: '', declarationDate: '', declarationAccepted: false,
};

const initialAttachments: Attachments = {
  passportCopy: null,
  passportPhoto: null,
  cv: null,
  motivationLetter: null,
  recommendationLetter: null,
  certificates: null,
};

const INPUT_CLASS = 'mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';
const SELECT_CLASS = `${INPUT_CLASS} cursor-pointer`;
const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-28 resize-y`;

function Field({ label, required = false, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label} {required && <span className="text-emerald-600">*</span>}</span>
      {hint && <span className="mt-1 block text-xs leading-relaxed text-slate-400">{hint}</span>}
      {children}
    </label>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8 border-b border-slate-100 pb-6">
      <h2 className="font-display text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

function ChoiceCard({ checked, label, onChange, name, value, type = 'checkbox' }: { checked: boolean; label: string; onChange: () => void; name: string; value: string; type?: 'checkbox' | 'radio'; key?: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${checked ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'}`}>
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${type === 'radio' ? 'rounded-full' : 'rounded-md'} border transition-colors ${checked ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'}`} />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

function AttachmentCard({ label, required, file, onChange, accept }: { label: string; required?: boolean; file: File | null; onChange: (event: ChangeEvent<HTMLInputElement>) => void; accept: string }) {
  const inputId = `attachment-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <label htmlFor={inputId} className={`group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition-all ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/50'}`}>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-700">{label} {required && <span className="text-emerald-600">*</span>}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-400">{file ? file.name : 'Choose a file'}</span>
      </span>
      <input id={inputId} type="file" accept={accept} onChange={onChange} className="sr-only" />
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-slate-700">{value || 'Not provided'}</dd>
    </div>
  );
}

export default function VolunteerPage() {
  const [form, setForm] = useState<VolunteerFormState>(initialForm);
  const [attachments, setAttachments] = useState<Attachments>(initialAttachments);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof VolunteerFormState>(field: K, value: VolunteerFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleProgram = (program: string) => {
    setForm((current) => ({ ...current, programs: current.programs.includes(program) ? current.programs.filter((item) => item !== program) : [...current.programs, program] }));
  };

  const toggleConduct = (item: string) => {
    setForm((current) => ({ ...current, conduct: current.conduct.includes(item) ? current.conduct.filter((value) => value !== item) : [...current.conduct, item] }));
  };

  const handleAttachmentChange = (key: AttachmentKey) => (event: ChangeEvent<HTMLInputElement>) => {
    setAttachments((current) => ({ ...current, [key]: event.target.files?.[0] ?? null }));
  };

  const validateStep = (step: number): string => {
    const requiredFields: Array<[string, string]> = [];
    if (step === 0) {
      requiredFields.push(
        [form.fullName, 'full name'], [form.gender, 'gender'], [form.dateOfBirth, 'date of birth'], [form.nationality, 'nationality'],
        [form.countryOfResidence, 'country of residence'], [form.email, 'email address'], [form.phone, 'WhatsApp phone number'], [form.occupation, 'occupation'],
        [form.emergencyFullName, 'emergency contact name'], [form.emergencyRelationship, 'emergency contact relationship'], [form.emergencyCountry, 'emergency contact country'],
        [form.emergencyPhone, 'emergency contact phone'], [form.emergencyEmail, 'emergency contact email'],
      );
      const missing = requiredFields.find(([value]) => !value.trim());
      if (missing) return `Please complete your ${missing[1]}.`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emergencyEmail.trim())) return 'Please enter valid email addresses.';
    }
    if (step === 1) {
      if (form.programs.length === 0) return 'Please choose at least one program of interest.';
      requiredFields.push([form.arrivalDate, 'preferred arrival date'], [form.departureDate, 'preferred departure date'], [form.lengthOfStay, 'length of stay'], [form.availability, 'availability']);
      const missing = requiredFields.find(([value]) => !value.trim());
      if (missing) return `Please complete your ${missing[1]}.`;
      if (form.departureDate < form.arrivalDate) return 'Your departure date must be after your arrival date.';
    }
    if (step === 2) {
      requiredFields.push([form.motivation, 'motivation'], [form.hopeToLearn, 'what you hope to learn'], [form.contribution, 'your contribution']);
      const missing = requiredFields.find(([value]) => !value.trim());
      if (missing) return `Please complete your ${missing[1]}.`;
    }
    if (step === 3) {
      requiredFields.push([form.needAccommodation, 'accommodation preference'], [form.needInvitationLetter, 'invitation letter preference'], [form.needAirportPickup, 'airport pickup preference']);
      const missing = requiredFields.find(([value]) => !value.trim());
      if (missing) return `Please complete your ${missing[1]}.`;
    }
    if (step === 4) {
      if (!form.mediaConsent) return 'Please choose a media consent option.';
      if (form.conduct.length !== CONDUCT_ITEMS.length) return 'Please confirm each Code of Conduct commitment.';
      if (!form.declarationAccepted) return 'Please accept the declaration.';
      requiredFields.push([form.applicantName, 'applicant name'], [form.signature, 'signature'], [form.declarationDate, 'declaration date']);
      const missing = requiredFields.find(([value]) => !value.trim());
      if (missing) return `Please complete your ${missing[1]}.`;
      const missingAttachment = [['passport copy', attachments.passportCopy], ['recent passport photo', attachments.passportPhoto], ['CV', attachments.cv], ['motivation letter', attachments.motivationLetter]].find(([, file]) => !file)?.[0];
      if (missingAttachment) return `Please attach your ${missingAttachment}.`;
    }
    return '';
  };

  const scrollToForm = () => document.getElementById('volunteer-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setSubmitError(error);
      scrollToForm();
      return;
    }
    setSubmitError('');
    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
    scrollToForm();
  };

  const goBack = () => {
    setSubmitError('');
    setCurrentStep((step) => Math.max(step - 1, 0));
    scrollToForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateStep(4);
    if (error) {
      setSubmitError(error);
      setCurrentStep(4);
      scrollToForm();
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    // Build structured form data for the dedicated volunteer endpoint
    const formData: Record<string, string | File | null | string[]> = {
      fullName: form.fullName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      nationality: form.nationality,
      countryOfResidence: form.countryOfResidence,
      passportNumber: form.passportNumber,
      email: form.email.trim(),
      phone: form.phone,
      occupation: form.occupation,
      organization: form.organization,
      emergencyFullName: form.emergencyFullName,
      emergencyRelationship: form.emergencyRelationship,
      emergencyCountry: form.emergencyCountry,
      emergencyPhone: form.emergencyPhone,
      emergencyEmail: form.emergencyEmail,
      programs: form.programs,
      otherProgram: form.otherProgram,
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate,
      lengthOfStay: form.lengthOfStay,
      availability: form.availability,
      educationalBackground: form.educationalBackground,
      professionalExperience: form.professionalExperience,
      technicalSkills: form.technicalSkills,
      languagesSpoken: form.languagesSpoken,
      previousVolunteerExperience: form.previousVolunteerExperience,
      relevantCertifications: form.relevantCertifications,
      motivation: form.motivation,
      hopeToLearn: form.hopeToLearn,
      contribution: form.contribution,
      medicalConditions: form.medicalConditions,
      allergies: form.allergies,
      dietaryRequirements: form.dietaryRequirements,
      emergencyMedicalInformation: form.emergencyMedicalInformation,
      needAccommodation: form.needAccommodation,
      roomPreference: form.roomPreference,
      needInvitationLetter: form.needInvitationLetter,
      needAirportPickup: form.needAirportPickup,
      expectedArrivalAirport: form.expectedArrivalAirport,
      flightDetails: form.flightDetails,
      mediaConsent: form.mediaConsent,
      conduct: form.conduct,
      declarationAccepted: String(form.declarationAccepted),
      applicantName: form.applicantName,
      signature: form.signature,
      declarationDate: form.declarationDate,
      passportCopy: attachments.passportCopy,
      passportPhoto: attachments.passportPhoto,
      cv: attachments.cv,
      motivationLetter: attachments.motivationLetter,
      recommendationLetter: attachments.recommendationLetter,
      certificates: attachments.certificates,
    };

    const result = await submitVolunteerApplicationNew(formData);
    setIsSubmitting(false);

    if (!result) {
      setSubmitError('We could not send your application right now. Please check your connection and try again.');
      return;
    }

    setApplicationId(result.volunteer.id);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetApplication = () => {
    setForm(initialForm);
    setAttachments(initialAttachments);
    setCurrentStep(0);
    setSubmitError('');
    setSubmitted(false);
    setApplicationId(null);
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <>
          <StepHeader title="About you" description="Tell us who you are and who we should contact in an emergency." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required><input className={INPUT_CLASS} value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Your full name" /></Field>
            <Field label="Gender" required><select className={SELECT_CLASS} value={form.gender} onChange={(event) => updateField('gender', event.target.value)}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></Field>
            <Field label="Date of birth" required><input type="date" className={INPUT_CLASS} value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} /></Field>
            <Field label="Nationality" required><input className={INPUT_CLASS} value={form.nationality} onChange={(event) => updateField('nationality', event.target.value)} placeholder="e.g. Rwandan" /></Field>
            <Field label="Country of residence" required><input className={INPUT_CLASS} value={form.countryOfResidence} onChange={(event) => updateField('countryOfResidence', event.target.value)} placeholder="Where you currently live" /></Field>
            <Field label="Passport number"><input className={INPUT_CLASS} value={form.passportNumber} onChange={(event) => updateField('passportNumber', event.target.value)} placeholder="As shown on your passport" /></Field>
            <Field label="Email address" required><input type="email" className={INPUT_CLASS} value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" /></Field>
            <Field label="Phone number (WhatsApp)" required><input type="tel" className={INPUT_CLASS} value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+250 7XX XXX XXX" /></Field>
            <Field label="Occupation" required><input className={INPUT_CLASS} value={form.occupation} onChange={(event) => updateField('occupation', event.target.value)} placeholder="Your current role" /></Field>
            <Field label="Organization / university"><input className={INPUT_CLASS} value={form.organization} onChange={(event) => updateField('organization', event.target.value)} placeholder="If applicable" /></Field>
          </div>
          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">Emergency contact</h3>
            <p className="mt-1 text-sm text-slate-500">Someone we can reach quickly if needed.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required><input className={INPUT_CLASS} value={form.emergencyFullName} onChange={(event) => updateField('emergencyFullName', event.target.value)} placeholder="Emergency contact name" /></Field>
              <Field label="Relationship" required><input className={INPUT_CLASS} value={form.emergencyRelationship} onChange={(event) => updateField('emergencyRelationship', event.target.value)} placeholder="e.g. Parent, partner, sibling" /></Field>
              <Field label="Country" required><input className={INPUT_CLASS} value={form.emergencyCountry} onChange={(event) => updateField('emergencyCountry', event.target.value)} placeholder="Country" /></Field>
              <Field label="Phone number" required><input type="tel" className={INPUT_CLASS} value={form.emergencyPhone} onChange={(event) => updateField('emergencyPhone', event.target.value)} placeholder="International format" /></Field>
              <Field label="Email" required><input type="email" className={INPUT_CLASS} value={form.emergencyEmail} onChange={(event) => updateField('emergencyEmail', event.target.value)} placeholder="contact@example.com" /></Field>
            </div>
          </div>
        </>
      );
    }

    if (currentStep === 1) {
      return (
        <>
          <StepHeader title="Your placement" description="Choose the areas where you would most enjoy learning and contributing." />
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-slate-700">Programs of interest <span className="text-emerald-600">*</span></h3><span className="text-xs text-slate-400">Select all that apply</span></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{PROGRAMS.map((program) => <ChoiceCard key={program} name="programs" value={program} label={program} checked={form.programs.includes(program)} onChange={() => toggleProgram(program)} />)}</div>
          {form.programs.includes('Other') && <input className={`${INPUT_CLASS} mt-3`} value={form.otherProgram} onChange={(event) => updateField('otherProgram', event.target.value)} placeholder="Tell us about another area of interest" />}
          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">When would you like to come?</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Preferred arrival date" required><input type="date" className={INPUT_CLASS} value={form.arrivalDate} onChange={(event) => updateField('arrivalDate', event.target.value)} /></Field>
              <Field label="Preferred departure date" required><input type="date" className={INPUT_CLASS} value={form.departureDate} onChange={(event) => updateField('departureDate', event.target.value)} /></Field>
              <Field label="Length of stay" required><input className={INPUT_CLASS} value={form.lengthOfStay} onChange={(event) => updateField('lengthOfStay', event.target.value)} placeholder="e.g. 2 weeks" /></Field>
              <Field label="Availability" required><select className={SELECT_CLASS} value={form.availability} onChange={(event) => updateField('availability', event.target.value)}><option value="">Select availability</option><option>Full-time</option><option>Part-time</option><option>Flexible</option></select></Field>
            </div>
          </div>
        </>
      );
    }

    if (currentStep === 2) {
      return (
        <>
          <StepHeader title="Your experience" description="There is no perfect profile. Share what you know, what brings you here, and what you hope to learn." />
          <div className="space-y-5">
            <Field label="Why would you like to volunteer at Leonard Regeneration Center?" required><textarea className={TEXTAREA_CLASS} value={form.motivation} onChange={(event) => updateField('motivation', event.target.value)} placeholder="Share what draws you to this work..." /></Field>
            <Field label="What do you hope to learn?" required><textarea className={TEXTAREA_CLASS} value={form.hopeToLearn} onChange={(event) => updateField('hopeToLearn', event.target.value)} placeholder="What would make this experience meaningful for you?" /></Field>
            <Field label="What skills or experience can you contribute?" required><textarea className={TEXTAREA_CLASS} value={form.contribution} onChange={(event) => updateField('contribution', event.target.value)} placeholder="Tell us how you would like to contribute..." /></Field>
          </div>
          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">Skills & experience</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Educational background"><textarea className={TEXTAREA_CLASS} value={form.educationalBackground} onChange={(event) => updateField('educationalBackground', event.target.value)} placeholder="Degrees, courses, or learning experiences" /></Field>
              <Field label="Professional experience"><textarea className={TEXTAREA_CLASS} value={form.professionalExperience} onChange={(event) => updateField('professionalExperience', event.target.value)} placeholder="Your work, projects, or community experience" /></Field>
              <Field label="Technical skills"><textarea className={TEXTAREA_CLASS} value={form.technicalSkills} onChange={(event) => updateField('technicalSkills', event.target.value)} placeholder="Tools, methods, or practical skills" /></Field>
              <Field label="Languages spoken"><textarea className={TEXTAREA_CLASS} value={form.languagesSpoken} onChange={(event) => updateField('languagesSpoken', event.target.value)} placeholder="e.g. English, Kinyarwanda, French" /></Field>
              <Field label="Previous volunteer experience"><textarea className={TEXTAREA_CLASS} value={form.previousVolunteerExperience} onChange={(event) => updateField('previousVolunteerExperience', event.target.value)} placeholder="Tell us about previous volunteering" /></Field>
              <Field label="Relevant certifications"><textarea className={TEXTAREA_CLASS} value={form.relevantCertifications} onChange={(event) => updateField('relevantCertifications', event.target.value)} placeholder="Training or certificates relevant to your application" /></Field>
            </div>
          </div>
        </>
      );
    }

    if (currentStep === 3) {
      return (
        <>
          <StepHeader title="Your stay" description="Help us prepare a safe, comfortable, and well-organized visit." />
          <h3 className="font-display text-lg font-bold text-emerald-950">Health information</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Medical conditions"><textarea className={TEXTAREA_CLASS} value={form.medicalConditions} onChange={(event) => updateField('medicalConditions', event.target.value)} placeholder="Share only what our team needs to know" /></Field>
            <Field label="Allergies"><textarea className={TEXTAREA_CLASS} value={form.allergies} onChange={(event) => updateField('allergies', event.target.value)} placeholder="Food, medication, or environmental allergies" /></Field>
            <Field label="Dietary requirements"><textarea className={TEXTAREA_CLASS} value={form.dietaryRequirements} onChange={(event) => updateField('dietaryRequirements', event.target.value)} placeholder="Dietary needs or preferences" /></Field>
            <Field label="Emergency medical information"><textarea className={TEXTAREA_CLASS} value={form.emergencyMedicalInformation} onChange={(event) => updateField('emergencyMedicalInformation', event.target.value)} placeholder="Anything important for an emergency response" /></Field>
          </div>
          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">Accommodation & travel</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Need accommodation?" required><select className={SELECT_CLASS} value={form.needAccommodation} onChange={(event) => updateField('needAccommodation', event.target.value)}><option value="">Select an option</option><option>Yes</option><option>No</option></select></Field>
              <Field label="Room preference"><select className={SELECT_CLASS} value={form.roomPreference} onChange={(event) => updateField('roomPreference', event.target.value)}><option value="">Select a preference</option><option>Shared room</option><option>Private room</option><option>No preference</option></select></Field>
              <Field label="Need invitation letter?" required><select className={SELECT_CLASS} value={form.needInvitationLetter} onChange={(event) => updateField('needInvitationLetter', event.target.value)}><option value="">Select an option</option><option>Yes</option><option>No</option></select></Field>
              <Field label="Need airport pickup?" required><select className={SELECT_CLASS} value={form.needAirportPickup} onChange={(event) => updateField('needAirportPickup', event.target.value)}><option value="">Select an option</option><option>Yes</option><option>No</option></select></Field>
              <Field label="Expected arrival airport"><input className={INPUT_CLASS} value={form.expectedArrivalAirport} onChange={(event) => updateField('expectedArrivalAirport', event.target.value)} placeholder="e.g. Kigali International Airport" /></Field>
              <Field label="Flight details"><textarea className={TEXTAREA_CLASS} value={form.flightDetails} onChange={(event) => updateField('flightDetails', event.target.value)} placeholder="Add details if your flight is already booked" /></Field>
            </div>
          </div>
        </>
      );
    }

    if (currentStep === 4) {
      return (
        <>
          <StepHeader title="Documents & agreements" description="A few final confirmations help us protect you and the communities we work with." />
          <h3 className="font-display text-lg font-bold text-emerald-950">Media consent</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">I consent to Leonard Regeneration Center and We4Climate using photographs, videos, and stories of my participation for educational and promotional purposes.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{['Yes', 'No'].map((option) => <ChoiceCard key={option} name="media-consent" value={option} label={option} type="radio" checked={form.mediaConsent === option} onChange={() => updateField('mediaConsent', option)} />)}</div>

          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">Code of conduct</h3>
            <p className="mt-1 text-sm text-slate-500">Please confirm each commitment.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{CONDUCT_ITEMS.map((item) => <ChoiceCard key={item} name="conduct" value={item} label={item} checked={form.conduct.includes(item)} onChange={() => toggleConduct(item)} />)}</div>
          </div>

          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">Declaration</h3>
            <label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${form.declarationAccepted ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50/60'}`}>
              <input type="checkbox" checked={form.declarationAccepted} onChange={(event) => updateField('declarationAccepted', event.target.checked)} className="sr-only" />
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${form.declarationAccepted ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'}`} />
              <span className="text-sm leading-relaxed text-slate-600">I certify that the information provided is accurate and understand that submission does not guarantee acceptance. <span className="text-emerald-600">*</span></span>
            </label>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <Field label="Applicant name" required><input className={INPUT_CLASS} value={form.applicantName} onChange={(event) => updateField('applicantName', event.target.value)} placeholder="Type your name" /></Field>
              <Field label="Signature" required hint="Type your name as your digital signature"><input className={INPUT_CLASS} value={form.signature} onChange={(event) => updateField('signature', event.target.value)} placeholder="Your signature" /></Field>
              <Field label="Date" required><input type="date" className={INPUT_CLASS} value={form.declarationDate} onChange={(event) => updateField('declarationDate', event.target.value)} /></Field>
            </div>
          </div>

          <div className="mt-9 border-t border-slate-100 pt-7">
            <h3 className="font-display text-lg font-bold text-emerald-950">Attachments</h3>
            <p className="mt-1 text-sm text-slate-500">Passport copy, passport photo, CV, and motivation letter are required.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <AttachmentCard label="Passport copy" required file={attachments.passportCopy} onChange={handleAttachmentChange('passportCopy')} accept=".pdf,.jpg,.jpeg,.png" />
              <AttachmentCard label="Recent passport photo" required file={attachments.passportPhoto} onChange={handleAttachmentChange('passportPhoto')} accept=".jpg,.jpeg,.png,.pdf" />
              <AttachmentCard label="Curriculum Vitae (CV)" required file={attachments.cv} onChange={handleAttachmentChange('cv')} accept=".pdf,.doc,.docx" />
              <AttachmentCard label="Motivation letter" required file={attachments.motivationLetter} onChange={handleAttachmentChange('motivationLetter')} accept=".pdf,.doc,.docx" />
              <AttachmentCard label="Recommendation letter" file={attachments.recommendationLetter} onChange={handleAttachmentChange('recommendationLetter')} accept=".pdf,.doc,.docx" />
              <AttachmentCard label="Relevant certificates" file={attachments.certificates} onChange={handleAttachmentChange('certificates')} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <StepHeader title="Review your application" description="Take a moment to make sure your details are correct before sending." />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-display font-bold text-emerald-950">Contact</h3><dl className="mt-2"><ReviewRow label="Name" value={form.fullName} /><ReviewRow label="Email" value={form.email} /><ReviewRow label="Phone" value={form.phone} /><ReviewRow label="Country" value={form.countryOfResidence} /></dl></div>
          <div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-display font-bold text-emerald-950">Placement</h3><dl className="mt-2"><ReviewRow label="Programs" value={form.programs.join(', ')} /><ReviewRow label="Dates" value={`${form.arrivalDate || 'Not set'} → ${form.departureDate || 'Not set'}`} /><ReviewRow label="Availability" value={form.availability} /><ReviewRow label="Length of stay" value={form.lengthOfStay} /></dl></div>
          <div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-display font-bold text-emerald-950">Travel</h3><dl className="mt-2"><ReviewRow label="Accommodation" value={form.needAccommodation} /><ReviewRow label="Invitation letter" value={form.needInvitationLetter} /><ReviewRow label="Airport pickup" value={form.needAirportPickup} /></dl></div>
          <div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-display font-bold text-emerald-950">Documents</h3><dl className="mt-2"><ReviewRow label="Passport copy" value={attachments.passportCopy?.name || ''} /><ReviewRow label="CV" value={attachments.cv?.name || ''} /><ReviewRow label="Motivation letter" value={attachments.motivationLetter?.name || ''} /></dl></div>
        </div>
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-900">You are ready to submit. The LRC team will review your application and contact you by email with next steps.</div>
      </>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-h-screen bg-[#f5faf6]">
      <main id="volunteer-form" className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-10 pt-24 sm:scroll-mt-28 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h1 className="font-display text-3xl font-bold tracking-tight text-emerald-950">Start your application</h1><p className="mt-2 text-sm text-slate-500">Complete each step. You can go back at any time.</p><p className="mt-3 w-fit rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">NB: We only host international volunteers for exchange(expert,students, travellers, etc).</p></div>
          <span className="text-xs text-slate-400"><span className="text-emerald-600">*</span> Required fields</span>
        </div>

        {submitted ? (
          <div className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-950/5 sm:p-14">
            <h2 className="mt-2 font-display text-3xl font-bold text-emerald-950">Application sent.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-600">Thank you for stepping forward. The LRC team will review your information and contact you by email with the next steps.</p>
            {applicationId && <p className="mt-5 text-xs text-slate-400">Reference: LRC-{applicationId}</p>}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/programs" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">Explore programs</Link><button type="button" onClick={resetApplication} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700">Submit another application</button></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between"><span className="text-sm font-bold text-emerald-950">{STEPS[currentStep].title}</span><span className="text-xs font-semibold text-slate-400">Step {currentStep + 1} of {STEPS.length}</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-emerald-50"><div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} /></div>
              <div className="mt-5 hidden grid-cols-6 gap-2 md:grid">{STEPS.map((step, index) => <button key={step.title} type="button" onClick={() => index < currentStep && (setSubmitError(''), setCurrentStep(index), scrollToForm())} className={`text-left text-xs font-semibold transition-colors ${index === currentStep ? 'text-emerald-700' : index < currentStep ? 'text-slate-500 hover:text-emerald-700' : 'text-slate-300'}`}><span className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${index < currentStep ? 'bg-emerald-100 text-emerald-700' : index === currentStep ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</span>{step.title}</button>)}</div>
            </div>

            {submitError && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{submitError}</div>}

            <motion.div key={currentStep} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-8">{renderStep()}</motion.div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <button type="button" onClick={goBack} disabled={currentStep === 0 || isSubmitting} className="inline-flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700 disabled:invisible">Back</button>
              {currentStep < STEPS.length - 1 ? <button type="button" onClick={goNext} className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-500">Continue</button> : <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Sending…' : 'Submit application'}</button>}
            </div>
            <p className="mt-5 text-center text-xs text-slate-400">We’ll use your email only to follow up about this application.</p>
          </form>
        )}
      </main>
    </motion.div>
  );
}
