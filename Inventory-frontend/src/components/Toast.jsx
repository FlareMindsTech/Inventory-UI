// components/Toast.jsx
export default function Toast({ message, type = "success", onClose }) {
  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "error":
        return "bg-red-50 border-red-200 text-red-700";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "alert":
        return "bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-200";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "alert":
        return "🔴";
      default:
        return "📢";
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg border text-sm font-medium animate-slide-in ${getStyles()}`}
      role="alert"
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-xs opacity-60 hover:opacity-100 transition-opacity ml-2"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
}