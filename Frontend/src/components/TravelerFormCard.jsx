// TravelerFormCard.jsx — one card per traveller

export const inputCls = (err) =>
  `w-full bg-[rgba(0,41,98,0.03)] border rounded-xl px-4 py-3 text-[rgba(0,41,98,0.95)] text-sm placeholder-[rgba(0,41,98,0.28)]
   outline-none transition-colors duration-150
   ${err
     ? 'border-red-500/60 focus:border-red-400/80'
     : 'border-[rgba(0,41,98,0.12)] focus:border-gold/60 focus:bg-[rgba(0,41,98,0.05)]'}`;

export const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1.5 text-red-400 text-xs">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  ) : null;

export const Label = ({ children, required }) => (
  <label className="block text-[rgba(0,41,98,0.65)] text-[10px] font-semibold uppercase tracking-widest mb-1.5">
    {children}{required && <span className="text-gold ml-0.5">*</span>}
  </label>
);

const fmtDob = (dob) => {
  if (!dob) return '—';
  return new Date(dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function TravelerFormCard({ index, data, errors, onChange }) {
  const handle = (field, val) => onChange(index, field, val);

  return (
    <div className="rounded-2xl border border-[rgba(0,41,98,0.12)] bg-white overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(0,41,98,0.08)]"
        style={{ background: 'linear-gradient(135deg, rgba(242,196,90,0.15) 0%, transparent 60%)' }}
      >
        <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
          <span className="text-gold font-bold text-sm">T{index + 1}</span>
        </div>
        <div>
          <p className="text-[rgba(0,41,98,1)] font-bold text-sm">Traveller {index + 1}</p>
          {data.dob && (
            <p className="text-[rgba(0,41,98,0.55)] text-xs mt-0.5">
              DOB: {fmtDob(data.dob)}&nbsp;·&nbsp;Age: {data.age} yrs
            </p>
          )}
        </div>
        {data.age != null && (
          <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0
            ${data.age < 18
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700'
              : data.age >= 60
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-700'
              : 'bg-gold/15 border-gold/40 text-[rgba(0,41,98,0.85)]'}`}>
            {data.age} yrs
          </span>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <Label required>Full Name</Label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handle('name', e.target.value)}
            placeholder="As on passport"
            className={inputCls(errors?.name)}
          />
          <FieldError msg={errors?.name} />
        </div>

        {/* Passport */}
        <div>
          <Label required>Passport Number</Label>
          <input
            type="text"
            value={data.passport}
            onChange={(e) => handle('passport', e.target.value.toUpperCase())}
            placeholder="e.g. A1234567"
            className={inputCls(errors?.passport)}
          />
          <FieldError msg={errors?.passport} />
        </div>

        {/* DOB — read only */}
        <div>
          <Label>Date of Birth</Label>
          <input
            type="text"
            value={fmtDob(data.dob)}
            readOnly
            className="w-full bg-[rgba(0,41,98,0.03)] border border-[rgba(0,41,98,0.12)] rounded-xl px-4 py-3 text-[rgba(0,41,98,0.65)] text-sm cursor-not-allowed"
          />
        </div>

        {/* Age — read only */}
        <div>
          <Label>Age</Label>
          <input
            type="text"
            value={data.age != null ? `${data.age} years` : '—'}
            readOnly
            className="w-full bg-[rgba(0,41,98,0.03)] border border-[rgba(0,41,98,0.12)] rounded-xl px-4 py-3 text-[rgba(0,41,98,0.65)] text-sm cursor-not-allowed"
          />
        </div>

        {/* Gender */}
        <div className="sm:col-span-2">
          <Label required>Gender</Label>
          <div className="flex gap-3 flex-wrap">
            {['Male', 'Female', 'Other'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handle('gender', g)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${data.gender === g
                    ? 'bg-gold text-navy border-gold'
                    : 'bg-[rgba(0,41,98,0.04)] text-[rgba(0,41,98,0.7)] border-[rgba(0,41,98,0.10)] hover:border-gold/40 hover:text-gold'}`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                  ${data.gender === g ? 'border-navy bg-navy/10' : 'border-[rgba(0,41,98,0.45)] bg-[rgba(0,41,98,0.06)]'}`}>
                  {data.gender === g && <span className="w-2 h-2 rounded-full bg-navy" />}
                </span>
                {g}
              </button>
            ))}
          </div>
          <FieldError msg={errors?.gender} />
        </div>
      </div>
    </div>
  );
}
