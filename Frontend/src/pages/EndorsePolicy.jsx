import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { endorsePolicy } from '../services/policyApi';
import { buildEndorsePolicyPayload } from '../utils/buildEndorsePolicyPayload';
import { ASEGO_CONFIG, ASEGO_API_BASE_URL } from '../config/asego';
import axios from 'axios';

const EndorsePolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const preFillData = location.state || {};
  
  const [step, setStep] = useState(preFillData.policyNumber ? 2 : 1);
  const [policyNumber, setPolicyNumber] = useState(preFillData.policyNumber || '');
  
  // Editable data
  const [startDate, setStartDate] = useState(preFillData.tripForm?.startDate || '');
  const [endDate, setEndDate] = useState(preFillData.tripForm?.endDate || '');
  const [destination, setDestination] = useState(preFillData.tripForm?.destinationCountry || '');
  const [selectedRiders, setSelectedRiders] = useState(preFillData.selectedRiders || []);
  const [availableRiders] = useState(preFillData.selectedPlan?.riders || []);
  
  // Contact info
  const [email, setEmail] = useState(preFillData.travelerDetails?.contact?.email || '');
  const [mobile, setMobile] = useState(preFillData.travelerDetails?.contact?.mobile || '');
  
  // Endorsement details
  const [endorsementReason, setEndorsementReason] = useState([]);
  const [remark, setRemark] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const reasonOptions = [
    'Extension of Trip Duration',
    'Change in Destination',
    'Addition of Coverage',
    'Update Personal Details',
    'Increase Sum Insured',
    'Other',
  ];

  const handleReasonToggle = (reason) => {
    setEndorsementReason(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleRiderToggle = (rider) => {
    setSelectedRiders(prev => {
      const exists = prev.some(r => r.riderId === rider.riderId);
      return exists 
        ? prev.filter(r => r.riderId !== rider.riderId)
        : [...prev, rider];
    });
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!policyNumber.trim()) {
        setErrors({ policyNumber: 'Policy number is required' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleEndorse = async () => {
    if (endorsementReason.length === 0) {
      setErrors({ endorsementReason: 'Select at least one reason' });
      return;
    }
    if (!remark.trim()) {
      setErrors({ remark: 'Remark is required' });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Update tripForm with new dates
      const updatedTripForm = {
        ...preFillData.tripForm,
        startDate,
        endDate,
        days: calculateDays(),
        destinationCountry: destination,
      };

      // USE EXACT ORIGINAL POLICY DATA - NO CHANGES FOR TESTING
      // This will help us understand if the API accepts endorsement at all
      const basePremium = preFillData.basePremium || 10000;
      const riderTotal = preFillData.riderTotal || 0;
      const finalPremium = preFillData.finalPremium || (basePremium + riderTotal);
      
      // For now, set extendAmount to 0 to test if API accepts the request
      const extendAmount = 0;
      
      console.log('🧪 Testing Endorsement with ORIGINAL data:');
      console.log('  Base Premium (ORIGINAL):', basePremium);
      console.log('  Rider Total (ORIGINAL):', riderTotal);
      console.log('  Final Premium (ORIGINAL):', finalPremium);
      console.log('  Riders to send:', selectedRiders.length);
      console.log('  Extend Amount:', extendAmount);
      console.log('\n⚠️  NOTE: Using ORIGINAL policy data to test API acceptance');

      const payload = buildEndorsePolicyPayload({
        selectedPlan: preFillData.selectedPlan,
        selectedRiders,
        tripForm: updatedTripForm,
        travelerDetails: preFillData.travelerDetails,
        finalPremium,
        riderTotal,
        basePremium,
        config: ASEGO_CONFIG,
        endorsePolicyNumber: policyNumber,
        endorsementReason,
        remark,
        extendAmount,
      });

      console.log('📦 Endorsement Payload:', JSON.stringify(payload, null, 2));

      const response = await endorsePolicy(
        ASEGO_CONFIG.partnerId,
        payload,
        ASEGO_CONFIG.encryptionKey,
        ASEGO_CONFIG.initVector
      );

      console.log('✅ Policy Endorsed Successfully:', response);

      navigate('/endorse-success', {
        state: {
          originalPolicyNumber: policyNumber,
          endorsedPolicyNumber: response?.policyNumber || policyNumber,
          endorsementReason,
          extendAmount,
        },
      });

    } catch (error) {
      console.error('❌ Endorsement Failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
              className="flex items-center gap-2 text-white/60 hover:text-amber-500 transition-colors mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {step === 1 ? 'Back to Home' : 'Previous Step'}
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Endorse Policy
            </h1>
            <p className="text-white/60">
              Step {step} of 3: {step === 1 ? 'Policy Number' : step === 2 ? 'Edit Details' : 'Review & Submit'}
            </p>
          </div>

          {/* Step 1: Policy Number */}
          {step === 1 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Enter Policy Number</h2>
              <div className="mb-6">
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Policy Number <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="Enter your policy number"
                  className={`w-full bg-white/5 border ${errors.policyNumber ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500 transition-colors`}
                />
                {errors.policyNumber && (
                  <p className="text-red-400 text-sm mt-1">{errors.policyNumber}</p>
                )}
              </div>
              <button
                onClick={handleContinue}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-lg transition-all shadow-lg shadow-amber-500/25"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Edit Policy Details */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Trip Dates */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Trip Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white/70 text-sm font-medium mb-2">Destination</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  {startDate && endDate && (
                    <div className="md:col-span-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-amber-400 text-sm">
                        <span className="font-semibold">Trip Duration:</span> {calculateDays()} days
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add-ons */}
              {availableRiders.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Add-ons / Riders</h2>
                  <div className="space-y-3">
                    {availableRiders.map((rider) => (
                      <button
                        key={rider.riderId}
                        type="button"
                        onClick={() => handleRiderToggle(rider)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          selectedRiders.some(r => r.riderId === rider.riderId)
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedRiders.some(r => r.riderId === rider.riderId) ? 'border-amber-500' : 'border-white/30'
                          }`}>
                            {selectedRiders.some(r => r.riderId === rider.riderId) && (
                              <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{rider.riderName}</p>
                            <p className="text-xs opacity-60">{rider.riderDescription}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Mobile</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-lg transition-all shadow-lg shadow-amber-500/25"
              >
                Review Changes
              </button>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Changes Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/50 text-sm">Policy Number</p>
                    <p className="text-white font-semibold">{policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Trip Duration</p>
                    <p className="text-white font-semibold">{startDate} to {endDate} ({calculateDays()} days)</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">Destination</p>
                    <p className="text-white font-semibold">{destination}</p>
                  </div>
                  {selectedRiders.length > 0 && (
                    <div>
                      <p className="text-white/50 text-sm mb-2">Selected Add-ons</p>
                      {selectedRiders.map((rider, idx) => (
                        <p key={idx} className="text-white text-sm">• {rider.riderName}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Endorsement Reason */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Endorsement Details</h2>
                <div className="mb-6">
                  <label className="block text-white/70 text-sm font-medium mb-3">
                    Reason for Endorsement <span className="text-amber-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reasonOptions.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => handleReasonToggle(reason)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          endorsementReason.includes(reason)
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-amber-500/50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          endorsementReason.includes(reason) ? 'border-amber-500' : 'border-white/30'
                        }`}>
                          {endorsementReason.includes(reason) && (
                            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">{reason}</span>
                      </button>
                    ))}
                  </div>
                  {errors.endorsementReason && (
                    <p className="text-red-400 text-sm mt-2">{errors.endorsementReason}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Additional Remarks <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Provide details about the changes..."
                    rows={4}
                    className={`w-full bg-white/5 border ${errors.remark ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-amber-500 transition-colors resize-none`}
                  />
                  {errors.remark && (
                    <p className="text-red-400 text-sm mt-1">{errors.remark}</p>
                  )}
                </div>

                <button
                  onClick={handleEndorse}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isProcessing
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Processing Endorsement...
                    </span>
                  ) : (
                    'Submit Endorsement Request'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndorsePolicy;
