import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSellingPlans } from '../api/policyApi';
import PlanCard from '../components/PlanCard';
import PlanModal from '../components/PlanModal';
import Navbar from '../components/Navbar';

const PARTNER_ID = import.meta.env.VITE_PARTNER_ID || 'e8098566-1a62-4e17-9d8f-1faf9c8edaed';

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden animate-pulse">
    <div className="h-[3px] bg-white/10" />
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-2 bg-white/10 rounded w-1/4" />
          <div className="h-3 bg-white/10 rounded w-3/5" />
        </div>
        <div className="w-14 h-6 bg-white/10 rounded-full" />
      </div>
      <div className="h-5 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="h-8 bg-white/10 rounded-full w-2/5" />
      <div className="h-20 bg-white/10 rounded-xl" />
      <div className="flex gap-2.5 mt-2">
        <div className="flex-1 h-10 bg-white/10 rounded-xl" />
        <div className="flex-1 h-10 bg-white/10 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Filter pill button ────────────────────────────────────────────────────────
const FilterPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap
      ${active
        ? 'bg-gold text-navy border-gold'
        : 'bg-white/[0.04] text-white/55 border-white/10 hover:border-gold/40 hover:text-gold/80'}`}
  >
    {children}
  </button>
);

// ── helpers ───────────────────────────────────────────────────────────────────
const calcAge = (dob) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};
const getPremium = (plan) => {
  try {
    const raw = sessionStorage.getItem('tripForm');
    if (!raw) return null;
    const { birthDates, days } = JSON.parse(raw);
    if (!birthDates?.length || !days) return null;
    let total = 0;
    for (const dob of birthDates) {
      const age = calcAge(dob);
      const row = plan.sellingPlanDetailsList?.find(
        d => age >= d.minAge && age <= d.maxAge && days >= d.minDays && days <= d.maxDays
      );
      if (!row) return null;
      total += row.total;
    }
    return total;
  } catch { return null; }
};

// ── main page ─────────────────────────────────────────────────────────────────
export default function ChoosePlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const tripForm = location.state?.tripForm
    || (() => { try { return JSON.parse(sessionStorage.getItem('tripForm') || '{}'); } catch { return {}; } })();
  const destinationCountry = tripForm?.destinationCountry || '';

  const [basePlans, setBasePlans]       = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalPlan, setModalPlan]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // filter state
  const [filterInsurer,    setFilterInsurer]    = useState('All');
  const [filterSumInsured, setFilterSumInsured] = useState('All');
  const [filterPlanType,   setFilterPlanType]   = useState('All');
  const [sortPrice,        setSortPrice]        = useState('none'); // 'none' | 'asc' | 'desc'

  // ── fetch — show ALL plans, no geo filtering ──
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSellingPlans(PARTNER_ID);
      const all = data.sellingPlanDto || [];
      setBasePlans(all);
    } catch {
      setError('Unable to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ── derive filter options ──
  const insurerOptions = useMemo(() => ['All', ...new Set(basePlans.map(p => p.insurerName).filter(Boolean))], [basePlans]);
  const planTypeOptions = useMemo(() => ['All', ...new Set(basePlans.map(p => p.planSubCategory).filter(Boolean))], [basePlans]);

  // Sum insured buckets from coverage data
  const sumInsuredOptions = useMemo(() => {
    const maxAmounts = new Set();
    basePlans.forEach(p =>
      p.sellingPlanCoverageDtos?.forEach(c => {
        if (c.maxAmount != null) {
          const val = Number(c.maxAmount);
          if (val >= 500000)       maxAmounts.add('500K+');
          else if (val >= 250000)  maxAmounts.add('250K');
          else if (val >= 100000)  maxAmounts.add('100K');
          else if (val >= 50000)   maxAmounts.add('50K');
        }
      })
    );
    return ['All', ...Array.from(maxAmounts).sort()];
  }, [basePlans]);

  // ── apply filters ──
  const displayPlans = useMemo(() => {
    let list = [...basePlans];

    if (filterInsurer !== 'All')
      list = list.filter(p => p.insurerName === filterInsurer);

    if (filterPlanType !== 'All')
      list = list.filter(p => p.planSubCategory === filterPlanType);

    if (filterSumInsured !== 'All') {
      const threshold = filterSumInsured === '500K+' ? 500000
        : filterSumInsured === '250K' ? 250000
        : filterSumInsured === '100K' ? 100000
        : 50000;
      list = list.filter(p =>
        p.sellingPlanCoverageDtos?.some(c => Number(c.maxAmount) >= threshold)
      );
    }

    if (sortPrice === 'asc' || sortPrice === 'desc') {
      list.sort((a, b) => {
        const pa = getPremium(a) ?? Infinity;
        const pb = getPremium(b) ?? Infinity;
        return sortPrice === 'asc' ? pa - pb : pb - pa;
      });
    }

    return list;
  }, [basePlans, filterInsurer, filterPlanType, filterSumInsured, sortPrice]);

  const hasActiveFilter =
    filterInsurer !== 'All' || filterSumInsured !== 'All' ||
    filterPlanType !== 'All' || sortPrice !== 'none';

  const resetFilters = () => {
    setFilterInsurer('All');
    setFilterSumInsured('All');
    setFilterPlanType('All');
    setSortPrice('none');
  };

  const handleBuyNow = (plan) => {
    setSelectedPlan(plan);
    navigate('/addons', { state: { selectedPlan: plan, tripForm } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* ── Hero band ── */}
      <div className="relative bg-[rgba(245,248,255,1)] border-b border-[rgba(0,41,98,0.12)] overflow-hidden shrink-0">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(600px circle at 85% 0%, rgba(250,199,77,0.06), transparent 70%)' }} />
        <div className="relative max-w-6xl mx-auto px-6 py-9">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[rgba(0,41,98,0.6)] hover:text-gold text-xs font-medium mb-4 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">Choose Your Plan</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgba(0,41,98,1)] leading-tight">
            {destinationCountry
              ? <>Plans for <span className="text-gold">{destinationCountry}</span></>
              : 'Available Plans'}
          </h1>
          <p className="text-[rgba(0,41,98,0.65)] mt-2 text-sm max-w-xl">
            Compare and select the best insurance plan for your trip.
          </p>
          {!loading && !error && (
            <div className="inline-flex items-center gap-2 mt-4 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[rgba(0,41,98,0.65)] text-xs font-medium">
                {displayPlans.length} of {basePlans.length} plan{basePlans.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        {/* ── Filters bar ── */}
        {!loading && !error && basePlans.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl border border-[rgba(0,41,98,0.10)] bg-[rgba(255,255,255,0.95)]">
            <div className="flex flex-wrap gap-y-4 gap-x-6">

              {/* Insurer */}
              <div className="flex flex-col gap-2 min-w-0">
                <p className="text-[rgba(0,41,98,0.55)] text-[10px] uppercase tracking-widest font-semibold">Insurer</p>
                <div className="flex flex-wrap gap-1.5">
                  {insurerOptions.map(opt => (
                    <FilterPill key={opt} active={filterInsurer === opt} onClick={() => setFilterInsurer(opt)}>
                      {opt === 'All' ? 'All Insurers' : opt.split(' ').slice(0, 2).join(' ')}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Plan Type */}
              {planTypeOptions.length > 2 && (
                <div className="flex flex-col gap-2 min-w-0">
                  <p className="text-[rgba(0,41,98,0.55)] text-[10px] uppercase tracking-widest font-semibold">Plan Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {planTypeOptions.map(opt => (
                      <FilterPill key={opt} active={filterPlanType === opt} onClick={() => setFilterPlanType(opt)}>
                        {opt === 'All' ? 'All Types' : opt}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              )}

              {/* Sum Insured */}
              {sumInsuredOptions.length > 2 && (
                <div className="flex flex-col gap-2 min-w-0">
                  <p className="text-[rgba(0,41,98,0.55)] text-[10px] uppercase tracking-widest font-semibold">Sum Insured</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sumInsuredOptions.map(opt => (
                      <FilterPill key={opt} active={filterSumInsured === opt} onClick={() => setFilterSumInsured(opt)}>
                        {opt === 'All' ? 'Any Amount' : `₹${opt}`}
                      </FilterPill>
                    ))}
                  </div>
                </div>
              )}

              {/* Price sort */}
              <div className="flex flex-col gap-2 min-w-0">
                <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Sort by Price</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: 'none', label: 'Default' },
                    { val: 'asc',  label: '↑ Low to High' },
                    { val: 'desc', label: '↓ High to Low' },
                  ].map(o => (
                    <FilterPill key={o.val} active={sortPrice === o.val} onClick={() => setSortPrice(o.val)}>
                      {o.label}
                    </FilterPill>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset */}
            {hasActiveFilter && (
              <button onClick={resetFilters}
                className="mt-4 flex items-center gap-1.5 text-xs text-white/35 hover:text-gold transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-semibold text-sm">{error}</p>
              <p className="text-white/30 text-xs mt-1">Check your connection and try again</p>
            </div>
            <button onClick={fetchPlans}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-semibold hover:bg-gold/20 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        )}

        {/* ── Empty — no geo plans ── */}
        {!loading && !error && basePlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white/60 font-semibold text-sm">No plans available</p>
              <p className="text-white/30 text-xs mt-1">No insurance plans found. Please try again.</p>
            </div>
            <button onClick={fetchPlans}
              className="text-gold text-sm underline underline-offset-2 hover:text-gold-hover transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* ── Empty — filter mismatch ── */}
        {!loading && !error && basePlans.length > 0 && displayPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white/60 font-semibold text-sm">No plans match your filters</p>
              <p className="text-white/30 text-xs mt-1">Try adjusting or resetting the filters above</p>
            </div>
            <button onClick={resetFilters}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-semibold hover:bg-gold/20 transition-colors">
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Plans grid ── */}
        {!loading && !error && displayPlans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayPlans.map((plan) => (
              <PlanCard
                key={plan.planId}
                plan={plan}
                isSelected={selectedPlan?.planId === plan.planId}
                onViewDetails={(p) => setModalPlan(p)}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ── */}
      {modalPlan && (
        <PlanModal
          plan={modalPlan}
          onClose={() => setModalPlan(null)}
          onBuyNow={handleBuyNow}
        />
      )}
    </div>
  );
}

