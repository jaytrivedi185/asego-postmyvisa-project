// TravelerSummaryCard.jsx — sticky summary sidebar for TravelerDetails page

const fmt = (n) => Number(n).toLocaleString('en-IN');

const Row = ({ label, value, gold, muted }) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <span className={`text-sm leading-tight ${muted ? 'text-white/40' : 'text-white/70'}`}>{label}</span>
    <span className={`text-sm font-bold tabular-nums shrink-0 ${gold ? 'text-gold' : muted ? 'text-white/40' : 'text-white'}`}>
      {value}
    </span>
  </div>
);

const TripRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-1">{label}</p>
      <p className="text-white text-sm font-medium leading-relaxed break-words">{value || '—'}</p>
    </div>
  </div>
);

export default function TravelerSummaryCard({
  selectedPlan,
  selectedRiders = [],
  basePremium,
  riderTotal,
  finalPremium,
  tripForm = {},
}) {
  // Filter out any invalid riders
  const validSelectedRiders = selectedRiders.filter(r => r && r.riderId);
  const hasRiders = validSelectedRiders.length > 0;

  const riderCostsMap = {};
  if (basePremium != null) {
    validSelectedRiders.forEach((r) => {
      const lp = parseFloat(r.riderDetailsList?.[0]?.landingPer ?? 0);
      riderCostsMap[r.riderId] = Math.round((basePremium * lp) / 100);
    });
  }

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="flex flex-col gap-5">

      {/* Plan card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-4">Selected Plan</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-base leading-snug mb-1">{selectedPlan?.planDisplayName || 'Plan Name'}</p>
            <p className="text-white/50 text-sm">{selectedPlan?.insurerName || 'Insurer'}</p>
          </div>
        </div>
      </div>

      {/* Premium breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-1">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">Premium Breakdown</p>

        <Row label="Base Premium" value={basePremium != null ? `₹${fmt(basePremium)}` : '—'} />

        {hasRiders && (
          <>
            <div className="h-px bg-white/10 my-2" />
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-1">Selected Add-ons ({validSelectedRiders.length})</p>
            {validSelectedRiders.map((r) => (
              <Row
                key={r.riderId}
                label={r.riderName}
                value={riderCostsMap[r.riderId] != null ? `+ ₹${fmt(riderCostsMap[r.riderId])}` : '—'}
                muted={riderCostsMap[r.riderId] == null}
              />
            ))}
            <div className="h-px bg-white/10 my-2" />
            <Row label="Add-ons Total" value={riderTotal != null ? `₹${fmt(riderTotal)}` : '—'} />
          </>
        )}

        {/* Final */}
        <div className="rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 px-5 py-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-[11px] uppercase tracking-widest font-semibold">Total Premium</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-white/40 text-[10px]">Final</span>
            </div>
          </div>
          <p className="text-gold text-3xl font-bold tabular-nums tracking-tight">
            {finalPremium != null ? `₹${fmt(finalPremium)}` : '—'}
          </p>
          <p className="text-white/30 text-[11px] mt-2">Inclusive of all charges</p>
        </div>
      </div>

      {/* Trip summary */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-1">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">Trip Summary</p>

        <TripRow
          label="Destination"
          value={tripForm.destinationCountry}
          icon={
            <svg className="w-4 h-4 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <div className="h-px bg-white/8 my-1" />

        <TripRow
          label="Travel Dates"
          value={tripForm.startDate && tripForm.endDate
            ? `${fmtDate(tripForm.startDate)} – ${fmtDate(tripForm.endDate)}`
            : '—'}
          icon={
            <svg className="w-4 h-4 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <div className="h-px bg-white/8 my-1" />

        <TripRow
          label="Travellers"
          value={tripForm.travelerCount ? `${tripForm.travelerCount} person${tripForm.travelerCount > 1 ? 's' : ''}` : '—'}
          icon={
            <svg className="w-4 h-4 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        {tripForm.days && (
          <>
            <div className="h-px bg-white/8 my-1" />
            <TripRow
              label="Duration"
              value={`${tripForm.days} day${tripForm.days > 1 ? 's' : ''}`}
              icon={
                <svg className="w-4 h-4 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </>
        )}

        {tripForm.email && (
          <>
            <div className="h-px bg-white/8 my-1" />
            <TripRow
              label="Contact Email"
              value={tripForm.email}
              icon={
                <svg className="w-4 h-4 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
          </>
        )}

        {tripForm.phone && (
          <>
            <div className="h-px bg-white/8 my-1" />
            <TripRow
              label="Contact Phone"
              value={tripForm.phone}
              icon={
                <svg className="w-4 h-4 text-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
