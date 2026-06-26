/**
 * Passport validation utilities
 */
export const validatePassport = (passport) => {
  if (!passport) return false;
  const cleaned = passport.trim().toUpperCase();
  // Indian passport format: Letter followed by 7 digits (e.g., A1234567)
  const pattern = /^[A-Z][0-9]{7}$/;
  return pattern.test(cleaned);
};

export const getPassportError = (passport) => {
  if (!passport || !passport.trim()) {
    return 'Passport number is required';
  }
  if (!validatePassport(passport)) {
    return 'Invalid format (e.g., A1234567)';
  }
  return '';
};

/**
 * Build Create Policy Payload
 * Format matches API requirements for policy creation
 * ALWAYS returns an ARRAY with ONE object (primary traveler only)
 * Premium is divided by number of travelers since we only send primary traveler
 * Other travelers are kept in frontend but not sent to API
 * 
 * @returns {Array} - Create policy payload array with single object
 */
export const buildCreatePolicyPayload = ({
  selectedPlan,
  selectedRiders,
  tripForm,
  travelerDetails,
  finalPremium,
  riderTotal,
  basePremium,
  config,
  selectedCategory,
}) => {
  const orderId = `ORD-${Date.now()}`;

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  if (!travelerDetails.travelers || travelerDetails.travelers.length === 0) {
    throw new Error('At least one traveler is required');
  }

  // ALWAYS use only the PRIMARY (first) traveler
  const primaryTraveler = travelerDetails.travelers[0];
  const primaryAge = primaryTraveler.age || calculateAge(primaryTraveler.dob);
  
  // CRITICAL: Divide premium by number of travelers
  // Because frontend calculates for all travelers, but we only send 1
  const travelerCount = travelerDetails.travelers.length;
  const singleTravelerBasePremium = Math.round(basePremium / travelerCount);
  const singleTravelerRiderTotal = Math.round(riderTotal / travelerCount);

  const ridersFirstPass = selectedRiders.map((rider) => {
    const riderPercent = Number(rider.riderDetailsList?.[0]?.landingPer || 0);
    const riderAmount = Math.round((singleTravelerBasePremium * riderPercent) / 100);
    
    return {
      percent: riderPercent,
      riderName: rider.riderName,
      rateType: rider.rateType || rider.riderDetailsList?.[0]?.rateType || '8335a3fc-f9d3-40a7-80f7-e3151897e0c0',
      riderAmount: riderAmount,
    };
  });
  
  const calculatedTotal = ridersFirstPass.reduce((sum, r) => sum + r.riderAmount, 0);
  const diff = singleTravelerRiderTotal - calculatedTotal;
  
  const riders = ridersFirstPass.map((r, idx) => ({
    ...r,
    riderAmount: String(idx === 0 ? r.riderAmount + diff : r.riderAmount)
  }));

  const agePremiums = {
    age: String(primaryAge),
    premium: String(singleTravelerBasePremium),
  };

  const traveler = {
    name: primaryTraveler.name || '',
    passport: primaryTraveler.passport || '',
    dob: primaryTraveler.dob || '',
    address: travelerDetails.contact?.address || '',
    mobileNo: travelerDetails.contact?.mobile || '',
    email: travelerDetails.contact?.email || '',
    city: travelerDetails.contact?.city || '',
    district: travelerDetails.contact?.district || '',
    state: travelerDetails.contact?.state || '',
    pincode: travelerDetails.contact?.pincode || '',
    country: travelerDetails.contact?.country || 'India',
    preExistingMedicalCondition: travelerDetails.medical?.preExisting === 'yes' ? 'Yes' : 'No',
    finalPremium: String(singleTravelerBasePremium),
    riderTotalAmt: String(singleTravelerRiderTotal),
    age: String(primaryAge),
    gender: primaryTraveler.gender || '',
    nominee: travelerDetails.nominee?.name || '',
    relation: travelerDetails.nominee?.relation || '',
    pastillness: travelerDetails.medical?.pastIllness || '',
    remarks: travelerDetails.additional?.remarks || '',
    crReferenceNumber: '',
    emergencyContactPerson: travelerDetails.emergency?.person || '',
    emergencyContactNumber: travelerDetails.emergency?.number || '',
    emergencyEmailId: travelerDetails.emergency?.email || '',
    gstNumber: travelerDetails.additional?.gstNumber || '',
    pnrNumber: travelerDetails.additional?.pnrNumber || '',
    gstState: travelerDetails.additional?.gstState || '',
    univercityAddress: '',
    univercityName: '',
    flightNumber: travelerDetails.additional?.flightNumber || '',
    departureTime: '',
    arrivalTime: '',
    departureAirportCode: '',
    arrivalAirportCode: '',
  };

  // Return ARRAY with single object (primary traveler only)
  const payload = [{
    identity: {
      orderId: orderId,
      sign: config.sign,
      branchSign: config.branchSign,
      branchName: config.branchName,
      reference: config.reference,
      partnerId: config.partnerId,
    },
    selectedPlan: {
      insurerId: selectedPlan.insurerId,
      totalPremium: String(singleTravelerBasePremium + singleTravelerRiderTotal),
      plan: {
        sellingPlanId: selectedPlan.planId,
        agePremiums: agePremiums,
        riders: riders,
      },
    },
    quotation: {
      tripType: 'Single Trip',
      travelCategory: selectedPlan.geographicalArea || '296a9c2f-3071-4395-a416-31d60fdf0d4d',
      startDate: tripForm.startDate,
      duration: String(tripForm.days || 0),
      endDate: tripForm.endDate,
      destination: tripForm.destinationCountry,
    },
    traveler: traveler,
    otherDetails: {
      policyComment: travelerDetails.additional?.remarks || '',
      universityName: '',
      universityAddress: '',
    },
  }];

  console.log('\n========== CREATE POLICY PAYLOAD ==========');
  console.log('Total travelers in frontend:', travelerCount);
  console.log('Travelers sent to API: 1 (Primary only)');
  console.log('Primary traveler:', primaryTraveler.name);
  console.log('');
  console.log('PREMIUM CALCULATION:');
  console.log(`  Original basePremium (all travelers): ₹${basePremium}`);
  console.log(`  Original riderTotal (all travelers): ₹${riderTotal}`);
  console.log(`  Divided by travelers: ${travelerCount}`);
  console.log(`  Single traveler basePremium: ₹${singleTravelerBasePremium}`);
  console.log(`  Single traveler riderTotal: ₹${singleTravelerRiderTotal}`);
  console.log(`  Total premium sent: ₹${singleTravelerBasePremium + singleTravelerRiderTotal}`);
  console.log('===========================================\n');

  return payload;
};

