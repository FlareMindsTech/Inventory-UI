import { Link } from "react-router-dom";
import { REPORTS } from "./reportRegistry";

export default function ReportsHomePage() {
  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Reports & Analytics</h1>
        <p className="text-xs text-neutral-400 font-mono">threadline://reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(({ key, label, icon: Icon, accentBg, accentText, description }) => (
          <Link
            key={key}
            to={`/reports/${key}`}
            className="group bg-white rounded-lg border border-neutral-200 p-4 hover:border-brand-primary/40 hover:shadow-sm transition-all"
          >
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-md mb-3 ${accentBg} ${accentText}`}>
              <Icon size={18} />
            </span>
            <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-brand-primary transition-colors">
              {label}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}