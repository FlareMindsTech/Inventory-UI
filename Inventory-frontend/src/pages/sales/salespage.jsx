// src/pages/Sales/SalesPage.jsx

import { useEffect, useState } from "react";
import { Receipt, TrendingUp, Calendar, CreditCard, Package, IndianRupee } from "lucide-react";
import Card from "../../components/card";
import { useSales } from "../../hook/useSales";

function money(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------- Accent theme per period ---------- */
const THEMES = {
  daily: {
    ring: "ring-amber-200",
    icon: "text-amber-600 bg-amber-50",
    bar: "bg-amber-400",
    barHover: "group-hover:bg-amber-500",
    activeTab: "bg-amber-500 text-white",
    heading: "text-amber-700"
  },
  monthly: {
    ring: "ring-brand-primary/20",
    icon: "text-brand-primary bg-brand-primary/10",
    bar: "bg-brand-primary/70",
    barHover: "group-hover:bg-brand-primary",
    activeTab: "bg-brand-primary text-white",
    heading: "text-brand-primary"
  },
  yearly: {
    ring: "ring-violet-200",
    icon: "text-violet-600 bg-violet-50",
    bar: "bg-violet-400",
    barHover: "group-hover:bg-violet-500",
    activeTab: "bg-violet-600 text-white",
    heading: "text-violet-700"
  }
};

/* ---------- Metric-specific colors ---------- */
const METRIC_COLOR = {
  revenue: "text-emerald-600",
  bills: "text-sky-600",
  qty: "text-amber-600",
  avg: "text-violet-600"
};

/* ---------- Ledger line: label ..... value, receipt-style ---------- */
function LedgerLine({ label, value, colorClass = "text-neutral-700", emphasis = false }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <span className={`text-sm ${emphasis ? "font-semibold text-neutral-800" : "text-neutral-500"}`}>
        {label}
      </span>
      <span className="flex-1 border-b border-dashed border-neutral-300 translate-y-[-3px]" />
      <span
        className={`font-mono tabular-nums ${emphasis ? "text-lg font-bold" : "text-sm font-medium"} ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------- Small stamped badge for payment methods, color-rotated ---------- */
const STAMP_COLORS = [
  "border-emerald-300 bg-emerald-50 text-emerald-700",
  "border-sky-300 bg-sky-50 text-sky-700",
  "border-amber-300 bg-amber-50 text-amber-700",
  "border-violet-300 bg-violet-50 text-violet-700",
  "border-rose-300 bg-rose-50 text-rose-700"
];

function PaymentStamp({ method, amount, index = 0 }) {
  const colorClasses = STAMP_COLORS[index % STAMP_COLORS.length];
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${colorClasses}`}>
      <CreditCard size={12} />
      <span className="text-xs font-medium uppercase tracking-wide">{method}</span>
      <span className="text-xs font-mono opacity-80">₹{money(amount)}</span>
    </div>
  );
}

/* ---------- Receipt card wrapper: perforated top edge, colored ring + icon ---------- */
function ReceiptCard({ icon: Icon, title, subtitle, theme, children }) {
  const t = THEMES[theme] ?? THEMES.monthly;
  return (
    <div className={`relative bg-white rounded-lg shadow-sm border border-neutral-200 ring-1 ${t.ring} overflow-hidden`}>
      <div className="flex gap-1 px-4 pt-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-neutral-200" />
        ))}
      </div>

      <div className="px-5 pt-3 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className={`flex items-center justify-center w-6 h-6 rounded-md ${t.icon}`}>
            <Icon size={14} />
          </span>
          <h2 className={`text-sm font-semibold tracking-wide uppercase ${t.heading}`}>
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs text-neutral-400 mb-3 ml-8">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

