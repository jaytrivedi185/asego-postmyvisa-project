// PremiumSummary.jsx — sticky right-side premium breakdown card (with trip summary)

const fmt = (n) => Number(n).toLocaleString('en-IN');

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const SummaryRow = ({ label, value, gold, large, muted }) => (
  <div className={`flex items-center justify-between gap-3 ${large ? 'py-1' : 'py-0.5'}`}>
    <span className={`text-sm leading-snug ${muted ? 'text-white/65' : 'text-white'}`}>{label}</span>
    <span className={`font-bold tabular-nums shrink-0
      ${large ? 'text-xl' : 'text-sm'}
      ${gold ? 'text-gold' : muted ? 'text-white/65' : 'text-white'}`}>
      {value}
    </span>
  </div>
);

const TripRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-white/55 text-[10px] uppercase tracking-widest font-semibold">{label}</span>
    <span className="text-white text-sm font-medium">{value || '—'}</span>
  </div>
);

export default function PremiumSummary({
  selectedPlan,
  basePremium,
  selectedRiders,
  riderCosts,
  riderTotal,
  finalPremium,
  tripForm,
  onContinue,
  continueLabel = 'Continue to Traveler Details',
}) {
  const hasRiders = selectedRiders?.length > 0;

  return (
    <div className="sticky top-24 flex flex-col gap-4">

      {/* Plan identity card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-3">Selected Plan</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-snug truncate">{selectedPlan?.planDisplayName}</p>
            <p className="text-white/65 text-xs mt-0.5 truncate">{selectedPlan?.insurerName}</p>
          </div>
        </div>
      </div>

      {/* Premium breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">

        {/* Base premium */}
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-2">Base Premium</p>
          {basePremium != null ? (
            <SummaryRow label="Plan Premium" value={`₹${fmt(basePremium)}`} />
          ) : (
            <p className="text-white/55 text-xs">Trip details needed</p>
          )}
        </div>

        {/* Selected riders */}
        {hasRiders && (
          <>
            <div className="h-px bg-white/8" />
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-2">
                Selected Add-ons ({selectedRiders.length})
              </p>
              <div className="flex flex-col gap-1.5">
                {selectedRiders.map((rider) => (
                  <SummaryRow
                    key={rider.riderId}
                    label={rider.riderName}
                    value={riderCosts?.[rider.riderId] != null
                      ? `+ ₹${fmt(riderCosts[rider.riderId])}`
                      : '—'}
                    muted={riderCosts?.[rider.riderId] == null}
                  />
                ))}
              </div>
            </div>

            <div className="h-px bg-white/8" />
            <SummaryRow
              label="Total Add-ons Cost"
              value={riderTotal != null ? `₹${fmt(riderTotal)}` : '—'}
            />
          </>
        )}

        {/* Final premium */}
        <div className="rounded-xl bg-gold/[0.08] border border-gold/25 px-4 py-3.5 mt-1">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-1">Final Premium</p>
          <p className="text-gold text-3xl font-bold tabular-nums">
            {finalPremium != null ? `₹${fmt(finalPremium)}` : '—'}
          </p>
          <p className="text-white/55 text-[10px] mt-1">Inclusive of all selected add-ons</p>
        </div>
      </div>

      {/* Trip summary */}
      {tripForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Trip Summary</p>
          <TripRow label="Destination" value={tripForm.destinationCountry} />
          <TripRow
            label="Travel Dates"
            value={
              tripForm.startDate && tripForm.endDate
                ? `${fmtDate(tripForm.startDate)} – ${fmtDate(tripForm.endDate)}`
                : '—'
            }
          />
          <TripRow
            label="Duration"
            value={tripForm.days ? `${tripForm.days} day${tripForm.days > 1 ? 's' : ''}` : '—'}
          />
          <TripRow
            label="Travellers"
            value={tripForm.travelerCount ? `${tripForm.travelerCount} traveller${tripForm.travelerCount > 1 ? 's' : ''}` : '—'}
          />
        </div>
      )}

      {/* Continue button — only shown when onContinue is provided */}
      {onContinue && (
        <button
          onClick={onContinue}
          disabled={finalPremium == null}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold text-navy
            font-bold text-sm transition-all duration-150
            hover:bg-gold-hover hover:shadow-lg hover:shadow-gold/20
            disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {continueLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {hasRiders && (
        <p className="text-center text-white/50 text-[11px]">
          {selectedRiders.length} add-on{selectedRiders.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
