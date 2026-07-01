import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PaymentFailure() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const txnId   = params.get('txnid')  || sessionStorage.getItem('payuTxnId') || '—';
  const reason  = params.get('field9') || params.get('error_Message') || 'Payment was not completed.';

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-5 max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div>
            <p className="text-white font-bold text-xl">Payment Failed</p>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">{reason}</p>
            {txnId !== '—' && (
              <p className="text-white/30 text-xs mt-3">
                Transaction ID: <span className="text-white/55 font-mono">{txnId}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-yellow-300 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl border border-white/15 text-white/65 text-sm font-semibold hover:border-white/30 transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
