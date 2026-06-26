import { useMemo } from 'react';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Calculate age in years from a date string */
const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

/**
 * Match a detail row for a single traveller.
 * Returns the `total` premium or null.
 */
const matchPremium = (detailsList = [], age, tripDays) => {
  if (age == null || tripDays == null) return null;
  const row = detailsList.find(
    (d) =>
      age >= d.minAge &&
      age <= d.maxAge &&
      tripDays >= d.minDays &&
      tripDays <= d.maxDays
  );
  return row ? row.total : null;
};

/** Sum premium across all travellers */
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
      if (p == null) return null; // can't price all travellers
      total += p;
    }
    return total;
  } catch {
    return null;
  }
};

// ── sub-components ────────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-3.5 h-3.5 text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ── main component ────────────────────────────────────────────────────────────

export default function PlanCard({ plan, isSelected, onViewDetails, onBuyNow }) {
  const premium = useMemo(() => calcTotalPremium(plan.sellingPlanDetailsList), [plan]);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden group hover:-translate-y-1 bg-white
        ${isSelected
          ? 'border-gold shadow-xl shadow-[rgba(0,41,98,0.08)]'
          : 'border-[rgba(0,41,98,0.12)] hover:border-gold/40 hover:bg-[rgba(245,248,255,0.85)] hover:shadow-lg hover:shadow-[rgba(0,41,98,0.06)]'}`}
    >
      {/* Top accent bar */}
      <div className={`h-[3px] w-full transition-colors duration-200
        ${isSelected ? 'bg-gold' : 'bg-[rgba(0,41,98,0.10)] group-hover:bg-gold/50'}`} />

      <div className="flex flex-col flex-1 p-6">

        {/* ── Insurer + badge row ── */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${isSelected ? 'bg-gold/20' : 'bg-gold/10'}`}>
              <ShieldIcon />
            </div>
            <div className="min-w-0">
              <p className="text-[rgba(0,41,98,0.55)] text-[10px] uppercase tracking-widest font-semibold">Insurer</p>
              <p className="text-[rgba(0,41,98,0.85)] text-xs font-semibold leading-tight mt-0.5 truncate">
                {plan.insurerName}
              </p>
            </div>
          </div>

          {/* Plan type badge */}
          {plan.planSubCategory && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
              ${isSelected ? 'bg-gold text-navy' : 'bg-gold/10 text-gold border border-gold/20'}`}>
              {plan.planSubCategory}
            </span>
          )}
        </div>

        {/* ── Plan name ── */}
        <h3 className={`text-lg font-bold leading-snug mb-1 ${isSelected ? 'text-gold' : 'text-[rgba(0,41,98,1)]'}`}>
          {plan.planDisplayName}
        </h3>
        <p className="text-[rgba(0,41,98,0.65)] text-sm mb-4 leading-snug">{plan.planName}</p>

        {/* ── Region tag ── */}
        <div className="flex items-center gap-1.5 bg-[rgba(0,41,98,0.04)] border border-[rgba(0,41,98,0.10)] rounded-full px-3 py-1.5 self-start mb-5">
          <GlobeIcon />
          <span className="text-[rgba(0,41,98,0.65)] text-[11px] font-medium truncate max-w-[180px]">
            {plan.geographicalAreaName}
          </span>
        </div>

        {/* ── Premium block ── */}
        <div className={`rounded-xl p-4 mb-6 border
          ${isSelected
            ? 'bg-gold/10 border-gold/30'
            : 'bg-white/[0.03] border-white/8 group-hover:border-gold/20'}`}>
          {premium != null ? (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[rgba(0,41,98,0.55)] text-[10px] uppercase tracking-widest font-semibold mb-1">
                  Total Premium
                </p>
                <p className={`text-2xl font-bold ${isSelected ? 'text-gold' : 'text-[rgba(0,41,98,1)]'}`}>
                  ₹{premium.toLocaleString('en-IN')}
                </p>
              </div>
              <span className="text-[rgba(0,41,98,0.55)] text-[10px] font-medium">incl. taxes</span>
            </div>
          ) : (
            <div>
              <p className="text-[rgba(0,41,98,0.55)] text-[10px] uppercase tracking-widest font-semibold mb-1">Premium</p>
              <p className="text-[rgba(0,41,98,0.65)] text-sm font-medium">Fill trip details to view</p>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* ── Action buttons ── */}
        <div className="flex gap-2.5">
          <button
            onClick={() => onViewDetails(plan)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[rgba(0,41,98,0.16)] text-[rgba(0,41,98,0.7)]
              hover:border-gold/50 hover:text-gold hover:bg-gold/5 transition-all duration-150"
          >
            View Details
          </button>
          <button
            onClick={() => onBuyNow(plan)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border
              ${isSelected
                ? 'bg-gold text-navy border-gold shadow-sm'
                : 'bg-[rgba(0,41,98,0.04)] text-[rgba(0,41,98,0.85)] border-[rgba(0,41,98,0.16)] hover:bg-gold hover:text-navy hover:border-gold'}`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
