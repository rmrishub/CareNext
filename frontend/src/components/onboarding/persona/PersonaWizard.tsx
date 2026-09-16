import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Edit3, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Save
} from 'lucide-react';
import { api } from '../../../services/api';
import { useOnboarding } from '../../../context/OnboardingContext';
import type { MobilityLevel, ShiftPreference, PersonaStatus } from '../../../types';

export const PersonaWizard: React.FC = () => {
  const { activeElder, setActiveElder, setCurrentStep } = useOnboarding();

  // Active step in the 10-step wizard (1-indexed: 1 to 10)
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State initialized from activeElder
  const [name, setName] = useState(activeElder?.name || 'Kalyani Ammal');
  const [age, setAge] = useState(activeElder?.age || 76);
  const [gender, setGender] = useState<'FEMALE' | 'MALE' | 'OTHER'>(activeElder?.gender || 'FEMALE');
  const [dateOfBirth, setDateOfBirth] = useState(activeElder?.dateOfBirth || '1950-08-15');

  const [mobilityLevel, setMobilityLevel] = useState<MobilityLevel>(activeElder?.mobilityLevel || 'CANE_WALKER');
  
  const [medicalConditions, setMedicalConditions] = useState<string[]>(
    activeElder?.medicalConditions?.length ? activeElder.medicalConditions : ['Diabetes Mellitus', 'Hypertension', 'Mild Post-Stroke Weakness']
  );
  const [careRequirements, setCareRequirements] = useState<string[]>(
    activeElder?.careRequirements?.length ? activeElder.careRequirements : ['Medication Management', 'Mobility Assistance', 'Vitals Monitoring']
  );
  const [medicalDevices, setMedicalDevices] = useState<string[]>(
    activeElder?.medicalDevices?.length ? activeElder.medicalDevices : ['Walking Cane / Quadripod', 'Blood Glucose Monitor']
  );

  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    activeElder?.dietaryPreferences?.length ? activeElder.dietaryPreferences : ['Vegetarian (South Indian)', 'Diabetic Diet', 'Low Sodium']
  );

  const [languages, setLanguages] = useState<string[]>(
    activeElder?.languages?.length ? activeElder.languages : ['Tamil', 'English']
  );
  const [primaryLanguage, setPrimaryLanguage] = useState(activeElder?.primaryLanguage || 'Tamil');

  const [lifestylePreferences, setLifestylePreferences] = useState<string[]>(
    activeElder?.lifestylePreferences?.length ? activeElder.lifestylePreferences : ['Morning Temple Puja', 'Listening to Carnatic Music', 'Evening Balcony Walk']
  );
  const [wakeTime, setWakeTime] = useState(activeElder?.dailyRoutine?.wakeTime || '06:00 AM');
  const [bedTime, setBedTime] = useState(activeElder?.dailyRoutine?.bedTime || '09:30 PM');
  const [routineNotes, setRoutineNotes] = useState(activeElder?.dailyRoutine?.notes || 'Takes afternoon nap between 1:30 PM to 3:00 PM.');

  const [shiftPreference, setShiftPreference] = useState<ShiftPreference>(
    activeElder?.shiftPreference || 'TWELVE_HOUR_DAY_NIGHT'
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    activeElder?.additionalNotes || 'Prepares own morning filter coffee if assisted to kitchen; prefers calm, patient attendants who speak fluent Tamil.'
  );

  useEffect(() => {
    if (activeElder) {
      setName(activeElder.name);
      setAge(activeElder.age);
      setGender(activeElder.gender);
      if (activeElder.mobilityLevel) setMobilityLevel(activeElder.mobilityLevel);
      if (activeElder.medicalConditions?.length) setMedicalConditions(activeElder.medicalConditions);
      if (activeElder.careRequirements?.length) setCareRequirements(activeElder.careRequirements);
      if (activeElder.medicalDevices?.length) setMedicalDevices(activeElder.medicalDevices);
      if (activeElder.dietaryPreferences?.length) setDietaryPreferences(activeElder.dietaryPreferences);
      if (activeElder.languages?.length) setLanguages(activeElder.languages);
      if (activeElder.primaryLanguage) setPrimaryLanguage(activeElder.primaryLanguage);
      if (activeElder.lifestylePreferences?.length) setLifestylePreferences(activeElder.lifestylePreferences);
      if (activeElder.shiftPreference) setShiftPreference(activeElder.shiftPreference);
      if (activeElder.additionalNotes) setAdditionalNotes(activeElder.additionalNotes);
      if (activeElder.dailyRoutine) {
        if (activeElder.dailyRoutine.wakeTime) setWakeTime(activeElder.dailyRoutine.wakeTime);
        if (activeElder.dailyRoutine.bedTime) setBedTime(activeElder.dailyRoutine.bedTime);
        if (activeElder.dailyRoutine.notes) setRoutineNotes(activeElder.dailyRoutine.notes);
      }
    }
  }, [activeElder]);

  // Persist current form data to backend
  const persistChanges = async (overrideStatus?: PersonaStatus) => {
    if (!activeElder) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      const updated = await api.updateElder(activeElder.id, {
        name,
        age: Number(age),
        gender,
        dateOfBirth: dateOfBirth || null,
        mobilityLevel,
        medicalConditions,
        careRequirements,
        medicalDevices,
        dietaryPreferences,
        languages,
        primaryLanguage,
        lifestylePreferences,
        dailyRoutine: { wakeTime, bedTime, notes: routineNotes },
        shiftPreference,
        additionalNotes,
        personaStatus: overrideStatus || 'IN_PROGRESS'
      });
      setActiveElder(updated);
      return updated;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save patient persona changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    await persistChanges();
    if (currentStepIndex < 10) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      await persistChanges('SAVED');
      setSuccessMessage('Patient Persona successfully finalized and saved!');
      setTimeout(() => {
        setCurrentStep('ASSESSMENT');
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to finalize patient persona');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const stepTitles = [
    'Care Philosophy',
    'Basic Profile',
    'Mobility',
    'Medical & Care',
    'Dietary Needs',
    'Languages',
    'Daily Routine',
    'Shift Preference',
    'Family Notes',
    'Review & Finalize'
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
          <span>Phase A.2</span>
          <span>•</span>
          <span>Patient Persona Configuration</span>
          <span>•</span>
          <span>Step {currentStepIndex} of 10</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {stepTitles[currentStepIndex - 1]}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Family-provided clinical and lifestyle intake for tailored elder care in Chennai.
        </p>
      </div>

      {/* Visual Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Progress</span>
          <span>{currentStepIndex * 10}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-600 rounded-full transition-all duration-300"
            style={{ width: `${currentStepIndex * 10}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[380px] flex flex-col justify-between">
        
        <div>
          {/* STEP 1: Care Philosophy & Non-Diagnostic Disclaimer */}
          {currentStepIndex === 1 && (
            <div className="space-y-6">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 flex items-start gap-3">
                <Heart className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">Empathetic, Family-Centered Elder Care</h3>
                  <p className="text-xs text-teal-800/90 mt-1 leading-relaxed">
                    Every elder has a unique rhythm of life. Over the next few minutes, we will ask about mobility, daily routines, medical history, and language preferences. This helps our Care Managers match the most compatible attendant.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Medical Disclaimer & Compliance:</span>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    All medical information provided here represents family observations and known doctor instructions. CareConnect does not replace clinical hospital diagnosis. Attendants provide non-invasive care, assistance, and vital monitoring under supervisory Care Managers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-2">1</div>
                  <h4 className="font-bold text-xs text-slate-800">10-Minute Intake</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Structured questions you can complete or edit at any time.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-2">2</div>
                  <h4 className="font-bold text-xs text-slate-800">Direct Editability</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Review summary card allows instant jump-to-edit before submission.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-2">3</div>
                  <h4 className="font-bold text-xs text-slate-800">Chennai Corridors</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Tailored for Chennai households with regional food and language matching.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Basic Profile */}
          {currentStepIndex === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Elder's Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kalyani Ammal"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Mobility Level */}
          {currentStepIndex === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 mb-2">
                Select the primary mobility level of the elder. This determines the physical strength and transfer technique required by the caregiver.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'INDEPENDENT',
                    title: 'Fully Independent',
                    desc: 'Walks independently without walking aids or physical assistance. Needs companionship or companionship + supervision.',
                    icon: '🚶'
                  },
                  {
                    id: 'CANE_WALKER',
                    title: 'Uses Cane / Walker',
                    desc: 'Requires a cane, quadripod stick, or walker for stability. Needs assistance with balance, stairs, or uneven surfaces.',
                    icon: '🦯'
                  },
                  {
                    id: 'WHEELCHAIR',
                    title: 'Wheelchair-Bound',
                    desc: 'Uses a manual or electric wheelchair. Requires support for transfers to bed, commode, and car.',
                    icon: '🦽'
                  },
                  {
                    id: 'BEDRIDDEN',
                    title: 'Bedridden / Fully Dependent',
                    desc: 'Confined to bed. Requires complete bed-side nursing, periodic repositioning, diaper changes, and sponge baths.',
                    icon: '🛌'
                  },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMobilityLevel(opt.id as MobilityLevel)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      mobilityLevel === opt.id
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div className="font-bold text-sm text-slate-900">{opt.title}</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Medical & Care Requirements */}
          {currentStepIndex === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Known Medical Conditions
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Diabetes Mellitus',
                    'Hypertension',
                    'Mild Post-Stroke Weakness',
                    'Severe Post-Stroke Hemiplegia',
                    'Parkinson’s Disease',
                    'Dementia / Alzheimer’s (Early)',
                    'Dementia / Alzheimer’s (Advanced)',
                    'Arthritis / Joint Pain',
                    'Cardiac Condition',
                    'Respiratory / Asthma',
                    'Kidney / Renal Care'
                  ].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleItem(medicalConditions, setMedicalConditions, c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        medicalConditions.includes(c)
                          ? 'bg-teal-700 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {medicalConditions.includes(c) ? '✓ ' : '+ '}{c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Care & Nursing Requirements
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Medication Management',
                    'Mobility Assistance',
                    'Vitals Monitoring (BP/Sugar)',
                    'Catheter Care (Foley’s)',
                    'Feeding Tube (Ryle’s Tube)',
                    'Wound Dressing / Bed Sore Care',
                    'Oxygen Concentrator Management',
                    'Diaper Changing & Hygiene',
                    'Assisted Sponge / Bathing',
                    'Physiotherapy Exercises'
                  ].map(req => (
                    <button
                      key={req}
                      type="button"
                      onClick={() => toggleItem(careRequirements, setCareRequirements, req)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        careRequirements.includes(req)
                          ? 'bg-teal-700 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {careRequirements.includes(req) ? '✓ ' : '+ '}{req}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Medical Equipment & Devices in Home
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Walking Cane / Quadripod',
                    'Walker',
                    'Wheelchair (Manual)',
                    'Hospital Bed / Air Mattress',
                    'Blood Glucose Monitor',
                    'Digital BP Monitor',
                    'Pulse Oximeter',
                    'Oxygen Concentrator',
                    'Suction Machine',
                    'Nebulizer'
                  ].map(dev => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => toggleItem(medicalDevices, setMedicalDevices, dev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        medicalDevices.includes(dev)
                          ? 'bg-teal-700 text-white font-semibold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {medicalDevices.includes(dev) ? '✓ ' : '+ '}{dev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Dietary Preferences */}
          {currentStepIndex === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 mb-2">
                Elderly nutrition is key to vitality. Select dietary constraints and meal preparation styles:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Vegetarian (South Indian)', desc: 'Strict vegetarian, sambar, rasam, kootu, poriyal' },
                  { name: 'Diabetic Diet', desc: 'Low glycemic index, millets, no added refined sugar' },
                  { name: 'Low Sodium / Salt-Restricted', desc: 'Hypertension or cardiac recommended diet' },
                  { name: 'Non-Vegetarian (Eggs / Chicken / Fish)', desc: 'Prepares or consumes meat / egg items' },
                  { name: 'Soft / Semi-Solid Diet', desc: 'Easy to chew and swallow (porridge, khichdi, idli)' },
                  { name: 'Pureed / Liquid Blender Diet', desc: 'For tube feeding or swallowing difficulty (Dysphagia)' },
                  { name: 'Jain / No Onion Garlic', desc: 'Custom satvik food preparation' },
                ].map(d => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => toggleItem(dietaryPreferences, setDietaryPreferences, d.name)}
                    className={`text-left p-3.5 rounded-xl border transition ${
                      dietaryPreferences.includes(d.name)
                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Languages */}
          {currentStepIndex === 6 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Comfort Language <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Tamil', 'Telugu', 'English', 'Malayalam', 'Kannada', 'Hindi'].map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setPrimaryLanguage(lang)}
                      className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition ${
                        primaryLanguage === lang
                          ? 'border-teal-600 bg-teal-700 text-white shadow-sm'
                          : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Additional Languages Understood
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Tamil', 'Telugu', 'English', 'Hindi', 'Malayalam', 'Kannada'].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleItem(languages, setLanguages, l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        languages.includes(l)
                          ? 'bg-teal-700 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {languages.includes(l) ? '✓ ' : '+ '}{l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Lifestyle & Daily Routine */}
          {currentStepIndex === 7 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Household Routine & Hobbies
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Morning Temple Puja',
                    'Listening to Carnatic Music',
                    'Evening Balcony Walk',
                    'Newspaper Reading (The Hindu / Dinamalar)',
                    'Watching TV / Serials',
                    'Gardening / Watering Plants',
                    'Afternoon Siesta / Rest',
                    'Quiet Meditation'
                  ].map(hab => (
                    <button
                      key={hab}
                      type="button"
                      onClick={() => toggleItem(lifestylePreferences, setLifestylePreferences, hab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        lifestylePreferences.includes(hab)
                          ? 'bg-teal-700 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lifestylePreferences.includes(hab) ? '✓ ' : '+ '}{hab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Typical Waking Time</label>
                  <input
                    type="text"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    placeholder="e.g. 05:30 AM"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Typical Bedtime</label>
                  <input
                    type="text"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    placeholder="e.g. 09:30 PM"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Schedule Notes</label>
                <textarea
                  rows={2}
                  value={routineNotes}
                  onChange={(e) => setRoutineNotes(e.target.value)}
                  placeholder="Notes about coffee time, bath preferences, prayers..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* STEP 8: Shift Preference */}
          {currentStepIndex === 8 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 mb-2">
                What care duration and shift schedule best fits your family's daily requirements?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'EIGHT_HOUR_DAY',
                    title: '8-Hour Day Shift',
                    desc: 'Morning to evening assistance (e.g. 9:00 AM – 5:00 PM). Ideal for day routines, medication, cooking assistance, and companionship.',
                    hours: '8 hrs / day'
                  },
                  {
                    id: 'TWELVE_HOUR_DAY_NIGHT',
                    title: '12-Hour Day / Night',
                    desc: 'Full day or overnight vigil (e.g. 8:00 AM – 8:00 PM or 8:00 PM – 8:00 AM). Best for post-operative recovery or nocturnal wandering.',
                    hours: '12 hrs / day'
                  },
                  {
                    id: 'TWENTY_FOUR_HOUR_LIVE_IN',
                    title: '24-Hour Live-in Care',
                    desc: 'Dedicated full-time attendant residing in elder’s home with scheduled rest breaks. Best for continuous bedridden or dementia care.',
                    hours: '24 hrs / live-in'
                  },
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShiftPreference(s.id as ShiftPreference)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      shiftPreference === s.id
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 mb-2">
                        {s.hours}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 9: Additional Care Notes */}
          {currentStepIndex === 9 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Special Family Notes & Cultural Instructions
              </label>
              <p className="text-xs text-slate-500">
                Mention any personal nuances: e.g., how the elder likes to be addressed, sensitive topics, emergency doctor contact, or pet preferences.
              </p>
              <textarea
                rows={5}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Elder prefers to be called 'Kalyani Mami'. Kindly ensure morning coffee is served at 6:15 AM without chicory. Attendant should have gentle demeanour..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
              />
            </div>
          )}

          {/* STEP 10: Review & Finalize (Edit from Review capability) */}
          {currentStepIndex === 10 && (
            <div className="space-y-6">
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Persona Intake Summary</p>
                  <p className="mt-0.5 text-teal-800">
                    Review all details below before saving. Click any "Edit" button to jump directly back to that section and adjust details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Basic Profile Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                  <button
                    onClick={() => setCurrentStepIndex(2)}
                    className="absolute top-3 right-3 text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Basic Profile</span>
                  <div className="text-sm font-bold text-slate-900">{name}</div>
                  <div className="text-slate-600 mt-0.5">{age} years • {gender}</div>
                  {dateOfBirth && <div className="text-slate-500 text-[11px] mt-0.5">DOB: {dateOfBirth}</div>}
                </div>

                {/* Mobility Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                  <button
                    onClick={() => setCurrentStepIndex(3)}
                    className="absolute top-3 right-3 text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobility Level</span>
                  <div className="text-sm font-bold text-teal-800 capitalize">
                    {mobilityLevel.replace('_', ' ').toLowerCase()}
                  </div>
                </div>

                {/* Clinical Requirements Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                  <button
                    onClick={() => setCurrentStepIndex(4)}
                    className="absolute top-3 right-3 text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Medical & Care</span>
                  <div className="font-semibold text-slate-800 mt-1">Conditions:</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {medicalConditions.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="font-semibold text-slate-800 mt-2">Care Tasks:</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {careRequirements.map(r => (
                      <span key={r} className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded text-[11px] text-teal-800">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dietary & Languages Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                  <button
                    onClick={() => setCurrentStepIndex(5)}
                    className="absolute top-3 right-3 text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Diet & Language</span>
                  <div className="mt-1"><span className="font-semibold text-slate-700">Primary Language:</span> {primaryLanguage}</div>
                  <div className="mt-1"><span className="font-semibold text-slate-700">Languages:</span> {languages.join(', ')}</div>
                  <div className="mt-2 font-semibold text-slate-700">Dietary Preferences:</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {dietaryPreferences.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shift Preference Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative md:col-span-2">
                  <button
                    onClick={() => setCurrentStepIndex(8)}
                    className="absolute top-3 right-3 text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Shift Schedule</span>
                  <div className="text-sm font-bold text-teal-900">
                    {shiftPreference.replace(/_/g, ' ')}
                  </div>
                  {additionalNotes && (
                    <div className="mt-2 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <span className="font-semibold text-slate-800">Family Instructions: </span>
                      {additionalNotes}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 1 || isSaving}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStepIndex < 10 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSaving}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {isSaving ? (
                <span className="animate-pulse">Saving Step...</span>
              ) : (
                <>
                  <span>Next: {stepTitles[currentStepIndex]}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2"
            >
              {isSaving ? (
                <span className="animate-pulse">Finalizing Persona...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Finalize Patient Persona</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
