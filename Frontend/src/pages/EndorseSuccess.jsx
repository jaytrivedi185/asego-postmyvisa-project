import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const EndorseSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    originalPolicyNumber = 'N/A',
    endorsedPolicyNumber = 'N/A',
    endorsementReason = [],
    extendAmount = 0,
  } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center animate-bounce">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Endorsement Submitted Successfully!
            </h1>
            <p className="text-white/60 text-lg">
              Your policy endorsement request has been received and is being processed.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Endorsement Details
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/60">Original Policy Number</span>
                <span className="text-white font-semibold">{originalPolicyNumber}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/60">Endorsed Policy Number</span>
                <span className="text-amber-500 font-semibold">{endorsedPolicyNumber}</span>
              </div>

              {endorsementReason.length > 0 && (
                <div className="py-3 border-b border-white/10">
                  <p className="text-white/60 mb-2">Reasons for Endorsement</p>
                  <div className="space-y-2">
                    {endorsementReason.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extendAmount > 0 && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-white/60">Additional Premium</span>
                  <span className="text-amber-500 font-semibold text-lg">₹{extendAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-400 font-medium text-sm mb-1">What's Next?</p>
                <ul className="text-blue-300/70 text-sm space-y-1">
                  <li>• Your endorsement will be reviewed within 24-48 hours</li>
                  <li>• You'll receive an email confirmation once processed</li>
                  <li>• Updated policy documents will be sent to your registered email</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('/endorse-policy')}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold transition-all shadow-lg shadow-amber-500/25"
            >
              Endorse Another Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndorseSuccess;
