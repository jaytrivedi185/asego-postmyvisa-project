import { useEffect, useState, useMemo } from 'react';

// ── premium helpers ───────────────────────────────────────────────────────────
const calcAge = (dob) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};
const matchPremium = (list = [], age, tripDays) => {
  if (age == null || tripDays == null) return null;
  const row = list.find(d => age >= d.minAge && age <= d.maxAge && tripDays >= d.minDays && tripDays <= d.maxDays);
  return row ? row.total : null;
};
const calcTotalPremium = (list = []) => {
  try {
    const raw = sessionStorage.getItem('tripForm');
    if (!raw) return null;
    const { birthDates, days } = JSON.parse(raw);
    if (!birthDates?.length || !days) return null;
    let total = 0;
    for (const dob of birthDates) {
      const p = matchPremium(list, calcAge(dob), days);
      if (p == null) return null;
      total += p;
    }
    return total;
  } catch { return null; }
};

// ── small reusable pieces ─────────────────────────────────────────────────────
const SectionTitle = ({ icon, label }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h3 className="text-[rgba(0,41,98,1)] font-bold text-sm uppercase tracking-widest">{label}</h3>
    <div className="flex-1 h-px bg-[rgba(0,41,98,0.10)] ml-1" />
  </div>
);

const InfoChip = ({ label, value, gold }) => (
  <div className="flex flex-col gap-1 p-4 rounded-xl bg-[rgba(245,248,255,1)] border border-[rgba(0,41,98,0.10)]">
    <span className="text-[rgba(0,41,98,0.45)] text-[10px] uppercase tracking-widest font-semibold">{label}</span>
    <span className={`text-sm font-semibold leading-snug ${gold ? 'text-gold' : 'text-[rgba(0,41,98,0.85)]'}`}>
      {value || '—'}
    </span>
  </div>
);

