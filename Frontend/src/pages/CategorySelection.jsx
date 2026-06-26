import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { countries } from '../data/countries';
import Navbar from '../components/Navbar';

/* =====================================================================
   ASEGO · Trip Details (Step 1 of 4)
   ---------------------------------------------------------------------
   A guided, four-part sequence — Destination, Dates, Travellers, Contact
   — presented as a single page. Each section carries a numbered badge
   that resolves into a checkmark once its inputs are valid, so the
   page itself communicates progress without a separate progress bar.
   A condensed "trip strip" mirrors that progress in one line, styled
   after a boarding-pass stub, and stays in view while the form is
   filled in.
   ===================================================================== */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');`;

const GLOBAL_STYLES = `
  @keyframes risePanel {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes drift {
    from { background-position: 0 0; }
    to { background-position: 200% 0; }
  }
  .panel-rise { animation: risePanel 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
  .horizon-line {
    background: linear-gradient(90deg, transparent, rgba(250,199,77,0.55) 45%, rgba(250,199,77,0.85) 50%, rgba(250,199,77,0.55) 55%, transparent);
    background-size: 200% 100%;
    animation: drift 7s linear infinite;
  }
  .focus-gold:focus-visible {
    outline: 2px solid #FAC74D;
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .panel-rise { animation: none; opacity: 1; }
    .horizon-line { animation: none; }
  }
`;

/* ---------------------------------------------------------------------
   Pure helpers
   --------------------------------------------------------------------- */
function diffDays(start, end) {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  return ms > 0 ? Math.ceil(ms / 86400000) : null;
}

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const notYetHadBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (notYetHadBirthday) age--;
  return age;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ORDINALS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const MAX_TRAVELERS = 10;

/* ---------------------------------------------------------------------
   Icon set — single-purpose, stroke-based, sized by the caller
   --------------------------------------------------------------------- */
const Icon = {
  Globe: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Calendar: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Users: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Mail: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Chevron: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Arrow: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Alert: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Close: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Clock: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Lock: ({ cls }) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-12V7a4 4 0 10-8 0v2" />
    </svg>
  ),
};

/* ---------------------------------------------------------------------
   Shared primitives
   --------------------------------------------------------------------- */
const FieldLabel = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-white/50 text-xs font-semibold uppercase tracking-[0.15em] mb-2 block">
    {children}
  </label>
);