/* ---------- Mini bar chart, plain divs, colored per theme ---------- */
function MiniBars({ data, labelKey, valueKey, theme }) {
  const t = THEMES[theme] ?? THEMES.monthly;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 mt-3">
      {data.map((d, i) => {
        const h = Math.max(4, (Number(d[valueKey]) / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className={`w-full rounded-t transition-colors ${t.bar} ${t.barHover}`}
              style={{ height: `${h}%` }}
              title={`${d[labelKey]}: ₹${money(d[valueKey])}`}
            />
            <span className="text-[9px] text-neutral-400 truncate w-full text-center">
              {String(d[labelKey]).slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function SalesPage() {
  const {
    dailySales,
    monthlySales,
    yearlySales,
    getDailySales,
    getMonthlySales,
    getYearlySales,
    isLoading
  } = useSales();

  const [tab, setTab] = useState("daily");

  useEffect(() => {
    getDailySales("2026-07-01", "2026-07-31");
    getMonthlySales(2026);
    getYearlySales();
  }, []);

  const daily = Array.isArray(dailySales) ? dailySales : [];
  const monthly = Array.isArray(monthlySales) ? monthlySales : [];
  const yearly = Array.isArray(yearlySales) ? yearlySales : [];

  const tabs = [
    { key: "daily", label: "Daily", icon: Calendar },
    { key: "monthly", label: "Monthly", icon: TrendingUp },
    { key: "yearly", label: "Yearly", icon: Receipt }
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">

      {/* Header + tab switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Sales Report</h1>
          <p className="text-xs text-neutral-400 font-mono">threadline://ledger</p>
        </div>

        <div className="flex bg-white rounded-full border border-neutral-200 p-1 gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === key ? THEMES[key].activeTab : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-neutral-400 font-mono">// loading ledger...</p>
      )}

      {/* DAILY */}
      {tab === "daily" && (
        <>
          {!isLoading && daily.length === 0 && (
            <Card><p className="text-sm text-neutral-400">No daily sales found</p></Card>
          )}
          {daily.map((day, idx) => (
            <ReceiptCard
              key={idx}
              icon={Calendar}
              theme="daily"
              title={`Daily Sales — ${day.date}`}
              subtitle={`${day.totalBills ?? 0} bill(s) recorded`}
            >
              <LedgerLine label="Total Revenue" value={`₹${money(day.totalRevenue)}`} colorClass={METRIC_COLOR.revenue} emphasis />
              <LedgerLine label="Bills Raised" value={day.totalBills ?? 0} colorClass={METRIC_COLOR.bills} />
              <LedgerLine label="Quantity Sold" value={day.totalQuantitySold ?? 0} colorClass={METRIC_COLOR.qty} />
              <LedgerLine
                label="Avg Bill Value"
                value={`₹${money(day.totalBills ? day.totalRevenue / day.totalBills : 0)}`}
                colorClass={METRIC_COLOR.avg}
              />

              {Array.isArray(day.paymentSummary) && day.paymentSummary.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-dashed border-neutral-200">
                  {day.paymentSummary.map((p, i) => (
                    <PaymentStamp
                      key={i}
                      index={i}
                      method={p.method ?? p.paymentMethod ?? "—"}
                      amount={p.amount ?? p.totalAmount ?? 0}
                    />
                  ))}
                </div>
              )}
            </ReceiptCard>
          ))}
        </>
      )}

      {/* MONTHLY */}
      {tab === "monthly" && (
        <ReceiptCard icon={TrendingUp} theme="monthly" title="Monthly Sales Report" subtitle={`${monthly.length} month(s)`}>
          {monthly.length === 0 && !isLoading && (
            <p className="text-sm text-neutral-400">No monthly sales found</p>
          )}

          {monthly.length > 0 && (
            <MiniBars data={monthly} labelKey="month" valueKey="totalRevenue" theme="monthly" />
          )}

          <div className="mt-4 divide-y divide-dashed divide-neutral-200">
            {monthly.map((m, idx) => (
              <div key={idx} className="py-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-neutral-800">
                    {m.month} {m.year}
                  </span>
                  <span className={`font-mono tabular-nums text-sm font-bold ${METRIC_COLOR.revenue}`}>
                    ₹{money(m.totalRevenue)}
                  </span>
                </div>
                <div className="flex gap-4 text-xs mt-0.5">
                  <span className={`flex items-center gap-1 ${METRIC_COLOR.bills}`}>
                    <Receipt size={11} /> {m.totalBills ?? 0} bills
                  </span>
                  <span className={`flex items-center gap-1 ${METRIC_COLOR.qty}`}>
                    <Package size={11} /> {m.totalQuantitySold ?? 0} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ReceiptCard>
      )}

      {/* YEARLY */}
      {tab === "yearly" && (
        <>
          {!isLoading && yearly.length === 0 && (
            <Card><p className="text-sm text-neutral-400">No yearly sales found</p></Card>
          )}
          {yearly.map((yr, idx) => (
            <ReceiptCard key={idx} icon={Receipt} theme="yearly" title={`Yearly Sales — ${yr.year}`}>
              <LedgerLine label="Total Revenue" value={`₹${money(yr.totalRevenue)}`} colorClass={METRIC_COLOR.revenue} emphasis />
              <LedgerLine label="Total Bills" value={yr.totalBills ?? 0} colorClass={METRIC_COLOR.bills} />
              <LedgerLine
                label="Avg Monthly Revenue"
                value={`₹${money((yr.totalRevenue ?? 0) / 12)}`}
                colorClass={METRIC_COLOR.avg}
              />

              {Array.isArray(yr.monthlyBreakdown) && yr.monthlyBreakdown.length > 0 && (
                <>
                  <MiniBars data={yr.monthlyBreakdown} labelKey="month" valueKey="totalRevenue" theme="yearly" />
                  <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 grid grid-cols-2 sm:grid-cols-3 gap-x-4">
                    {yr.monthlyBreakdown.map((m, i) => (
                      <LedgerLine key={i} label={m.month} value={`₹${money(m.totalRevenue)}`} colorClass={METRIC_COLOR.revenue} />
                    ))}
                  </div>
                </>
              )}
            </ReceiptCard>
          ))}
        </>
      )}

    </div>
  );
}