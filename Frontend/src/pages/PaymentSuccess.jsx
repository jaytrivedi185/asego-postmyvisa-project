import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPolicy } from '../services/policyApi';
import { buildCreatePolicyPayload } from '../utils/buildEndorsePolicyPayload';
import { ASEGO_CONFIG } from '../config/asego';
import Navbar from '../components/Navbar';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('creating'); // 'creating' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // PayU POSTs to backend /payu/success which redirects here as GET with query params
    const params = new URLSearchParams(window.location.search);

    const payuStatus = params.get('status') || 'success';
    const txnId     = params.get('txnid')    || sessionStorage.getItem('payuTxnId') || '';
    const mihpayid  = params.get('mihpayid') || '';
    const mode      = params.get('mode')     || '';

    // If PayU flagged as failure despite landing on surl (edge case), redirect
    if (payuStatus === 'failure' || payuStatus === 'pending') {
      navigate('/payment-failure', { replace: true });
      return;
    }

    const paymentInfo = {
      txnId,
      mihpayId: mihpayid,
      mode,
      status:   payuStatus,
      gateway:  'PayU',
    };

    sessionStorage.removeItem('payuPending');
    createPolicyAfterPayment(paymentInfo);
  }, []);

  const createPolicyAfterPayment = async (paymentInfo) => {
    try {
      const selectedPlan     = JSON.parse(sessionStorage.getItem('selectedPlan')    || 'null');
      const selectedRiders   = JSON.parse(sessionStorage.getItem('selectedRiders')  || '[]');
      const tripForm         = JSON.parse(sessionStorage.getItem('tripForm')        || '{}');
      const travelerDetails  = JSON.parse(sessionStorage.getItem('travelerDetails') || '{}');
      const premiumData      = JSON.parse(sessionStorage.getItem('premiumData')     || '{}');
      const selectedCategory = JSON.parse(sessionStorage.getItem('selectedCategory')|| 'null');

      const { finalPremium, basePremium, riderTotal } = premiumData;

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

      const response = await createPolicy(
        ASEGO_CONFIG.partnerId,
        payload,
        ASEGO_CONFIG.encryptionKey,
        ASEGO_CONFIG.initVector
      );

      const policyData     = Array.isArray(response) ? response[0] : response;
      const policyNumber   = policyData?.policyNumber   || 'N/A';
      const policyFilePath = policyData?.policyFilePath || '';

      // Clean up payment session keys
      sessionStorage.removeItem('payuTxnId');

      setStatus('done');

      navigate('/policy-success', {
        replace: true,
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
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Policy creation failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-5 max-w-sm w-full">
          {status === 'creating' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                <div className="animate-spin w-7 h-7 border-2 border-gold border-t-transparent rounded-full" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Payment Successful!</p>
                <p className="text-white/50 text-sm mt-1">Creating your policy, please wait…</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">Policy Creation Failed</p>
                <p className="text-white/50 text-sm mt-1">
                  Your payment was successful but policy creation failed. Please contact support with your transaction ID.
                </p>
                <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 rounded-xl bg-gold text-navy font-bold text-sm"
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
