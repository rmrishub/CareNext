import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Navigation, 
  ArrowRight, 
  Building2, 
  Compass,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useOnboarding } from '../../context/OnboardingContext';
import type { LocationVerifyResponse } from '../../types';

interface LocalityOption {
  name: string;
  pincode: string;
  hub: string;
}

const CHENNAI_LOCALITIES: LocalityOption[] = [
  { name: 'Adyar', pincode: '600020', hub: 'South Chennai Hub' },
  { name: 'Besant Nagar', pincode: '600090', hub: 'South Chennai Hub' },
  { name: 'Thiruvanmiyur', pincode: '600041', hub: 'South Chennai Hub' },
  { name: 'Velachery', pincode: '600042', hub: 'South Chennai Hub' },
  { name: 'Mylapore', pincode: '600004', hub: 'Central Chennai Hub' },
  { name: 'T. Nagar', pincode: '600017', hub: 'Central Chennai Hub' },
  { name: 'Alwarpet', pincode: '600018', hub: 'Central Chennai Hub' },
  { name: 'Nungambakkam', pincode: '600034', hub: 'Central Chennai Hub' },
  { name: 'Anna Nagar', pincode: '600040', hub: 'North-West Chennai Hub' },
  { name: 'Kilpauk', pincode: '600010', hub: 'Central Chennai Hub' },
  { name: 'Royapettah', pincode: '600014', hub: 'Central Chennai Hub' },
  { name: 'Perungudi (OMR)', pincode: '600096', hub: 'OMR South Hub' },
  { name: 'Sholinganallur (OMR)', pincode: '600119', hub: 'OMR South Hub' },
  { name: 'R.A. Puram', pincode: '600028', hub: 'Central Chennai Hub' },
  { name: 'Ashok Nagar', pincode: '600083', hub: 'Central Chennai Hub' },
];

