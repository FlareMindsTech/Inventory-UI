import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card";
import { ReceiptCard } from "./reportUtilis";

export default function ReportView({
  title, icon, accentBg, accentText, needsDate = false,
  data, loading, error, onFetch, renderBody
}) {
  const navigate = useNavigate();
  const [range, setRange] = useState({ startDate: "2026-07-01", endDate: "2026-07-31" });

  useEffect(() => {
    onFetch(range.startDate, range.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runFetch = () => onFetch(range.startDate, range.endDate);

  return (
    <div className="w-full min-h-screen bg-brand-50">
      <div className="bg-white border-b border-brand-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/reports")} className="text-brand-400 hover:text-brand-900 text-sm">
            ← Back
          </button>
          <p className="text-xl font-bold text-brand-900">{title}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {needsDate && (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-neutral-500">From</label>
            <input
              type="date"
              value={range.startDate}
              onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))}
              className="border border-neutral-200 rounded px-2 py-1"
            />
            <label className="text-neutral-500">To</label>
            <input
              type="date"
              value={range.endDate}
              onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))}
              className="border border-neutral-200 rounded px-2 py-1"
            />
            <button onClick={runFetch} className="ml-2 px-3 py-1 rounded-full bg-brand-primary text-white text-xs font-medium">
              Apply
            </button>
          </div>
        )}

        <Card>
          <ReceiptCard icon={icon} title={title} accentBg={accentBg} accentText={accentText}>
            {loading && <p className="text-sm text-neutral-400 font-mono">// loading...</p>}
            {!loading && error && <p className="text-sm text-red-500">{error}</p>}
            {!loading && !error && renderBody(data)}
          </ReceiptCard>
        </Card>
      </div>
    </div>
  );
}