const AccordionItem = ({ title, subtitle, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-colors duration-150 overflow-hidden
      ${open ? 'border-gold/40 bg-gold/[0.05]' : 'border-[rgba(0,41,98,0.10)] bg-[rgba(245,248,255,0.7)] hover:border-[rgba(0,41,98,0.20)]'}`}>
      <button
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className={`text-sm font-semibold leading-snug ${open ? 'text-gold' : 'text-[rgba(0,41,98,0.85)]'}`}>{title}</p>
          {subtitle && <p className="text-[rgba(0,41,98,0.45)] text-xs mt-0.5">{subtitle}</p>}
        </div>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-gold' : 'text-[rgba(0,41,98,0.35)]'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-[rgba(0,41,98,0.08)]">
          {children}
        </div>
      )}
    </div>
  );
};

// ── main modal ────────────────────────────────────────────────────────────────
export default function PlanModal({ plan, onClose, onBuyNow }) {
  const [activeTab, setActiveTab] = useState('overview');
  const premium = useMemo(() => calcTotalPremium(plan?.sellingPlanDetailsList), [plan]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  if (!plan) return null;

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'coverage',  label: 'Coverage',  count: plan.sellingPlanCoverageDtos?.length },
    { id: 'riders',    label: 'Riders',    count: plan.riders?.length },
    { id: 'services',  label: 'Services',  count: plan.assistantServices?.length },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,20,50,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[94vh] flex flex-col rounded-2xl overflow-hidden bg-white"
        style={{ boxShadow: '0 0 0 1px rgba(0,41,98,0.12), 0 40px 80px rgba(0,0,0,0.22)' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Modal hero header ── */}
        <div
          className="relative shrink-0 px-7 pt-7 pb-6 overflow-hidden border-b border-[rgba(0,41,98,0.10)]"
          style={{ background: 'linear-gradient(135deg, rgba(245,248,255,1) 0%, rgba(255,255,255,1) 60%)' }}
        >
          {/* Glow orb */}
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(250,199,77,0.10), transparent 70%)' }} />

          {/* Top row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {plan.planSubCategory && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                  {plan.planSubCategory}
                </span>
              )}
              {plan.planCat && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(0,41,98,0.06)] text-[rgba(0,41,98,0.55)] border border-[rgba(0,41,98,0.12)]">
                  {plan.planCat}
                </span>
              )}
              <span className="text-[rgba(0,41,98,0.45)] text-xs">{plan.geographicalAreaName}</span>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-xl bg-[rgba(0,41,98,0.05)] hover:bg-[rgba(0,41,98,0.10)] border border-[rgba(0,41,98,0.12)] flex items-center justify-center transition-all group"
            >
              <svg className="w-4 h-4 text-[rgba(0,41,98,0.45)] group-hover:text-[rgba(0,41,98,0.80)] transition-colors"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title row */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gold/15 border border-gold/25">
              <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-[rgba(0,41,98,1)] leading-tight truncate">{plan.planDisplayName}</h2>
              <p className="text-[rgba(0,41,98,0.50)] text-sm mt-0.5 truncate">{plan.insurerName}</p>
            </div>
            {premium != null && (
              <div className="shrink-0 text-right">
                <p className="text-[rgba(0,41,98,0.45)] text-[10px] uppercase tracking-widest font-semibold">Premium</p>
                <p className="text-gold text-2xl font-bold">₹{premium.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="shrink-0 flex border-b border-[rgba(0,41,98,0.10)] bg-[rgba(245,248,255,0.8)] px-7 gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors
                ${activeTab === tab.id ? 'text-gold' : 'text-[rgba(0,41,98,0.40)] hover:text-[rgba(0,41,98,0.70)]'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${activeTab === tab.id ? 'bg-gold/20 text-gold' : 'bg-[rgba(0,41,98,0.08)] text-[rgba(0,41,98,0.45)]'}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable tab content ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6 bg-white">

          {/* ── TAB: Overview ── */}
          {activeTab === 'overview' && (
            <div>
              <SectionTitle
                label="Plan Overview"
                icon={<svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <InfoChip label="Plan Name"       value={plan.planDisplayName}      gold />
                <InfoChip label="Plan Type"       value={plan.planSubCategory} />
                <InfoChip label="Category"        value={plan.planCat} />
                <InfoChip label="Full Name"       value={plan.planName} />
                <InfoChip label="Coverage Region" value={plan.geographicalAreaName} />
                <InfoChip label="Insurer"         value={plan.insurerName} />
              </div>

              {plan.specialCondition && (
                <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 flex gap-3">
                  <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-amber-600 text-[10px] uppercase tracking-widest font-semibold mb-1">Special Condition</p>
                    <p className="text-[rgba(0,41,98,0.70)] text-sm leading-relaxed">{plan.specialCondition}</p>
                  </div>
                </div>
              )}

              {premium != null && (
                <div className="mt-5 p-5 rounded-xl border border-gold/30 bg-gold/[0.07]">
                  <p className="text-[rgba(0,41,98,0.50)] text-[10px] uppercase tracking-widest font-semibold mb-1">Total Premium (All Travellers)</p>
                  <p className="text-gold text-3xl font-bold">₹{premium.toLocaleString('en-IN')}</p>
                  <p className="text-[rgba(0,41,98,0.40)] text-xs mt-1">Inclusive of taxes</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Coverage Benefits ── */}
          {activeTab === 'coverage' && (
            <div>
              <SectionTitle
                label="Coverage Benefits"
                icon={<svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>}
              />
              {!plan.sellingPlanCoverageDtos?.length ? (
                <EmptySection message="Coverage details not available" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {plan.sellingPlanCoverageDtos.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-[rgba(0,41,98,0.10)] bg-[rgba(245,248,255,0.8)] hover:border-[rgba(0,41,98,0.20)] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-[rgba(0,41,98,0.85)] text-sm font-semibold truncate">{c.coverageName || c.name}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {c.maxAmount != null && (
                          <p className="text-gold font-bold text-sm">
                            Up to ₹{Number(c.maxAmount).toLocaleString('en-IN')}
                          </p>
                        )}
                        {c.minAmount != null && c.minAmount !== c.maxAmount && (
                          <p className="text-[rgba(0,41,98,0.40)] text-xs">Min ₹{Number(c.minAmount).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Riders ── */}
          {activeTab === 'riders' && (
            <div>
              <SectionTitle
                label="Optional Riders"
                icon={<svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>}
              />
              {!plan.riders?.length ? (
                <EmptySection message="No optional riders available for this plan" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {plan.riders.map((r, i) => (
                    <AccordionItem key={i} title={r.riderName} subtitle="Optional add-on">
                      <p className="text-[rgba(0,41,98,0.60)] text-sm leading-relaxed pt-3">
                        {r.description || 'No description available.'}
                      </p>
                    </AccordionItem>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Assistance Services ── */}
          {activeTab === 'services' && (
            <div>
              <SectionTitle
                label="Assistance Services"
                icon={<svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>}
              />
              {!plan.assistantServices?.length ? (
                <EmptySection message="No assistance services listed for this plan" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {plan.assistantServices.map((s, i) => (
                    <AccordionItem key={i} title={s.serviceName || s.name} subtitle="Included service">
                      <p className="text-[rgba(0,41,98,0.60)] text-sm leading-relaxed pt-3">
                        {s.description || 'No description available.'}
                      </p>
                    </AccordionItem>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-7 py-4 border-t border-[rgba(0,41,98,0.10)] flex items-center justify-between gap-4 bg-[rgba(245,248,255,1)]">
          <p className="text-[rgba(0,41,98,0.35)] text-xs hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[rgba(0,41,98,0.08)] text-[rgba(0,41,98,0.45)] text-[10px] font-mono">Esc</kbd> to close
          </p>
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[rgba(0,41,98,0.16)] text-[rgba(0,41,98,0.60)] text-sm font-semibold hover:border-[rgba(0,41,98,0.30)] hover:text-[rgba(0,41,98,0.85)] transition-all bg-white">
              Close
            </button>
            <button onClick={() => { onClose(); onBuyNow(plan); }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-navy text-sm font-bold hover:bg-gold-hover transition-all">
              Buy Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EmptySection = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-14 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-[rgba(0,41,98,0.04)] border border-[rgba(0,41,98,0.10)] flex items-center justify-center">
      <svg className="w-6 h-6 text-[rgba(0,41,98,0.20)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p className="text-[rgba(0,41,98,0.35)] text-sm text-center">{message}</p>
  </div>
);
