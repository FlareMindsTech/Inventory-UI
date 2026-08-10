export default function Card({ title, action, children, className = "" }) {
  return (
    <div className={`bg-white border border-brand-100 rounded-xl p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <p className="text-sm font-medium text-brand-900">{title}</p>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}