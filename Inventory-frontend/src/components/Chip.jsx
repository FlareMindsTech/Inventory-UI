export default function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand-200 text-brand-600 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-300/50"
        aria-label={`Remove ${label} filter`}
      >
        ✕
      </button>
    </span>
  );
}