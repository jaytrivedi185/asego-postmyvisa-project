import { useLocation, useNavigate } from 'react-router-dom';

export default function PolicySuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    policyNumber, 
    policyFilePath, 
    paymentDetails, 
    finalPremium,
    selectedPlan,
    selectedRiders = [],
    basePremium,
    riderTotal
  } = location.state || {};

  if (!policyNumber) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm">No policy information found.</p>
          <button onClick={() => navigate('/')} className="text-gold text-sm underline underline-offset-2">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-light">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/Postmyvisa-LOGO-PNG-scaled.png" 
              alt="Postmyvisa Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(250,199,77,0.08), transparent 70%)' }} />

            <div className="relative p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold/15 border border-gold/30 mb-6">
                <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Success Message */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Policy Created Successfully!
              </h1>
              <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
                Your travel insurance policy has been created and is ready for download.
              </p>

              {/* Policy Number */}
              <div className="rounded-xl bg-white/[0.05] border border-white/10 px-6 py-4 mb-8 inline-block">
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-1">Policy Number</p>
                <p className="text-gold text-2xl font-bold tracking-wide">{policyNumber}</p>
              </div>

              {/* Payment Details */}
              {paymentDetails && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-6 py-4 mb-8 max-w-md mx-auto">
                  <div className="flex items-center gap-2 mb-3 justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-500 font-semibold">Payment Successful</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {finalPremium && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount Paid:</span>
                        <span className="text-white font-semibold">₹{finalPremium.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/60">Payment ID:</span>
                      <span className="text-white font-mono text-xs">{paymentDetails.mihpayId || paymentDetails.txnId}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {policyFilePath && (
                  <button
                    onClick={() => window.open(policyFilePath, '_blank')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gold text-navy font-bold text-base transition-all hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Policy
                  </button>
                )}

                <button
                  onClick={() => {
                    // Get all necessary data for endorsement
                    const tripForm = JSON.parse(sessionStorage.getItem('tripForm') || '{}');
                    const travelerDetails = JSON.parse(sessionStorage.getItem('travelerDetails') || '{}');
                    
                    navigate('/endorse-policy', { 
                      state: { 
                        policyNumber,
                        tripForm,
                        travelerDetails,
                        selectedPlan,
                        selectedRiders,
                        basePremium,
                        riderTotal,
                        finalPremium
                      } 
                    });
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gold/10 border border-gold/20 text-gold font-semibold text-base transition-all hover:bg-gold/20 hover:border-gold/40 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Endorse Policy
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white/[0.05] border border-white/10 text-white font-semibold text-base transition-all hover:bg-white/[0.08] hover:border-gold/40 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/40 text-sm">
                  A confirmation email has been sent to your registered email address.
                </p>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base mb-1">Need Help?</h3>
                <p className="text-white/60 text-sm">
                  If you have any questions about your policy or need assistance, please contact our customer support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
