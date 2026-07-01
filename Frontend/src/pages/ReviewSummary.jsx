import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPolicy } from '../services/policyApi';
import { buildCreatePolicyPayload } from '../utils/buildEndorsePolicyPayload';
import { ASEGO_CONFIG } from '../config/asego';
import { initiatePayuPayment } from '../services/payuService';
import Navbar from '../components/Navbar';

const ReviewSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Get data from router state and sessionStorage
  const routerState = location.state || {};
  const { selectedPlan, selectedRiders = [], basePremium, riderTotal, finalPremium } = routerState;
  
  const [tripForm, setTripForm] = useState(null);
  const [travelerDetails, setTravelerDetails] = useState(null);

  useEffect(() => {
    const storedTrip = sessionStorage.getItem('tripForm');
    const storedTravelers = sessionStorage.getItem('travelerDetails');
    
    if (storedTrip) setTripForm(JSON.parse(storedTrip));
    if (storedTravelers) setTravelerDetails(JSON.parse(storedTravelers));
  }, []);

  const calcRiderCost = (rider) => {
    if (basePremium == null) return null;
    const landingPer = parseFloat(rider.riderDetailsList?.[0]?.landingPer ?? 0);
    if (!landingPer) return 0;
    return Math.round((basePremium * landingPer) / 100);
  };

  const handlePayment = async () => {
    if (!isAccepted) return;
    setIsProcessingPayment(true);

    try {
      const primaryTraveler = travelerDetails?.travelers?.[0] || {};
      const contactDetails  = travelerDetails?.contact || {};

      // Save plan + premium data to sessionStorage so PaymentSuccess page can read it after redirect
      sessionStorage.setItem('selectedPlan',    JSON.stringify(selectedPlan));
      sessionStorage.setItem('selectedRiders',  JSON.stringify(selectedRiders));
      sessionStorage.setItem('premiumData',     JSON.stringify({ finalPremium, basePremium, riderTotal }));

      // Also persist selectedCategory in case it was loaded from sessionStorage earlier
      const selectedCategoryStr = sessionStorage.getItem('selectedCategory');
      // (already in sessionStorage from the category selection step — no action needed)

      await initiatePayuPayment({
        amount:      finalPremium,
        name:        primaryTraveler.name || contactDetails.name || 'Customer',
        email:       contactDetails.email,
        contact:     contactDetails.mobile,
        description: `Travel Insurance - ${selectedPlan.planDisplayName}`,
      });
      // Page will redirect to PayU — code below won't run
    } catch (error) {
      setIsProcessingPayment(false);
      alert(`Error initiating payment: ${error.message}`);
    }
  };

  const handleCreatePolicy = async (paymentInfo) => {
    setIsCreating(true);
    
    try {
      const selectedCategoryStr = sessionStorage.getItem('selectedCategory');
      const selectedCategory = selectedCategoryStr ? JSON.parse(selectedCategoryStr) : null;
      
      const payload = buildCreatePolicyPayload({
        selectedPlan,
        selectedRiders,
        tripForm,
        travelerDetails,
        finalPremium,
        riderTotal,
        basePremium,
        config: ASEGO_CONFIG,
        selectedCategory,
      });
      
      console.log('\n========== PAYLOAD VALIDATION ==========');
      console.log('Payload Type:', Array.isArray(payload) ? 'ARRAY ✅' : 'OBJECT ❌');
      console.log('Array Length:', payload.length);
      console.log('Complete Payload:', JSON.stringify(payload, null, 2));
      console.log('========================================\n');
      
      const response = await createPolicy(
        ASEGO_CONFIG.partnerId,
        payload,
        ASEGO_CONFIG.encryptionKey,
        ASEGO_CONFIG.initVector
      );
      
      console.log('\n✅ Policy Created Successfully:', response);
      
      const policyData = Array.isArray(response) ? response[0] : response;
      const policyNumber = policyData?.policyNumber || 'N/A';
      const policyFilePath = policyData?.policyFilePath || '';
      
      navigate('/policy-success', {
        state: {
          policyNumber,
          policyFilePath,
          paymentDetails: paymentInfo,
          finalPremium,
          selectedPlan,
          selectedRiders,
          basePremium,
          riderTotal,
        },
      });
    } catch (error) {
      console.error('\n❌ Policy Creation Failed:', error);
      alert(`❌ Error: ${error.message || 'Failed to create policy. Please try again.'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!tripForm || !travelerDetails || !selectedPlan) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,_#ffffff_0%,_#f7faff_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#ffffff_0%,_#f7faff_100%)]">
      <Navbar />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Review & Confirm
                </h1>
                <p className="text-white/60">
                  Please verify all information before proceeding to payment.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Review Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Trip Information */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Trip Information</h2>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Destination Country</p>
                    <p className="text-white font-medium">{tripForm.destinationCountry}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Number of Travelers</p>
                    <p className="text-white font-medium">{tripForm.travelerCount || tripForm.birthDates?.length}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Start Date</p>
                    <p className="text-white font-medium">{formatDate(tripForm.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">End Date</p>
                    <p className="text-white font-medium">{formatDate(tripForm.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Trip Duration</p>
                    <p className="text-white font-medium">{tripForm.days} days</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Selected Plan */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Selected Plan</h2>
                  </div>
                  <button
                    onClick={() => navigate('/choose-plan')}
                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Insurer Name</p>
                    <p className="text-white font-medium">{selectedPlan.insurerName}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Plan Name</p>
                    <p className="text-white font-medium">{selectedPlan.planDisplayName}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Add-ons / Riders */}
              {selectedRiders && selectedRiders.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-white">Selected Add-ons</h2>
                    </div>
                    <button
                      onClick={() => navigate('/addons-selection', { state: routerState })}
                      className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedRiders.map((rider, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <div>
                          <p className="text-white font-medium">{rider.riderName}</p>
                          <p className="text-white/50 text-sm">{rider.riderDescription}</p>
                        </div>
                        <span className="text-amber-500 font-semibold">+₹{calcRiderCost(rider)?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Contact Information */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Contact Information</h2>
                  </div>
                  <button
                    onClick={() => navigate('/traveler-details', { state: routerState })}
                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{travelerDetails.contact?.email}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Mobile</p>
                    <p className="text-white font-medium">{travelerDetails.contact?.mobile}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-white/50 text-sm mb-1">Address</p>
                    <p className="text-white font-medium">
                      {travelerDetails.contact?.address}, {travelerDetails.contact?.city}, {travelerDetails.contact?.district}, {travelerDetails.contact?.state}, {travelerDetails.contact?.country} - {travelerDetails.contact?.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5: Travelers */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">Travelers</h2>
                  </div>
                  <button
                    onClick={() => navigate('/traveler-details', { state: routerState })}
                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  {travelerDetails.travelers?.map((traveler, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded">Traveler {idx + 1}</span>
                        {idx === 0 && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">Primary</span>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-white/50 text-xs mb-1">Name</p>
                          <p className="text-white font-medium">{traveler.name}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">Passport</p>
                          <p className="text-white font-medium">{traveler.passport}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">Gender</p>
                          <p className="text-white font-medium capitalize">{traveler.gender}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">Date of Birth</p>
                          <p className="text-white font-medium">{formatDate(traveler.dob)}</p>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-1">Age</p>
                          <p className="text-white font-medium">{traveler.age} years</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Nominee */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Nominee Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Name</p>
                    <p className="text-white font-medium">{travelerDetails.nominee?.name}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Relation</p>
                    <p className="text-white font-medium">{travelerDetails.nominee?.relation}</p>
                  </div>
                </div>
              </div>

              {/* Section 7: Emergency Contact */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Emergency Contact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Name</p>
                    <p className="text-white font-medium">{travelerDetails.emergency?.person}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Phone</p>
                    <p className="text-white font-medium">{travelerDetails.emergency?.number}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{travelerDetails.emergency?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Summary Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Summary</h3>

                  {/* Selected Plan */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-white/50 text-sm mb-2">Selected Plan</p>
                    <p className="text-white font-semibold">{selectedPlan.insurerName}</p>
                    <p className="text-white/70 text-sm">{selectedPlan.planDisplayName}</p>
                  </div>

                  {/* Base Premium */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Base Premium</span>
                      <span className="text-white font-semibold">₹{basePremium?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Add-ons */}
                  {selectedRiders && selectedRiders.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <p className="text-white/50 text-sm mb-3">Add-ons</p>
                      <div className="space-y-2">
                        {selectedRiders.map((rider, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-white/60">{rider.riderName}</span>
                            <span className="text-white/80 font-medium">+₹{calcRiderCost(rider)?.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                        <span className="text-white/70 font-medium">Total Add-ons</span>
                        <span className="text-white font-semibold">₹{riderTotal?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* Travelers Count */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Travelers</span>
                      <span className="text-white font-semibold">{travelerDetails?.travelers?.length || 0}</span>
                    </div>
                  </div>

                  {/* Trip Duration */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Trip Duration</span>
                      <span className="text-white font-semibold">{tripForm?.days} days</span>
                    </div>
                  </div>

                  {/* Final Premium */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl p-4 border border-amber-500/20 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-500 font-semibold">Final Premium</span>
                      <span className="text-amber-500 text-2xl font-bold">₹{finalPremium?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isAccepted}
                        onChange={(e) => setIsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-white/70 text-sm group-hover:text-white transition-colors">
                        I confirm that all information provided is accurate and complete.
                      </span>
                    </label>
                  </div>

                  {/* Payment Button */}
                  {!paymentCompleted ? (
                    <button
                      onClick={handlePayment}
                      disabled={!isAccepted || isProcessingPayment || isCreating}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        isAccepted && !isProcessingPayment && !isCreating
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {isProcessingPayment ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Processing Payment...
                        </span>
                      ) : isCreating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Creating Policy...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Proceed to Payment
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Payment Successful!</span>
                      </div>
                      <p className="text-green-500/70 text-sm mt-2">Creating your policy...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
