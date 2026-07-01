// RiderCard.jsx — individual rider/add-on card

const fmt = (n) => Number(n).toLocaleString('en-IN');

export default function RiderCard({ rider, isSelected, riderCost, basePremium, onToggle }) {
  // Pull first detail row for eligibility info
  const detail = rider.riderDetailsList?.[0] ?? {};
  const coverage = rider.riderCoverageList?.[0] ?? {};
  const landingPer = parseFloat(detail.landingPer ?? 0);

  return (
    <div
      onClick={onToggle}
      className={`relative cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden group
        hover:-translate-y-0.5 hover:shadow-lg
        ${isSelected
          ? 'border-gold bg-gold/[0.06] shadow-gold/10 shadow-xl'
          : 'border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-white/[0.05] hover:shadow-black/30'}`}
    >
      {/* Top accent bar */}
      <div className={`h-[3px] w-full transition-colors duration-200
        ${isSelected ? 'bg-gold' : 'bg-white/10 group-hover:bg-gold/40'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${isSelected ? 'bg-gold/20' : 'bg-gold/10'}`}>
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold text-base leading-snug truncate
                ${isSelected ? 'text-gold' : 'text-white'}`}>
                {rider.riderName}
              </h3>
              {coverage.name && coverage.name !== rider.riderName && (
                <p className="text-white/65 text-xs mt-0.5 truncate">{coverage.name}</p>
              )}
            </div>
          </div>

          {/* Checkbox */}
          <div className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
            ${isSelected
              ? 'bg-gold border-gold'
              : 'border-white/20 bg-white/[0.04] group-hover:border-gold/50'}`}>
            {isSelected && (
              <svg className="w-3.5 h-3.5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {coverage.maxAmount && (
            <div className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
              <p className="text-white/65 text-[9px] uppercase tracking-widest font-semibold mb-0.5">Coverage</p>
              <p className="text-white text-xs font-bold">₹{fmt(coverage.maxAmount)}</p>
            </div>
          )}
          {coverage.deductibles && coverage.deductibles !== '-' && (
            <div className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
              <p className="text-white/65 text-[9px] uppercase tracking-widest font-semibold mb-0.5">Deductible</p>
              <p className="text-white text-xs font-bold">{coverage.deductibles}</p>
            </div>
          )}
          {(detail.minAge != null && detail.maxAge != null) && (
            <div className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
              <p className="text-white/65 text-[9px] uppercase tracking-widest font-semibold mb-0.5">Age</p>
              <p className="text-white text-xs font-bold">{detail.minAge} – {detail.maxAge} yrs</p>
            </div>
          )}
          {(detail.minDays != null && detail.maxDays != null) && (
            <div className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
              <p className="text-white/65 text-[9px] uppercase tracking-widest font-semibold mb-0.5">Trip Days</p>
              <p className="text-white text-xs font-bold">{detail.minDays} – {detail.maxDays} days</p>
            </div>
          )}
        </div>

        {/* Premium row */}
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors
          ${isSelected
            ? 'bg-gold/10 border-gold/30'
            : 'bg-white/[0.03] border-white/8 group-hover:border-gold/15'}`}>
          <div>
            <p className="text-white/65 text-[9px] uppercase tracking-widest font-semibold">Add-on Premium</p>
            {basePremium != null ? (
              <p className={`text-lg font-bold ${isSelected ? 'text-gold' : 'text-white'}`}>
                + ₹{fmt(riderCost)}
              </p>
            ) : (
              <p className="text-white/60 text-xs">Calculated on base premium</p>
            )}
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border
            ${isSelected ? 'bg-gold text-navy border-gold' : 'bg-gold/20 text-gold border-gold/40'}`}>
            +{landingPer}%
          </span>
        </div>

        {/* Add Rider label */}
        <p className={`mt-3 text-center text-xs font-semibold transition-colors
          ${isSelected ? 'text-gold' : 'text-white/55 group-hover:text-white/80'}`}>
          {isSelected ? '✓ Added to your plan' : 'Click to add this rider'}
        </p>
      </div>
    </div>
  );
}
