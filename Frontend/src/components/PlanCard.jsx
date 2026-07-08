import { useMemo } from 'react';

const calcAge = (dob) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

const matchPremium = (detailsList = [], age, tripDays) => {
  if (age == null || tripDays == null) return null;
  const row = detailsList.find(
    (d) => age >= d.minAge && age <= d.maxAge && tripDays >= d.minDays && tripDays <= d.maxDays
  );
  return row ? row.total : null;
};

const calcTotalPremium = (detailsList = []) => {
  try {
    const raw = sessionStorage.getItem('tripForm');
    if (!raw) return null;
    const { birthDates, days } = JSON.parse(raw);
    if (!birthDates?.length || !days) return null;
    let total = 0;
    for (const dob of birthDates) {
      const age = calcAge(dob);
      const p = matchPremium(detailsList, age, days);
      if (p == null) return null;
      total += p;
    }
    return total;
  } catch {
    return null;
  }
};

const ShieldIcon = () => (
  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function PlanCard({ plan, isSelected, onViewDetails, onBuyNow }) {
  const premium = useMemo(() => calcTotalPremium(plan.sellingPlanDetailsList), [plan]);

  // pick up to 3 top coverage names for the highlights strip
  const highlights = useMemo(() =>
    (plan.sellingPlanCoverageDtos || []).slice(0, 3).map(c => c.coverageName || c.name).filter(Boolean),
  [plan]);

  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-250 group
        ${isSelected
          ? 'border-2 border-gold shadow-xl shadow-gold/10'
          : 'border border-[rgba(0,41,98,0.13)] hover:border-[rgba(0,41,98,0.28)] hover:shadow-xl hover:shadow-[rgba(0,41,98,0.09)] hover:-translate-y-1'}`}
      style={{ background: isSelected ? 'linear-gradient(160deg,#fffdf5 0%,#ffffff 60%)' : 'white' }}
    >

      {/* ── Gradient top bar ── */}
      <div className={`h-1 w-full transition-all duration-300
        ${isSelected
          ? 'bg-gradient-to-r from-gold via-amber-300 to-gold'
          : 'bg-gradient-to-r from-[rgba(0,41,98,0.15)] via-gold/30 to-[rgba(0,41,98,0.08)] group-hover:from-gold/60 group-hover:via-amber-300/70 group-hover:to-gold/40'}`}
      />

      {/* ── Card header band ── */}
      <div className={`px-5 pt-5 pb-4 border-b transition-colors duration-200
        ${isSelected ? 'bg-gradient-to-r from-gold/[0.07] to-transparent border-gold/20' : 'border-[rgba(0,41,98,0.07)]'}`}>

        <div className="flex items-start justify-between gap-3">
          {/* Insurer identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-200
              ${isSelected ? 'bg-gold/20 border-gold/30' : 'bg-[rgba(0,41,98,0.05)] border-[rgba(0,41,98,0.10)] group-hover:bg-gold/10 group-hover:border-gold/20'}`}>
              <ShieldIcon />
            </div>
            <div className="min-w-0">
              <p className="text-[rgba(0,41,98,0.70)] text-[10px] uppercase tracking-[0.14em] font-semibold">Insurer</p>
              <p className="text-[rgba(0,41,98,1)] text-sm font-bold leading-tight mt-0.5 truncate">
                {plan.insurerName}
              </p>
            </div>
          </div>

          {/* Plan type badge */}
          {plan.planSubCategory && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
              ${isSelected ? 'bg-gold text-navy border-gold' : 'bg-gold/10 text-gold border-gold/25'}`}>
              {plan.planSubCategory}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5">

        {/* Plan name */}
        <h3 className={`text-base font-bold leading-snug mb-0.5 ${isSelected ? 'text-gold' : 'text-[rgba(0,41,98,1)]'}`}>
          {plan.planDisplayName}
        </h3>
        <p className="text-[rgba(0,41,98,0.75)] text-xs mb-3 leading-snug truncate">{plan.planName}</p>

        {/* Region tag */}
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 self-start mb-4 border text-[11px] font-medium
          ${isSelected ? 'bg-gold/10 border-gold/25 text-gold' : 'bg-[rgba(0,41,98,0.06)] border-[rgba(0,41,98,0.18)] text-[rgba(0,41,98,0.80)]'}`}>
          <GlobeIcon />
          <span className="truncate max-w-[170px]">{plan.geographicalAreaName}</span>
        </div>

        {/* Coverage highlights */}
        {highlights.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-4">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0
                  ${isSelected ? 'bg-gold/20' : 'bg-[rgba(0,41,98,0.06)]'}`}>
                  <CheckIcon />
                </span>
                <span className="text-[rgba(0,41,98,0.80)] text-xs truncate font-medium">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Premium block */}
        <div className={`rounded-xl px-4 py-3.5 mb-5 border transition-colors duration-200
          ${isSelected
            ? 'bg-gradient-to-r from-gold/[0.12] to-gold/[0.05] border-gold/35'
            : 'bg-[rgba(0,41,98,0.03)] border-[rgba(0,41,98,0.10)] group-hover:border-gold/25 group-hover:bg-gold/[0.03]'}`}>
          {premium != null ? (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[rgba(0,41,98,0.65)] text-[10px] uppercase tracking-widest font-semibold mb-0.5">
                  Total Premium
                </p>
                <p className={`text-2xl font-bold tracking-tight ${isSelected ? 'text-gold' : 'text-[rgba(0,41,98,1)]'}`}>
                  ₹{premium.toLocaleString('en-IN')}
                </p>
              </div>
              <span className="text-[rgba(0,41,98,0.60)] text-[10px] font-medium pb-0.5">incl. taxes</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[rgba(0,41,98,0.55)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[rgba(0,41,98,0.70)] text-xs font-medium">Fill trip details to view premium</p>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => onViewDetails(plan)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 border-gold bg-gold text-navy hover:bg-yellow-300 hover:border-yellow-300 hover:shadow-md hover:shadow-gold/30 active:scale-[0.98]"
          >
            View Details
          </button>
          <button
            onClick={() => onBuyNow(plan)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 active:scale-[0.98]
              ${isSelected
                ? 'bg-gold text-navy border-gold hover:bg-yellow-300 hover:border-yellow-300 hover:shadow-md hover:shadow-gold/30'
                : 'border-[rgba(0,41,98,0.90)] hover:border-[rgba(0,41,98,0.60)] hover:shadow-md hover:shadow-[rgba(0,41,98,0.25)]'}`}
            style={isSelected ? {} : { background: 'rgba(0,41,98,0.90)', color: '#ffffff' }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,41,98,0.65)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,41,98,0.90)'; }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
