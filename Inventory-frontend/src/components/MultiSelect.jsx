import { useState, useRef, useEffect } from "react";

export default function MultiSelect({ label, placeholder = "Select options", options, values = [], onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  const displayLabel =
    values.length === 0
      ? (label || placeholder)
      : values.length === 1
      ? values[0]
      : `${values.length} selected`;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full border border-brand-100 rounded-lg px-3 py-2 text-sm bg-white
                   flex items-center justify-between gap-2
                   focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <span className={values.length === 0 ? "text-brand-400" : "text-brand-900"}>
          {displayLabel}
        </span>
        <span className="text-brand-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-brand-100 rounded-lg shadow-sm py-1 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 text-sm text-brand-900 cursor-pointer hover:bg-brand-50"
            >
              <input
                type="checkbox"
                checked={values.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="accent-brand-600 w-3.5 h-3.5"
              />
              {opt}
            </label>
          ))}
          {values.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-2 text-xs text-brand-600 hover:bg-brand-50 border-t border-brand-100 mt-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}