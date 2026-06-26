import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TravelerFormCard from '../components/TravelerFormCard';
import TravelerSummaryCard from '../components/TravelerSummaryCard';
import { validatePassport, getPassportError } from '../utils/buildEndorsePolicyPayload'

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const inputCls = (err) =>
  `w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-white text-sm placeholder-white/25
   outline-none transition-colors duration-150
   ${err ? 'border-red-500/60 focus:border-red-400/80' : 'border-white/10 focus:border-gold/60 focus:bg-white/[0.07]'}`;

const Label = ({ children, required }) => (
  <label className="block text-white/45 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
    {children}{required && <span className="text-gold ml-0.5">*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-red-400 text-xs">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  ) : null;

export default function TravelerDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedPlan, selectedRiders, basePremium, riderTotal, finalPremium, tripForm } =
    location.state || {};

  // Generate travelers from birthDates
  const initialTravelers = useMemo(() => {
    if (!tripForm?.birthDates) return [];
    return tripForm.birthDates.map((dob) => ({
      dob,
      age: calcAge(dob),
      name: '',
      passport: '',
      gender: '',
    }));
  }, [tripForm]);

  const [travelers, setTravelers] = useState(initialTravelers);
  const [travelerErrors, setTravelerErrors] = useState({});

  // Contact Information
  const [email, setEmail] = useState(tripForm?.email || '');
  const [mobile, setMobile] = useState(tripForm?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState(''); // Add district field
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');

  // Nominee
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');

  // Emergency Contact
  const [emergencyPerson, setEmergencyPerson] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');

  // Medical
  const [preExisting, setPreExisting] = useState('no');
  const [pastIllness, setPastIllness] = useState('');

  // Additional
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstState, setGstState] = useState('');
  const [pnrNumber, setPnrNumber] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState({});

  const handleTravelerChange = (index, field, value) => {
    setTravelers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (travelerErrors[index]?.[field]) {
      setTravelerErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], [field]: '' },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const newTravelerErrors = {};

    // Contact validation
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';

    if (!mobile.trim()) newErrors.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) newErrors.mobile = 'Invalid mobile number';

    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!district.trim()) newErrors.district = 'District is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!pincode.trim()) newErrors.pincode = 'Pincode is required';

    // Nominee validation
    if (!nomineeName.trim()) newErrors.nomineeName = 'Nominee name is required';
    if (!nomineeRelation.trim()) newErrors.nomineeRelation = 'Relation is required';

    // Emergency contact validation
    if (!emergencyPerson.trim()) newErrors.emergencyPerson = 'Emergency contact name is required';
    if (!emergencyNumber.trim()) newErrors.emergencyNumber = 'Emergency contact number is required';
    else if (!/^\d{10}$/.test(emergencyNumber.replace(/\D/g, '')))
      newErrors.emergencyNumber = 'Invalid contact number';
    if (!emergencyEmail.trim()) newErrors.emergencyEmail = 'Emergency email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emergencyEmail))
      newErrors.emergencyEmail = 'Invalid email format';

    // Traveler validation with passport format check
    travelers.forEach((t, i) => {
      const tErr = {};
      if (!t.name.trim()) tErr.name = 'Name is required';
      
      // Passport validation
      const passportError = getPassportError(t.passport);
      if (passportError) {
        tErr.passport = passportError;
      }
      
      if (!t.gender) tErr.gender = 'Gender is required';
      if (Object.keys(tErr).length > 0) newTravelerErrors[i] = tErr;
    });

    setErrors(newErrors);
    setTravelerErrors(newTravelerErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newTravelerErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const travelerDetails = {
      contact: { email, mobile, address, city, district, state, country, pincode },
      travelers,
      nominee: { name: nomineeName, relation: nomineeRelation },
      emergency: { person: emergencyPerson, number: emergencyNumber, email: emergencyEmail },
      medical: { preExisting, pastIllness },
      additional: { gstNumber, gstState, pnrNumber, flightNumber, remarks },
    };

    sessionStorage.setItem('travelerDetails', JSON.stringify(travelerDetails));

    navigate('/review-summary', {
      state: { selectedPlan, selectedRiders, basePremium, riderTotal, finalPremium, tripForm },
    });
  };

  if (!selectedPlan || !tripForm) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm">Missing trip information.</p>
             <button onClick={() => navigate('/')} className="text-gold text-sm underline underline-offset-2">
               Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Hero */}
      <div className="relative bg-navy-light border-b border-white/10 overflow-hidden shrink-0">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(600px circle at 80% 0%, rgba(250,199,77,0.07), transparent 70%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-9">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-white/35 hover:text-gold text-xs font-medium mb-4 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">Complete Your Details</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Traveler <span className="text-gold">Information</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm max-w-xl">
            Fill in the details for all travelers and provide contact information.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* 1. Contact Information */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-base">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Email</Label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputCls(errors.email)} />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <Label required>Mobile</Label>
                  <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 00000 00000" className={inputCls(errors.mobile)} />
                  <FieldError msg={errors.mobile} />
                </div>
                <div className="sm:col-span-2">
                  <Label required>Address</Label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className={inputCls(errors.address)} />
                  <FieldError msg={errors.address} />
                </div>
                <div>
                  <Label required>City</Label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls(errors.city)} />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <Label required>District</Label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" className={inputCls(errors.district)} />
                  <FieldError msg={errors.district} />
                </div>
                <div>
                  <Label required>State</Label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className={inputCls(errors.state)} />
                  <FieldError msg={errors.state} />
                </div>
                <div>
                  <Label required>Country</Label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className={inputCls(errors.country)} />
                  <FieldError msg={errors.country} />
                </div>
                <div>
                  <Label required>Pincode</Label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="000000" className={inputCls(errors.pincode)} />
                  <FieldError msg={errors.pincode} />
                </div>
              </div>
            </section>

            {/* 2. Traveler Cards */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Travelers</p>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="flex flex-col gap-5">
                {travelers.map((t, i) => (
                  <TravelerFormCard key={i} index={i} data={t} errors={travelerErrors[i]} onChange={handleTravelerChange} />
                ))}
              </div>
            </section>

            {/* 3. Nominee */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-base">Nominee Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Nominee Name</Label>
                  <input type="text" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} placeholder="Full name" className={inputCls(errors.nomineeName)} />
                  <FieldError msg={errors.nomineeName} />
                </div>
                <div>
                  <Label required>Relation</Label>
                  <input type="text" value={nomineeRelation} onChange={(e) => setNomineeRelation(e.target.value)} placeholder="e.g. Spouse, Parent" className={inputCls(errors.nomineeRelation)} />
                  <FieldError msg={errors.nomineeRelation} />
                </div>
              </div>
            </section>

            {/* 4. Emergency Contact */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-base">Emergency Contact</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Contact Person</Label>
                  <input type="text" value={emergencyPerson} onChange={(e) => setEmergencyPerson(e.target.value)} placeholder="Full name" className={inputCls(errors.emergencyPerson)} />
                  <FieldError msg={errors.emergencyPerson} />
                </div>
                <div>
                  <Label required>Contact Number</Label>
                  <input type="tel" value={emergencyNumber} onChange={(e) => setEmergencyNumber(e.target.value)} placeholder="+91 00000 00000" className={inputCls(errors.emergencyNumber)} />
                  <FieldError msg={errors.emergencyNumber} />
                </div>
                <div className="sm:col-span-2">
                  <Label required>Email</Label>
                  <input type="email" value={emergencyEmail} onChange={(e) => setEmergencyEmail(e.target.value)} placeholder="emergency@email.com" className={inputCls(errors.emergencyEmail)} />
                  <FieldError msg={errors.emergencyEmail} />
                </div>
              </div>
            </section>

            {/* 5. Medical */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-white font-bold text-base">Medical Information</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <Label required>Pre Existing Medical Condition</Label>
                  <div className="flex gap-3">
                    {['yes', 'no'].map((opt) => (
                      <button key={opt} type="button" onClick={() => setPreExisting(opt)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all
                          ${preExisting === opt ? 'bg-gold text-navy border-gold' : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-gold/40'}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${preExisting === opt ? 'border-navy' : 'border-white/30'}`}>
                          {preExisting === opt && <span className="w-1.5 h-1.5 rounded-full bg-navy" />}
                        </span>
                        {opt === 'yes' ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
                {preExisting === 'yes' && (
                  <div>
                    <Label>Past Illness Details</Label>
                    <textarea value={pastIllness} onChange={(e) => setPastIllness(e.target.value)} placeholder="Please describe..." rows={3}
                      className={`w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:border-gold/60 resize-none`} />
                  </div>
                )}
              </div>
            </section>

            {/* 6. Additional Information Accordion */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <button type="button" onClick={() => setAdditionalOpen(!additionalOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-white font-bold text-base">Additional Information</h2>
                  <span className="text-white/30 text-xs">(Optional)</span>
                </div>
                <svg className={`w-5 h-5 text-gold transition-transform ${additionalOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {additionalOpen && (
                <div className="border-t border-white/8 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>GST Number</Label>
                    <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="GST Number" className={inputCls()} />
                  </div>
                  <div>
                    <Label>GST State</Label>
                    <input type="text" value={gstState} onChange={(e) => setGstState(e.target.value)} placeholder="State" className={inputCls()} />
                  </div>
                  <div>
                    <Label>PNR Number</Label>
                    <input type="text" value={pnrNumber} onChange={(e) => setPnrNumber(e.target.value)} placeholder="PNR" className={inputCls()} />
                  </div>
                  <div>
                    <Label>Flight Number</Label>
                    <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="Flight" className={inputCls()} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Remarks</Label>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any additional notes..." rows={3}
                      className={`w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:border-gold/60 resize-none`} />
                  </div>
                </div>
              )}
            </section>

            {/* Mobile Continue Button */}
            <div className="lg:hidden">
              <button onClick={handleContinue} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gold text-navy font-bold text-base transition-all hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]">
                Continue to Review
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 flex flex-col gap-5">
              <TravelerSummaryCard
                selectedPlan={selectedPlan}
                selectedRiders={selectedRiders}
                basePremium={basePremium}
                riderTotal={riderTotal}
                finalPremium={finalPremium}
                tripForm={tripForm}
              />
              <button onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gold text-navy font-bold text-base transition-all hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]">
                Continue to Review
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