/**
 * Build Endorse Policy Payload
 * Format matches API requirements for policy endorsement
 * 
 * @returns {Object} - Endorse policy payload object
 */
export const buildEndorsePolicyPayload = ({
  selectedPlan,
  selectedRiders,
  tripForm,
  travelerDetails,
  finalPremium,
  riderTotal,
  basePremium,
  config,
  endorsePolicyNumber,
  endorsementReason,
  remark,
  extendAmount,
}) => {
  // Generate unique order ID
  const orderId = `ORD-${Date.now()}`;

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  // Validate travelers
  if (!travelerDetails.travelers || travelerDetails.travelers.length === 0) {
    throw new Error('At least one traveler is required');
  }

  // Use primary (first) traveler
  const primaryTraveler = travelerDetails.travelers[0];
  const primaryAge = primaryTraveler.age || calculateAge(primaryTraveler.dob);

  // Calculate rider amount
  const calculateRiderAmount = (rider) => {
    if (!basePremium) return 0;
    const landingPer = parseFloat(rider.riderDetailsList?.[0]?.landingPer ?? 0);
    return Math.round((basePremium * landingPer) / 100);
  };

  // Build riders array - Use ORIGINAL rider amounts from the policy
  // Calculate based on ORIGINAL basePremium, but then adjust to match exact riderTotal
  const totalPercent = selectedRiders.reduce((sum, r) => sum + Number(r.riderDetailsList?.[0]?.landingPer || 0), 0);
  
  // First pass: calculate proportional amounts
  const ridersFirstPass = selectedRiders.map((rider) => {
    const riderPercent = Number(rider.riderDetailsList?.[0]?.landingPer || 0);
    const riderAmount = Math.round((basePremium * riderPercent) / 100);
    
    return {
      percent: riderPercent,
      riderName: rider.riderName,
      rateType: rider.rateType || rider.riderDetailsList?.[0]?.rateType || '8335a3fc-f9d3-40a7-80f7-e3151897e0c0',
      riderAmount: riderAmount,
    };
  });
  
  // Check if calculated total matches the original riderTotal
  const calculatedTotal = ridersFirstPass.reduce((sum, r) => sum + r.riderAmount, 0);
  const diff = Number(riderTotal) - calculatedTotal;
  
  console.log(`[Payload Builder] Rider calculation:`);
  console.log(`  - Calculated total: ${calculatedTotal}`);
  console.log(`  - Expected total (from policy): ${riderTotal}`);
  console.log(`  - Difference: ${diff}`);
  
  // If there's a difference due to rounding, adjust the first rider
  const riders = ridersFirstPass.map((r, idx) => ({
    ...r,
    riderAmount: String(idx === 0 ? r.riderAmount + diff : r.riderAmount)
  }));
  
  // Final verification
  const finalTotal = riders.reduce((sum, r) => sum + Number(r.riderAmount), 0);
  console.log(`  - Adjusted total: ${finalTotal} ${finalTotal === Number(riderTotal) ? '✅' : '❌'}`);
  console.log(``);

  // Build agePremiums object - Use STRINGS to match create policy format
  const agePremiums = {
    age: String(primaryAge),
    premium: String(basePremium || 0),
  };

  // Build traveler object - Use STRINGS for amounts to match create policy format
  const traveler = {
    name: primaryTraveler.name || '',
    passport: primaryTraveler.passport || '',
    dob: primaryTraveler.dob || '',
    address: travelerDetails.contact?.address || '',
    mobileNo: travelerDetails.contact?.mobile || '',
    email: travelerDetails.contact?.email || '',
    city: travelerDetails.contact?.city || '',
    district: travelerDetails.contact?.district || '',
    state: travelerDetails.contact?.state || '',
    pincode: travelerDetails.contact?.pincode || '',
    country: travelerDetails.contact?.country || 'India',
    preExistingMedicalCondition: travelerDetails.medical?.preExisting === 'yes' ? 'Yes' : 'No',
    finalPremium: String(basePremium || 0), // STRING
    riderTotalAmt: String(riderTotal || 0), // STRING
    age: String(primaryAge), // STRING
    gender: primaryTraveler.gender || '',
    nominee: travelerDetails.nominee?.name || '',
    relation: travelerDetails.nominee?.relation || '',
    pastillness: travelerDetails.medical?.pastIllness || '',
    remarks: travelerDetails.additional?.remarks || '',
    crReferenceNumber: '',
    emergencyContactPerson: travelerDetails.emergency?.person || '',
    emergencyContactNumber: travelerDetails.emergency?.number || '',
    emergencyEmailId: travelerDetails.emergency?.email || '',
    gstNumber: travelerDetails.additional?.gstNumber || '',
    pnrNumber: travelerDetails.additional?.pnrNumber || '',
    gstState: travelerDetails.additional?.gstState || '',
    univercityAddress: '',
    univercityName: '',
    flightNumber: travelerDetails.additional?.flightNumber || '',
    departureTime: '',
    arrivalTime: '',
    departureAirportCode: '',
    arrivalAirportCode: '',
  };

  // Build endorse payload object (NOT an array)
  const payload = {
    identity: {
      orderId: orderId,
      sign: config.sign,
      branchSign: config.branchSign,
      branchName: config.branchName,
      reference: config.reference,
      partnerId: config.partnerId,
    },
    selectedPlan: {
      insurerId: selectedPlan.insurerId,
      totalPremium: String(Number(basePremium || 0) + Number(riderTotal || 0)), // STRING
      plan: {
        sellingPlanId: selectedPlan.planId,
        agePremiums: agePremiums,
        riders: riders,
      },
    },
    quotation: {
      tripType: 'Single Trip', // Default to Single Trip
      travelCategory: selectedPlan.geographicalArea || '296a9c2f-3071-4395-a416-31d60fdf0d4d',
      startDate: tripForm.startDate,
      duration: String(tripForm.days || 0), // STRING
      endDate: tripForm.endDate,
      destination: tripForm.destinationCountry,
    },
    traveler: traveler,
    otherDetails: {
      policyComment: travelerDetails.additional?.remarks || '',
      universityName: '',
      universityAddress: '',
    },
    endorsementReason: Array.isArray(endorsementReason) ? endorsementReason : [endorsementReason || ''],
    remark: remark || '',
    endorsePolicyNumber: endorsePolicyNumber || '',
    extendAmount: extendAmount || 0,
  };

  console.log('\n========== ENDORSE PAYLOAD VALIDATION ==========');
  console.log('Policy Number:', endorsePolicyNumber);
  console.log('Endorsement Reason:', endorsementReason);
  console.log('Extend Amount:', extendAmount);
  console.log('');
  console.log('INPUT VALUES:');
  console.log('  basePremium (input):', basePremium, typeof basePremium);
  console.log('  riderTotal (input):', riderTotal, typeof riderTotal);
  console.log('  finalPremium (input):', finalPremium, typeof finalPremium);
  console.log('');
  console.log('CALCULATED RIDERS:');
  riders.forEach((r, i) => {
    console.log(`  Rider ${i + 1}: ${r.riderName}`);
    console.log(`    Percent: ${r.percent}%`);
    console.log(`    Amount: ${r.riderAmount} (${typeof r.riderAmount})`);
  });
  const ridersSum = riders.reduce((sum, r) => sum + Number(r.riderAmount), 0);
  console.log('');
  console.log('VALIDATION:');
  console.log(`  Sum of rider amounts: ${ridersSum}`);
  console.log(`  riderTotalAmt (sent in traveler): ${traveler.riderTotalAmt}`);
  console.log(`  riderTotal (original input): ${riderTotal}`);
  console.log(`  Rider amounts match: ${ridersSum === Number(traveler.riderTotalAmt) ? '✅' : '❌'}`);
  console.log('');
  console.log(`  totalPremium (sent in selectedPlan): ${payload.selectedPlan.totalPremium}`);
  console.log(`  Base + Riders: ${Number(basePremium) + ridersSum}`);
  const totalMatches = Number(payload.selectedPlan.totalPremium) === (Number(basePremium) + ridersSum);
  console.log(`  Total matches: ${totalMatches ? '✅' : '❌'}`);
  console.log('================================================\n');

  return payload;
};