const ErrorText = ({ children }) => (
  <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[#F0795B] text-xs">
    <Icon.Alert cls="w-3.5 h-3.5 flex-shrink-0" />
    {children}
  </p>
);

const inputBase =
  'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 outline-none focus:border-gold/60 focus:bg-white/[0.07] transition-colors duration-200';

/** Numbered badge that resolves into a checkmark — the only place
 *  in the page where sequence is spelled out, because this is a
 *  genuine fill-in-order flow. */
const StepBadge = ({ index, complete }) => (
  <span
    className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all duration-300 ${
      complete
        ? 'border-gold/40 bg-gold text-navy'
        : 'border-gold/25 bg-gold/10 text-gold'
    }`}
  >
    {complete ? <Icon.Check cls="w-4 h-4" /> : String(index).padStart(2, '0')}
  </span>
);

const SectionCard = ({ stepIndex, complete, icon, title, subtitle, accent, children }) => (
  <section
    className="panel-rise group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 transition-colors duration-300 hover:border-white/20"
    style={{ animationDelay: `${stepIndex * 90}ms` }}
  >
    <span
      aria-hidden="true"
      className={`absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-gold transition-opacity duration-300 ${
        complete ? 'opacity-70' : 'opacity-0 group-focus-within:opacity-40'
      }`}
    />
    <div className="mb-5 flex items-center gap-3">
      <StepBadge index={stepIndex} complete={complete} />
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">{title}</p>
        {subtitle && <p className="text-white/35 text-xs mt-0.5 truncate">{subtitle}</p>}
      </div>
      {icon && (
        <div className="ml-auto hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10 sm:flex">
          {icon}
        </div>
      )}
    </div>
    {children}
  </section>
);

/* ---------------------------------------------------------------------
   CountrySearch — searchable combobox replacing the plain <select>
   --------------------------------------------------------------------- */
function CountrySearch({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const wrapRef = useRef(null);
  const inRef   = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? countries.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : countries;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlighted];
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const select = (country) => {
    onChange(country);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter')   { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]); }
    else if (e.key === 'Escape')  { setOpen(false); setQuery(''); inRef.current?.blur(); }
  };

  const displayValue = open ? query : (value || '');

  return (
    <div ref={wrapRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Icon.Globe cls="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/50" />
        <input
          ref={inRef}
          type="text"
          autoComplete="off"
          placeholder="Search or select a country…"
          value={displayValue}
          onFocus={() => { setOpen(true); setHighlighted(0); }}
          onChange={(e) => { setQuery(e.target.value); setHighlighted(0); setOpen(true); }}
          onKeyDown={handleKeyDown}
          className={`${inputBase} focus-gold pl-11 pr-10 cursor-text`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen((v) => !v); inRef.current?.focus(); }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          <Icon.Chevron cls={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute z-30 mt-1.5 w-full rounded-xl border border-white/15 overflow-hidden"
          style={{ background: 'rgba(10, 22, 40, 0.98)', backdropFilter: 'blur(12px)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', maxHeight: '240px', overflowY: 'auto' }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-white/30">No countries found</div>
          ) : (
            filtered.map((country, i) => (
              <button
                key={country}
                type="button"
                onMouseDown={() => select(country)}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3
                  ${ i === highlighted
                    ? 'bg-gold/15 text-gold'
                    : country === value
                    ? 'bg-gold/8 text-gold/80'
                    : 'text-white/75 hover:bg-white/[0.05]'}`}
              >
                {country === value && i !== highlighted && (
                  <Icon.Check cls="h-3.5 w-3.5 text-gold/60 shrink-0" />
                )}
                {i === highlighted && (
                  <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </span>
                )}
                {country !== value && i !== highlighted && (
                  <span className="w-3.5 shrink-0" />
                )}
                {/* Highlight matching portion */}
                {query ? (() => {
                  const idx = country.toLowerCase().indexOf(query.toLowerCase());
                  if (idx === -1) return country;
                  return (
                    <>
                      {country.slice(0, idx)}
                      <span className="text-gold font-semibold">{country.slice(idx, idx + query.length)}</span>
                      {country.slice(idx + query.length)}
                    </>
                  );
                })() : country}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Component
   --------------------------------------------------------------------- */
export default function CategorySelection() {
  const saved = (() => {
    try { return JSON.parse(sessionStorage.getItem('tripForm') || '{}'); } catch { return {}; }
  })();

  const [destinationCountry, setDestinationCountry] = useState(saved.destinationCountry ?? '');
  const [startDate, setStartDate] = useState(saved.startDate ?? '');
  const [endDate, setEndDate] = useState(saved.endDate ?? '');
  const [dateError, setDateError] = useState('');
  const [travelerCount, setTravelerCount] = useState(saved.travelerCount ?? '');
  const [birthDates, setBirthDates] = useState(saved.birthDates ?? []);
  const [showContact, setShowContact] = useState(saved.showContact ?? false);
  const [email, setEmail] = useState(saved.email ?? '');
  const [phone, setPhone] = useState(saved.phone ?? '');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const navigate = useNavigate();
  const days = diffDays(startDate, endDate);

  useEffect(() => {
    sessionStorage.setItem('tripForm', JSON.stringify({
      destinationCountry, startDate, endDate, days, travelerCount, birthDates, showContact, email, phone,
    }));
  }, [destinationCountry, startDate, endDate, days, travelerCount, birthDates, showContact, email, phone]);

  const handleEndDate = (val) => {
    setEndDate(val);
    if (startDate && val && new Date(val) <= new Date(startDate)) {
      setDateError('End date must be after start date.');
    } else {
      setDateError('');
    }
  };

  const changeTravelerCount = (delta) => {
    const current = travelerCount === '' ? 0 : travelerCount;
    const next = Math.min(MAX_TRAVELERS, Math.max(1, current + delta));
    setTravelerCount(next);
    setBirthDates(Array.from({ length: next }, (_, i) => birthDates[i] ?? ''));
  };

  const validateEmail = (val) => {
    if (!val) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address.';
    return '';
  };

  const validatePhone = (val) => {
    if (!val) return 'Phone number is required.';
    if (!/^[0-9]{10}$/.test(val)) return 'Enter a valid 10-digit phone number.';
    return '';
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    setEmailError(validateEmail(val));
  };

  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setPhoneError(validatePhone(digits));
  };

  // Section-level validity — drives both the step badges and the trip strip
  const destinationValid = Boolean(destinationCountry);
  const datesValid = Boolean(startDate && endDate && !dateError && days > 0);
  const travellersValid =
    travelerCount >= 1 && birthDates.length > 0 && birthDates.every((d) => d);
  const isTripValid = destinationValid && datesValid && travellersValid;
  const isContactValid = email && phone && !validateEmail(email) && !validatePhone(phone);

  const handleSubmitTravellers = () => {
    if (!isTripValid) return;
    setShowContact(true);
    setTimeout(() => {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleContinue = () => {
    const eErr = validateEmail(email);
    const pErr = validatePhone(phone);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;
    const tripForm = { destinationCountry, startDate, endDate, days, travelerCount, birthDates, email, phone };
    sessionStorage.setItem('tripForm', JSON.stringify(tripForm));
    navigate('/choose-plan', { state: { tripForm } });
  };

  const today = new Date().toISOString().split('T')[0];
  const anyProgress = destinationValid || datesValid || Boolean(travelerCount);

  return (
    <div className="min-h-screen bg-navy flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <style>{GLOBAL_STYLES}</style>

      {/* Navbar */}
      <Navbar />

      {/* Signature horizon line — the one bold flourish on the page */}
      <div className="horizon-line h-[2px] w-full" aria-hidden="true" />

      {/* ---------- Hero ---------- */}
      <div className="relative overflow-hidden border-b border-white/10 bg-navy-light">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(600px circle at 85% 0%, rgba(250,199,77,0.07), transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Trip Details</p>
          <h1
            className="text-[2rem] leading-[1.12] text-white sm:text-4xl"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontOpticalSizing: 'auto' }}
          >
            Plan your <span className="text-gold">journey</span>
          </h1>
          <span aria-hidden="true" className="mt-3 block h-px w-16 bg-gradient-to-r from-gold/70 to-transparent" />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/45">
            Tell us where you're headed, your travel dates, and who's coming — we'll match you with the right cover.
          </p>
        </div>
      </div>

      {/* ---------- Trip strip — boarding-pass style summary, builds up as fields are filled ---------- */}
      {anyProgress && (
        <div className="border-b border-white/10 bg-navy-light/60">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-xs sm:px-6">
            <span className="flex items-center gap-1.5 text-white/70">
              <Icon.Globe cls="h-3.5 w-3.5 text-gold/70" />
              {destinationValid ? destinationCountry : <span className="text-white/30">Destination pending</span>}
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-white/70">
              <Icon.Calendar cls="h-3.5 w-3.5 text-gold/70" />
              {datesValid
                ? `${formatDate(startDate)} – ${formatDate(endDate)} · ${days} ${days === 1 ? 'day' : 'days'}`
                : <span className="text-white/30">Dates pending</span>}
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-white/70">
              <Icon.Users cls="h-3.5 w-3.5 text-gold/70" />
              {travelerCount
                ? `${travelerCount} ${travelerCount === 1 ? 'traveller' : 'travellers'}`
                : <span className="text-white/30">Travellers pending</span>}
            </span>
          </div>
        </div>
      )}

      {/* ---------- Main ---------- */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">

        <div className="flex flex-col gap-5">

            {/* 01 · Destination */}
            <SectionCard
              stepIndex={1}
              complete={destinationValid}
              title="Destination Country"
              subtitle="Where you're travelling to"
              icon={<Icon.Globe cls="h-4 w-4 text-gold" />}
            >
              <FieldLabel htmlFor="destination">Search destination country</FieldLabel>
              <CountrySearch value={destinationCountry} onChange={(c) => setDestinationCountry(c)} />
              {destinationCountry && (
                <div className="mt-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gold/[0.07] border border-gold/20">
                  <Icon.Check cls="h-3.5 w-3.5 text-gold shrink-0" />
                  <p className="text-gold/80 text-xs font-semibold">{destinationCountry}</p>
                </div>
              )}
            </SectionCard>

            {/* 02 · Travel Dates */}
            <SectionCard
              stepIndex={2}
              complete={datesValid}
              title="Travel Dates"
              subtitle="Start and end of your trip"
              icon={<Icon.Calendar cls="h-4 w-4 text-gold" />}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="start-date">Start date</FieldLabel>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => { setStartDate(e.target.value); setEndDate(''); setDateError(''); }}
                    className={`${inputBase} focus-gold`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="end-date">End date</FieldLabel>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => handleEndDate(e.target.value)}
                    disabled={!startDate}
                    className={`${inputBase} focus-gold ${dateError ? 'border-[#F0795B]/60 focus:border-[#F0795B]/80' : ''} disabled:cursor-not-allowed disabled:opacity-40`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {dateError && <ErrorText>{dateError}</ErrorText>}

              {days > 0 && !dateError && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/[0.08] px-4 py-3">
                  <Icon.Clock cls="h-4 w-4 flex-shrink-0 text-gold" />
                  <span className="text-sm text-white/80">
                    Trip duration:&nbsp;
                    <span className="font-semibold text-gold">{days} {days === 1 ? 'day' : 'days'}</span>
                  </span>
                </div>
              )}
            </SectionCard>

            {/* 03 · Travellers */}
            <SectionCard
              stepIndex={3}
              complete={travellersValid}
              title="Travellers"
              subtitle={travelerCount ? `${travelerCount} on this trip` : 'Who is travelling'}
              icon={<Icon.Users cls="h-4 w-4 text-gold" />}
            >
              <FieldLabel>Number of travellers</FieldLabel>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => changeTravelerCount(-1)}
                  disabled={travelerCount === '' || travelerCount <= 1}
                  aria-label="Decrease travellers"
                  className="focus-gold flex h-11 w-11 flex-shrink-0 select-none items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl font-light text-white transition-all duration-200 hover:border-gold/50 hover:bg-gold/10 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                >
                  −
                </button>

                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold tabular-nums text-white">
                    {travelerCount === '' ? '0' : travelerCount}
                  </span>
                  <p className="mt-0.5 text-xs text-white/35">
                    {travelerCount === '' || travelerCount === 0
                      ? 'add travellers'
                      : travelerCount === 1 ? 'traveller' : 'travellers'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => changeTravelerCount(1)}
                  disabled={travelerCount >= MAX_TRAVELERS}
                  aria-label="Increase travellers"
                  className="focus-gold flex h-11 w-11 flex-shrink-0 select-none items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl font-light text-white transition-all duration-200 hover:border-gold/50 hover:bg-gold/10 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                >
                  +
                </button>
              </div>

              {travelerCount >= MAX_TRAVELERS && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gold/70">
                  <Icon.Alert cls="h-3.5 w-3.5" />
                  Maximum {MAX_TRAVELERS} travellers allowed
                </p>
              )}

              {birthDates.length > 0 && (
                <div className="mt-5 flex flex-col gap-3">
                  {birthDates.map((dob, i) => {
                    const age = calcAge(dob);
                    const ageStyle = age === null ? null
                      : age < 2 ? 'border-sky-400/20 bg-sky-500/10 text-sky-300'
                      : age < 18 ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                      : age >= 60 ? 'border-amber-400/20 bg-amber-500/10 text-amber-300'
                      : 'border-gold/20 bg-gold/[0.07] text-gold/80';

                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors duration-200 hover:border-gold/25"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/15 text-xs font-bold text-gold">
                              {i + 1}
                            </span>
                            <p className="text-sm font-semibold leading-tight text-white">
                              Traveller {ORDINALS[i]}
                            </p>
                          </div>
                          {dob && (
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/40">
                                {formatDate(dob)}
                              </span>
                              <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${ageStyle}`}>
                                {age < 1 ? '< 1 yr' : `${age} yrs`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label htmlFor={`dob-${i}`} className="whitespace-nowrap text-xs text-white/40">
                            Date of Birth
                          </label>
                          <input
                            id={`dob-${i}`}
                            type="date"
                            value={dob}
                            max={today}
                            onChange={(e) => {
                              const updated = [...birthDates];
                              updated[i] = e.target.value;
                              setBirthDates(updated);
                            }}
                            className="focus-gold flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-colors duration-200 focus:border-gold/50 focus:bg-white/[0.07]"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Bridge between Travellers and Contact */}
            {!showContact && (
              <div className="flex flex-col items-stretch justify-between gap-3 pb-1 pt-2 sm:flex-row sm:items-center">
                <p className="text-sm text-white/30">
                  {isTripValid
                    ? <span className="text-white/55">All details filled — add contact info to continue</span>
                    : 'Complete all fields above to proceed'}
                </p>
                <button
                  onClick={handleSubmitTravellers}
                  disabled={!isTripValid}
                  className="focus-gold flex items-center justify-center gap-2 rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy transition-all duration-200 hover:bg-gold-hover hover:shadow-[0_0_20px_rgba(250,199,77,0.25)] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                >
                  Submit
                  <Icon.Arrow cls="h-4 w-4" />
                </button>
              </div>
            )}

            {/* 04 · Contact */}
            {showContact && (
              <div id="contact-section" className="panel-rise">
                <SectionCard
                  stepIndex={4}
                  complete={Boolean(isContactValid)}
                  title="Contact Information"
                  subtitle="We'll send your policy details here"
                  icon={<Icon.Mail cls="h-4 w-4 text-gold" />}
                >
                  <button
                    type="button"
                    onClick={() => setShowContact(false)}
                    aria-label="Go back to traveller details"
                    className="focus-gold absolute right-5 top-5 text-white/25 transition-colors duration-150 hover:text-white/60"
                  >
                    <Icon.Close cls="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="email">Email address</FieldLabel>
                      <div className="relative">
                        <Icon.Mail cls="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="you@example.com"
                          className={`${inputBase} focus-gold pl-11 ${emailError ? 'border-[#F0795B]/60 focus:border-[#F0795B]/80' : ''}`}
                        />
                      </div>
                      {emailError && <ErrorText>{emailError}</ErrorText>}
                    </div>

                    <div>
                      <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                      <div className="relative">
                        <Icon.Phone cls="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="10-digit number"
                          maxLength={10}
                          className={`${inputBase} focus-gold pl-11 ${phoneError ? 'border-[#F0795B]/60 focus:border-[#F0795B]/80' : ''}`}
                        />
                      </div>
                      {phoneError && <ErrorText>{phoneError}</ErrorText>}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-[11px] text-white/30">
                    <Icon.Lock cls="h-3 w-3" />
                    Your details are encrypted and used only to send your policy documents.
                  </div>

                  <div className="mt-6 flex flex-col items-stretch justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
                    <p className="text-xs">
                      {isContactValid
                        ? <span className="flex items-center gap-1.5 text-gold/70"><Icon.Check cls="h-3.5 w-3.5" /> Ready to view plans</span>
                        : <span className="text-white/30">Fill in your contact details</span>}
                    </p>
                    <button
                      onClick={handleContinue}
                      disabled={!isContactValid}
                      className="focus-gold flex items-center justify-center gap-2 rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy transition-all duration-200 hover:bg-gold-hover hover:shadow-[0_0_20px_rgba(250,199,77,0.3)] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                    >
                      Continue to Plans
                      <Icon.Arrow cls="h-4 w-4" />
                    </button>
                  </div>
                </SectionCard>
              </div>
            )}

            <div className="pb-4" />
          </div>
      </main>
    </div>
  );
}