export const GeographicVerification: React.FC = () => {
  const { activeElder, setActiveElder, setCurrentStep, loadElderData } = useOnboarding();

  // Basic elder fields if new
  const [elderName, setElderName] = useState('Kalyani Ammal');
  const [elderAge, setElderAge] = useState(76);
  const [elderGender, setElderGender] = useState<'FEMALE' | 'MALE' | 'OTHER'>('FEMALE');

  // Location fields
  const [addressLine1, setAddressLine1] = useState('Flat 3B, Shanthi Apartments, 2nd Main Road');
  const [addressLine2, setAddressLine2] = useState('Gandhi Nagar');
  const [locality, setLocality] = useState('Adyar');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('600020');
  const [landmark, setLandmark] = useState('Near Adyar Signal');

  // Verification state
  const [verifyResult, setVerifyResult] = useState<LocationVerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill from active elder if already set
  useEffect(() => {
    if (activeElder) {
      setElderName(activeElder.name);
      setElderAge(activeElder.age);
      setElderGender(activeElder.gender);
      if (activeElder.location) {
        const loc = activeElder.location;
        setAddressLine1(loc.addressLine1);
        setAddressLine2(loc.addressLine2 || '');
        setLocality(loc.locality);
        setCity(loc.city);
        setState(loc.state);
        setPostalCode(loc.postalCode);
        setLandmark(loc.landmark || '');
        setVerifyResult({
          serviceable: loc.serviceable,
          verificationStatus: loc.verificationStatus,
          message: 'Saved address retrieved from database.',
          latitude: loc.latitude,
          longitude: loc.longitude,
          locality: loc.locality,
          city: loc.city,
          postalCode: loc.postalCode,
          assignedHub: 'Chennai Care Hub'
        });
      }
    }
  }, [activeElder]);

  const handleLocalitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CHENNAI_LOCALITIES.find(l => l.name === e.target.value);
    if (selected) {
      setLocality(selected.name);
      setPostalCode(selected.pincode);
    } else {
      setLocality(e.target.value);
    }
  };

  const handleVerifyLocation = async (simulateState?: string) => {
    setErrorMessage('');
    setIsVerifying(true);
    try {
      const res = await api.verifyLocation({
        addressLine1,
        addressLine2,
        locality,
        city,
        state,
        postalCode,
        landmark,
        simulateState
      });
      setVerifyResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Geographic verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveAndProceed = async () => {
    if (!verifyResult || !verifyResult.serviceable) {
      setErrorMessage('Please verify that the address is within Chennai serviceable coverage first.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      let currentElder = activeElder;
      // 1. Create elder if not existing yet
      if (!currentElder) {
        currentElder = await api.createElder({
          name: elderName,
          age: Number(elderAge),
          gender: elderGender,
        });
        setActiveElder(currentElder);
      }

      // 2. Persist verified location
      await api.persistElderLocation(currentElder.id, {
        addressLine1,
        addressLine2,
        locality: verifyResult.locality,
        city: verifyResult.city,
        state,
        postalCode: verifyResult.postalCode,
        landmark,
        latitude: verifyResult.latitude,
        longitude: verifyResult.longitude,
      });

      // 3. Reload full elder and transition to Persona Configuration
      await loadElderData(currentElder.id);
      setCurrentStep('PERSONA');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save verified address');
    } finally {
      setIsSaving(false);
    }
  };

  // Preset test scenarios
  const setScenario = (type: 'adyar' | 'annanagar' | 'bangalore' | 'invalid' | 'permission') => {
    if (type === 'adyar') {
      setAddressLine1('Flat 3B, Shanthi Apartments, 2nd Main Road');
      setLocality('Adyar');
      setCity('Chennai');
      setPostalCode('600020');
      handleVerifyLocation();
    } else if (type === 'annanagar') {
      setAddressLine1('W-Block, 12th Street, 4th Avenue');
      setLocality('Anna Nagar');
      setCity('Chennai');
      setPostalCode('600040');
      handleVerifyLocation();
    } else if (type === 'bangalore') {
      setAddressLine1('12, 100 Feet Road, Indiranagar');
      setLocality('Indiranagar');
      setCity('Bengaluru');
      setPostalCode('560038');
      handleVerifyLocation();
    } else if (type === 'invalid') {
      setAddressLine1('A');
      setLocality('Chennai');
      setCity('Chennai');
      setPostalCode('600');
      handleVerifyLocation();
    } else if (type === 'permission') {
      handleVerifyLocation('PERMISSION_DENIED');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
          <span>Phase A.1</span>
          <span>•</span>
          <span>Geographic Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Where will your loved one receive care?
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
          CareConnect operates dedicated clinical care corridors across Chennai. We independently verify the elder’s residence to ensure rapid attendant dispatch and reliable geofenced check-ins.
        </p>
      </div>

      {/* Preset Test Buttons for Quick QA */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 mb-8 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Test Corridors:
        </span>
        <button
          onClick={() => setScenario('adyar')}
          className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition"
        >
          🟢 Chennai Adyar (Serviceable)
        </button>
        <button
          onClick={() => setScenario('annanagar')}
          className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition"
        >
          🟢 Anna Nagar (Serviceable)
        </button>
        <button
          onClick={() => setScenario('bangalore')}
          className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition"
        >
          🟡 Bengaluru (Out of Service)
        </button>
        <button
          onClick={() => setScenario('invalid')}
          className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition"
        >
          🔴 Invalid Address
        </button>
        <button
          onClick={() => setScenario('permission')}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition"
        >
          ⚪ Permission Denied
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Elder Basic Info Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              Elder Profile Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Elder's Full Name</label>
                <input
                  type="text"
                  required
                  value={elderName}
                  onChange={(e) => setElderName(e.target.value)}
                  placeholder="e.g. Kalyani Ammal"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  min="50"
                  max="120"
                  value={elderAge}
                  onChange={(e) => setElderAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Residential Care Address
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              The home address where attendants and clinical managers will report.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                House / Flat No., Apartment Name, Street <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Flat 3B, Shanthi Apts, 2nd Main Road"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Sub-Area / Street 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Gandhi Nagar"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Chennai Locality <span className="text-rose-500">*</span>
                </label>
                <select
                  value={locality}
                  onChange={handleLocalitySelect}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
                >
                  <option value="">Select Chennai Zone</option>
                  {CHENNAI_LOCALITIES.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} ({loc.pincode})
                    </option>
                  ))}
                  <option value="Other">Other Chennai Locality</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="600020"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Landmark (Helpful for Caregivers)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Adyar Bus Depot / Opposite Sangeetha"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleVerifyLocation()}
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <span className="inline-block animate-pulse">Checking Geographic Serviceability...</span>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-teal-400" />
                    <span>Check Serviceability in Chennai</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Verification Status & Map Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Verification Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-slate-500">
              Serviceability Assessment
            </h3>

            {!verifyResult ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No address verified yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fill in the address details and click "Check Serviceability" to run verification against the Chennai coverage grid.
                </p>
              </div>
            ) : verifyResult.verificationStatus === 'VERIFIED' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm">Zone Verified & Active</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {verifyResult.message}
                </p>
                <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-700 block font-medium">Assigned Care Hub:</span>
                    <span className="font-bold text-slate-800">{verifyResult.assignedHub}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block font-medium">GPS Coordinates:</span>
                    <span className="font-mono text-slate-800">
                      {verifyResult.latitude}, {verifyResult.longitude}
                    </span>
                  </div>
                </div>
              </div>
            ) : verifyResult.verificationStatus === 'NOT_SERVICEABLE' ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-bold text-sm">Outside Active Service Corridor</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {verifyResult.message}
                </p>
                <p className="text-[11px] text-amber-700">
                  CareConnect is currently deploying attendants in Chennai metropolitan zones. You can join our priority expansion waitlist.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Added to priority expansion waitlist! Our team will notify you when services expand.')}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 bg-amber-200/80 hover:bg-amber-200 text-amber-900 rounded-lg transition"
                >
                  Join Waitlist for {locality || city}
                </button>
              </div>
            ) : verifyResult.verificationStatus === 'INVALID_ADDRESS' ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-bold text-sm">Invalid Address Format</span>
                </div>
                <p className="text-xs text-rose-800">
                  {verifyResult.message}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-600 shrink-0" />
                  <span className="font-bold text-sm">{verifyResult.verificationStatus.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {verifyResult.message}
                </p>
              </div>
            )}

            {/* Interactive Simulated Map Widget */}
            <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden bg-slate-100 relative">
              <div className="h-44 w-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center text-center p-4">
                {verifyResult?.serviceable ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="w-12 h-3 rounded-full bg-slate-400/30 blur-xs mt-1"></div>
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-full shadow-xs border border-slate-200">
                      {verifyResult.locality}, Chennai ({verifyResult.postalCode})
                    </span>
                    <span className="text-[10px] text-teal-700 font-mono mt-0.5">
                      Lat: {verifyResult.latitude}° N, Lng: {verifyResult.longitude}° E
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center">
                    <Compass className="w-8 h-8 text-slate-300 mb-1" />
                    <span>Map Coordinates Preview</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Verify address to center map pin</span>
                  </div>
                )}
              </div>
              <div className="bg-white px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>Google Maps / PostGIS Grid</span>
                <span className="font-semibold text-teal-700">Chennai Core Corridor</span>
              </div>
            </div>

            {/* Proceed Action Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSaveAndProceed}
                disabled={!verifyResult?.serviceable || isSaving}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="inline-block animate-pulse">Persisting Verified Location...</span>
                ) : (
                  <>
                    <span>Confirm & Proceed to Patient Persona</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Phase A.2 Patient Persona intake will begin with this confirmed address.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
