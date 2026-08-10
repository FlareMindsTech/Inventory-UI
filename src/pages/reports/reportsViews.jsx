import { Factory, Store, AlertTriangle, Trophy } from "lucide-react";
import {
  isMoneyKey, money, formatValue, humanizeKey, formatDate,
  LedgerLine, StatBlock, StatPill, MiniBars
} from "./reportUtilis";

function AutoTable({ rows, accent }) {
  if (!rows.length) return <p className="text-sm text-neutral-400">No records</p>;
  const columns = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== "object");
  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            {columns.map((col) => (
              <th key={col} className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {humanizeKey(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-neutral-200">
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col} className={`py-2 pr-4 font-mono tabular-nums ${isMoneyKey(col) ? accent : "text-neutral-700"}`}>
                  {formatValue(col, row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AutoReport({ data, accent }) {
  if (data == null) return null;
  if (Array.isArray(data)) return <AutoTable rows={data} accent={accent} />;

  if (typeof data === "object") {
    const entries = Object.entries(data);
    const scalarEntries = entries.filter(([, v]) => typeof v !== "object" || v === null);
    const arrayEntries = entries.filter(([, v]) => Array.isArray(v));
    const nestedObjectEntries = entries.filter(([, v]) => v && typeof v === "object" && !Array.isArray(v));

    return (
      <div>
        {scalarEntries.map(([key, value]) => (
          <LedgerLine key={key} label={humanizeKey(key)} value={formatValue(key, value)} />
        ))}
        {arrayEntries.map(([key, arr]) => (
          <div key={key} className="mt-4 pt-3 border-t border-dashed border-neutral-200">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{humanizeKey(key)}</h4>
            <AutoTable rows={arr} accent={accent} />
          </div>
        ))}
        {nestedObjectEntries.map(([key, obj]) => (
          <div key={key} className="mt-4 pt-3 border-t border-dashed border-neutral-200">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">{humanizeKey(key)}</h4>
            <AutoReport data={obj} accent={accent} />
          </div>
        ))}
      </div>
    );
  }
  return <LedgerLine label="Value" value={formatValue("value", data)} />;
}

export function DashboardReport({ data }) {
  if (!data) return null;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatBlock label="Today's Revenue" value={`₹${money(data.todayRevenue)}`} colorClass="text-emerald-600" />
        <StatBlock label="Today's Bills" value={data.todayBills ?? 0} colorClass="text-sky-600" />
        <StatBlock label="Total Revenue" value={`₹${money(data.totalRevenue)}`} colorClass="text-brand-primary" />
        <StatBlock label="Total Bills" value={data.totalBills ?? 0} colorClass="text-sky-600" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-dashed border-neutral-200">
        <StatPill icon={Factory} label="Factory Stock" value={data.totalFactoryStock ?? 0} bg="bg-amber-50" text="text-amber-600" />
        <StatPill icon={Store} label="Retail Stock" value={data.totalRetailStock ?? 0} bg="bg-violet-50" text="text-violet-600" />
        <StatPill
          icon={AlertTriangle}
          label="Low Stock Items"
          value={data.lowStockProductsCount ?? 0}
          bg={data.lowStockProductsCount > 0 ? "bg-red-50" : "bg-neutral-50"}
          text={data.lowStockProductsCount > 0 ? "text-red-600" : "text-neutral-400"}
        />
      </div>

      {Array.isArray(data.bestSellingProducts) && data.bestSellingProducts.length > 0 && (
        <div className="pt-3 border-t border-dashed border-neutral-200">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2 flex items-center gap-1">
            <Trophy size={12} className="text-fuchsia-500" /> Best Selling
          </h4>
          <div className="space-y-1">
            {data.bestSellingProducts.map((p, i) => (
              <div key={p.productId ?? i} className="flex items-center justify-between text-sm py-1">
                <span className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-fuchsia-50 text-fuchsia-600 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-neutral-700">{p.productName}</span>
                  <span className="text-xs text-neutral-400 font-mono">{p.productId}</span>
                </span>
                <span className="font-mono tabular-nums text-fuchsia-600 font-semibold">
                  {p.quantitySold} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SalesReportDetail({ data }) {
  if (!data) return null;
  const daily = Array.isArray(data.dailyBreakdown) ? data.dailyBreakdown : [];

  return (
    <div>
      {data.period && (
        <p className="text-xs text-neutral-400 font-mono mb-3">
          {formatDate(data.period.start)} — {formatDate(data.period.end)}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-2">
        <StatBlock label="Total Revenue" value={`₹${money(data.totalRevenue)}`} colorClass="text-emerald-600" />
        <StatBlock label="Total Bills" value={data.totalBills ?? 0} colorClass="text-sky-600" />
        <StatBlock label="Qty Sold" value={data.totalQuantitySold ?? 0} colorClass="text-amber-600" />
      </div>

      {daily.length > 0 && (
        <>
          <MiniBars data={daily} labelKey="date" valueKey="revenue" colorClass="bg-emerald-400 group-hover:bg-emerald-500" />
          <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 divide-y divide-dashed divide-neutral-200">
            {daily.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-neutral-600">{formatDate(d.date)}</span>
                <span className="flex items-center gap-4">
                  <span className="text-xs text-sky-600 font-mono">{d.bills} bills</span>
                  <span className="text-emerald-600 font-mono tabular-nums font-semibold">₹{money(d.revenue)}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function InventoryReportDetail({ data }) {
  if (!data) return null;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatBlock label="Total Products" value={data.totalProducts ?? 0} colorClass="text-brand-primary" />
        <StatBlock label="Total Stock Value" value={`₹${money(data.totalStockValue)}`} colorClass="text-emerald-600" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-neutral-200">
        <StatPill icon={Factory} label="Factory Stock" value={data.totalFactoryStock ?? 0} bg="bg-amber-50" text="text-amber-600" />
        <StatPill icon={Store} label="Retail Stock" value={data.totalRetailStock ?? 0} bg="bg-violet-50" text="text-violet-600" />
      </div>

      {(data.totalFactoryStock || data.totalRetailStock) && (
        <div className="mt-4 pt-3 border-t border-dashed border-neutral-200">
          <p className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1.5">Factory vs Retail Split</p>
          <div className="flex w-full h-3 rounded-full overflow-hidden bg-neutral-100">
            {(() => {
              const total = (data.totalFactoryStock ?? 0) + (data.totalRetailStock ?? 0) || 1;
              const factoryPct = ((data.totalFactoryStock ?? 0) / total) * 100;
              return (
                <>
                  <div className="bg-amber-400" style={{ width: `${factoryPct}%` }} />
                  <div className="bg-violet-400 flex-1" />
                </>
              );
            })()}
          </div>
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Factory</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" /> Retail</span>
          </div>
        </div>
      )}
    </div>
  );
}