export default function Select({ label, options, value, onChange, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`border border-brand-100 rounded-lg px-3 py-2 text-sm text-brand-900 bg-white
                 focus:outline-none focus:ring-2 focus:ring-brand-400 ${className}`}
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}