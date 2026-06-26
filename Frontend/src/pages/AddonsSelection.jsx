import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RiderCard from '../components/RiderCard';
import PremiumSummary from '../components/PremiumSummary';

// ── helpers ───────────────────────────────────────────────────────────────────

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

/** Calculate total base premium across all travellers */
const calcBasePremium = (plan, tripForm) => {
  try {
    const { birthDates, days } = tripForm;
    if (!birthDates?.length || !days) return null;
    let total = 0;
    for (const dob of birthDates) {
      const age = calcAge(dob);
      const row = plan.sellingPlanDetailsList?.find(
        (d) => age >= d.minAge && age <= d.maxAge && days >= d.minDays && days <= d.maxDays
      );
      if (!row) return null;
      total += row.total;
    }
    return total;
  } catch { return null; }
};

/** Calculate cost for a single rider given base premium */
const calcRiderCost = (rider, basePremium) => {
  if (basePremium == null) return null;
  const landingPer = parseFloat(rider.riderDetailsList?.[0]?.landingPer ?? 0);
  if (!landingPer) return 0;
  return Math.round((basePremium * landingPer) / 100);
};

// ── skeleton card ─────────────────────────────────────────────────────────────
const SkeletonRider = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden animate-pulse">
    <div className="h-[3px] bg-white/10" />
    <div className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-white/10 rounded w-2/3" />
          <div className="h-2 bg-white/10 rounded w-1/3" />
        </div>
        <div className="w-6 h-6 rounded-lg bg-white/10 shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/10 rounded-xl" />)}
      </div>
      <div className="h-14 bg-white/10 rounded-xl" />
    </div>
  </div>
);

// ── skeleton summary ──────────────────────────────────────────────────────────
const SkeletonSummary = () => (
  <div className="sticky top-24 flex flex-col gap-4 animate-pulse">
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
      <div className="h-2 bg-white/10 rounded w-1/3" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-white/10 rounded w-3/4" />
          <div className="h-2 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
      <div className="h-2 bg-white/10 rounded w-1/4" />
      <div className="h-4 bg-white/10 rounded w-1/2" />
      <div className="h-20 bg-white/10 rounded-xl" />
    </div>
    <div className="h-12 bg-white/10 rounded-xl" />
  </div>
);

