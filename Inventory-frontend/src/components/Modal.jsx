export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl border border-brand-100 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-medium text-brand-900">{title}</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-brand-400 hover:bg-brand-50"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}