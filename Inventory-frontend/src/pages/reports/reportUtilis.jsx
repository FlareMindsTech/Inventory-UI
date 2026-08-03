import Factory from "lucide-react/dist/esm/icons/factory";
import Store from "lucide-react/dist/esm/icons/store";

export function isMoneyKey(key) {
  return /amount|revenue|total|price|value|profit|tax|gst/i.test(key);
}
export function money(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function formatValue(key, value) {
  if (value == null) return "—";
  if (typeof value === "number") {
    return isMoneyKey(key) ? `₹${money(value)}` : value;
  }
  return String(value);
}
export function humanizeKey(key) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}
export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function LedgerLine({ label, value, colorClass = "text-neutral-700" }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="flex-1 border-b border-dashed border-neutral-300 translate-y-[-3px]" />
      <span className={`font-mono tabular-nums text-sm font-medium ${colorClass}`}>{value}</span>
    </div>
  );
}

export function StatBlock({ label, value, colorClass }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</span>
      <span className={`font-mono tabular-nums text-2xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}

export function StatPill({ icon: Icon, label, value, bg, text }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${bg}`}>
      <Icon size={14} className={text} />
      <div>
        <p className={`text-[10px] uppercase ${text} opacity-70`}>{label}</p>
        <p className={`font-mono font-bold ${text}`}>{value}</p>
      </div>
    </div>
  );
}

export function MiniBars({ data, labelKey, valueKey, colorClass }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 mt-3">
      {data.map((d, i) => {
        const h = Math.max(4, (Number(d[valueKey]) / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className={`w-full rounded-t transition-colors ${colorClass}`}
              style={{ height: `${h}%` }}
              title={`${d[labelKey]}: ₹${money(d[valueKey])}`}
            />
            <span className="text-[9px] text-neutral-400 truncate w-full text-center">
              {formatDate(d[labelKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ReceiptCard({ icon: Icon, title, accentBg, accentText, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex gap-1 px-4 pt-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-neutral-200" />
        ))}
      </div>
      <div className="px-5 pt-3 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center justify-center w-6 h-6 rounded-md ${accentBg} ${accentText}`}>
            <Icon size={14} />
          </span>
          <h2 className={`text-sm font-semibold tracking-wide uppercase ${accentText}`}>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}