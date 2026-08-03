import { useState, useRef, useEffect } from "react";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isSameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}

function isInRange(day, start, end) {
  if (!start || !end) return false;
  return day > start && day < end;
}

function getDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startOffset = firstDay.getDay();
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startDate || new Date());
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState(null); // "start" | "end" | null
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDayClick = (day) => {
    if (!day) return;

    if (!startDate || (startDate && endDate)) {
      // starting a fresh selection
      onChange({ start: day, end: null });
      setSelecting("end");
    } else if (startDate && !endDate) {
      if (day < startDate) {
        onChange({ start: day, end: startDate });
      } else {
        onChange({ start: startDate, end: day });
      }
      setSelecting(null);
      setIsOpen(false);
    }
  };

  const previewEnd = selecting === "end" && hoverDate && startDate && hoverDate > startDate ? hoverDate : endDate;
  const previewStart = selecting === "end" && hoverDate && startDate && hoverDate < startDate ? hoverDate : startDate;

  const days = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());

  const changeMonth = (delta) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const clearRange = (e) => {
    e.stopPropagation();
    onChange({ start: null, end: null });
    setSelecting(null);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-white border border-brand-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-900 flex items-center gap-2 hover:bg-brand-50"
      >
        <span>📅</span>
        {startDate ? (
          <span>
            {formatDate(startDate)} {endDate ? `– ${formatDate(endDate)}` : "– ..."}
          </span>
        ) : (
          <span>Date range</span>
        )}
        {startDate && (
          <span
            onClick={clearRange}
            className="ml-1 text-brand-400 hover:text-brand-700 cursor-pointer"
          >
            ✕
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-2 bg-white border border-brand-100 rounded-xl shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => changeMonth(-1)} className="px-2 py-1 rounded hover:bg-brand-50 text-brand-600">‹</button>
            <p className="text-sm font-semibold text-brand-900">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <button type="button" onClick={() => changeMonth(1)} className="px-2 py-1 rounded hover:bg-brand-50 text-brand-600">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-center text-xs text-brand-400 font-medium py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={i} />;

              const isStart = isSameDay(day, previewStart);
              const isEnd = isSameDay(day, previewEnd);
              const inRange = isInRange(day, previewStart, previewEnd);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverDate(day)}
                  onClick={() => handleDayClick(day)}
                  className={`h-8 text-xs rounded-full flex items-center justify-center transition-colors
                    ${isStart || isEnd ? "bg-brand-600 text-white font-semibold" : ""}
                    ${inRange ? "bg-brand-100 text-brand-900" : ""}
                    ${!isStart && !isEnd && !inRange ? "hover:bg-brand-50 text-brand-900" : ""}
                    ${isToday && !isStart && !isEnd ? "ring-1 ring-brand-300" : ""}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-brand-100">
            <p className="text-xs text-brand-400">
              {!startDate ? "Click a start date" : !endDate ? "Click an end date" : "Range selected"}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}