// ── main page ─────────────────────────────────────────────────────────────────
export default function AddonsSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get selectedPlan from navigation state
  const selectedPlan = location.state?.selectedPlan;

  // Read trip form from sessionStorage
  const tripForm = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('tripForm') || '{}'); } catch { return {}; }
  }, []);

  // Selected rider objects — persisted to sessionStorage so selection survives navigation
  const [selectedRiders, setSelectedRiders] = useState(() => {
    try {
      const saved = sessionStorage.getItem('selectedRiders');
      const savedPlanId = sessionStorage.getItem('currentPlanId');
      
      // Clear selectedRiders if switching to a different plan
      if (savedPlanId !== selectedPlan?.planId) {
        sessionStorage.setItem('currentPlanId', selectedPlan?.planId || '');
        sessionStorage.setItem('selectedRiders', JSON.stringify([]));
        return [];
      }
      
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Simulate a brief loading state for UX polish
  const [ready] = useState(true);

  const riders = selectedPlan?.riders ?? [];

  // Base premium — calculated once from plan + tripForm
  const basePremium = useMemo(
    () => calcBasePremium(selectedPlan, tripForm),
    [selectedPlan, tripForm]
  );

  // Per-rider costs map { riderId: cost }
  const riderCosts = useMemo(() => {
    const map = {};
    riders.forEach((r) => {
      map[r.riderId] = calcRiderCost(r, basePremium);
    });
    return map;
  }, [riders, basePremium]);

  // Total cost of all selected riders
  const riderTotal = useMemo(() => {
    if (!selectedRiders.length) return 0;
    const costs = selectedRiders.map((r) => riderCosts[r.riderId] ?? 0);
    return costs.reduce((a, b) => a + b, 0);
  }, [selectedRiders, riderCosts]);

  // Final premium = base + rider total
  const finalPremium = useMemo(() => {
    if (basePremium == null) return null;
    return basePremium + riderTotal;
  }, [basePremium, riderTotal]);

  // Toggle a rider on/off and persist to sessionStorage
  const toggleRider = (rider) => {
    setSelectedRiders((prev) => {
      const isCurrentlySelected = prev.some((r) => r.riderId === rider.riderId);
      const next = isCurrentlySelected
        ? prev.filter((r) => r.riderId !== rider.riderId)  // Remove if already selected
        : [...prev, rider];  // Add if not selected
      
      sessionStorage.setItem('selectedRiders', JSON.stringify(next));
      return next;
    });
  };

  const handleContinue = () => {
    // Ensure only valid selected riders are passed
    const validSelectedRiders = selectedRiders.filter(r => r && r.riderId);

    navigate('/traveler-details', {
      state: {
        selectedPlan,
        selectedRiders: validSelectedRiders,
        basePremium,
        riderTotal,
        finalPremium,
        tripForm,
      },
    });
  };

  // Redirect guard — if navigated here without a plan
  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm">No plan selected.</p>
          <button onClick={() => navigate('/choose-plan')}
            className="text-gold text-sm underline underline-offset-2">
            Go back to plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">

      {/* ── Header ── */}
      <Navbar />

      {/* ── Hero band ── */}
      <div className="relative bg-navy-light border-b border-white/10 overflow-hidden shrink-0">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(600px circle at 80% 0%, rgba(250,199,77,0.07), transparent 70%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-9">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/35 hover:text-gold text-xs font-medium mb-4 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Plans
          </button>

          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">Customize Your Cover</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Add-ons & <span className="text-gold">Riders</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm max-w-xl">
            Enhance your <span className="text-white/65">{selectedPlan.planDisplayName}</span> plan with optional add-ons tailored to your needs.
          </p>

          {/* Live count badge */}
          {ready && riders.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-white/55 text-xs font-medium">
                  {selectedRiders.length} of {riders.length} add-on{riders.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              {selectedRiders.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedRiders([]);
                    sessionStorage.setItem('selectedRiders', JSON.stringify([]));
                  }}
                  className="text-white/40 hover:text-red-400 text-xs font-medium transition-colors underline underline-offset-2"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: Riders grid ── */}
          <div className="flex-1 min-w-0">

            {!ready ? (
              // Skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => <SkeletonRider key={i} />)}
              </div>
            ) : riders.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white/55 font-semibold text-sm">No add-ons available</p>
                  <p className="text-white/30 text-xs mt-1 max-w-xs">
                    No optional riders are available for the <span className="text-white/50">{selectedPlan.planDisplayName}</span> plan.
                  </p>
                </div>
                <p className="text-white/25 text-xs">You can still continue with just the base coverage.</p>
              </div>
            ) : (
              <>
                {/* Section label */}
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
                    Available Add-ons
                  </p>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Rider cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {riders.map((rider) => (
                    <RiderCard
                      key={rider.riderId}
                      rider={rider}
                      isSelected={selectedRiders.some((r) => r.riderId === rider.riderId)}
                      riderCost={riderCosts[rider.riderId]}
                      basePremium={basePremium}
                      onToggle={() => toggleRider(rider)}
                    />
                  ))}
                </div>

                {/* Mobile continue button — shown below grid on small screens */}
                <div className="lg:hidden mt-8 flex flex-col gap-3">
                  <div className="rounded-2xl border border-gold/20 bg-gold/[0.06] px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Final Premium</p>
                      <p className="text-gold text-2xl font-bold mt-0.5">
                        {finalPremium != null ? `₹${Number(finalPremium).toLocaleString('en-IN')}` : '—'}
                      </p>
                    </div>
                    {selectedRiders.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/25 text-gold text-xs font-bold">
                        {selectedRiders.length} add-on{selectedRiders.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleContinue}
                    disabled={finalPremium == null}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold text-navy
                      font-bold text-sm transition-all hover:bg-gold-hover
                      disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue to Traveler Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Sticky summary (desktop only) ── */}
          <div className="hidden lg:block w-80 shrink-0">
            {!ready ? (
              <SkeletonSummary />
            ) : (
              <PremiumSummary
                selectedPlan={selectedPlan}
                basePremium={basePremium}
                selectedRiders={selectedRiders}
                riderCosts={riderCosts}
                riderTotal={riderTotal}
                finalPremium={finalPremium}
                onContinue={handleContinue}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
