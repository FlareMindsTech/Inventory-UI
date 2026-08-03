// src/pages/Dashboard/OwnerDashboard.jsx

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import {
  AlertCircle, RefreshCw, TrendingUp, Package, Receipt, AlertTriangle,
} from "lucide-react";
import { useReports } from "../../../hook/useReport";
import { money, formatDate } from "../../../pages/reports/reportUtilis";

const COLORS = {
  primary: "#993C1D",
  muted: "#78716C",
  dark: "#3E2318",
  grid: "#E7E5E4",
  amber: "#D97706",
  violet: "#7C3AED",
  red: "#DC2626",
};

// Only endpoints confirmed to exist in reportsAPI are used here:
// getDashboardSummary, getSalesReport, getInventoryReport, getBestSellingReport
export default function OwnerDashboard() {
  const {
    dashboard, sales, inventory, bestSelling,
    getDashboardSummary, getSalesReport, getInventoryReport, getBestSellingReport,
  } = useReports();

  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAll = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const startDate = fmt(start);
    const endDate = fmt(end);

    getDashboardSummary();
    getInventoryReport();
    getSalesReport(startDate, endDate);
    getBestSellingReport?.(startDate, endDate);
    setLastUpdated(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const dash = dashboard.data;
  const salesData = sales.data;
  const inv = inventory.data;
  const bestSellingData = bestSelling?.data;

  const anyLoading = dashboard.loading || sales.loading || inventory.loading;

  const salesTrend = Array.isArray(salesData?.dailyBreakdown)
    ? salesData.dailyBreakdown.map((d) => ({
        day: formatDate(d.date),
        sales: Number(d.revenue) || 0,
      }))
    : [];

  // Prefer bestSelling report if available, fall back to dashboard summary's list
  const bestSellingItems = Array.isArray(bestSellingData)
    ? bestSellingData
    : Array.isArray(bestSellingData?.items)
    ? bestSellingData.items
    : Array.isArray(bestSellingData?.products)
    ? bestSellingData.products
    : Array.isArray(dash?.bestSellingProducts)
    ? dash.bestSellingProducts
    : [];

  const topProducts = bestSellingItems.slice(0, 6).map((p) => ({
    name: p.productName ?? p.name,
    units: Number(p.quantitySold ?? p.quantity ?? 0) || 0,
  }));

  const factoryStock = Number(inv?.totalFactoryStock) || 0;
  const retailStock = Number(inv?.totalRetailStock) || 0;
  const totalProducts = Number(inv?.totalProducts) || 0;
  const lowStockCount = Number(dash?.lowStockProductsCount) || 0;
  const stockTotal = factoryStock + retailStock || 1;

  const stockRadialData = [
    { name: "Factory", value: factoryStock, fill: COLORS.amber, pct: Math.round((factoryStock / stockTotal) * 100) },
    { name: "Retail", value: retailStock, fill: COLORS.violet, pct: Math.round((retailStock / stockTotal) * 100) },
    { name: "Low stock", value: lowStockCount, fill: COLORS.red, pct: totalProducts ? Math.round((lowStockCount / totalProducts) * 100) : 0 },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="w-full min-h-screen bg-brand-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-lg font-medium text-brand-900">Store overview</p>
          <p className="text-xs text-brand-400">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-brand-400">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={loadAll}
            disabled={anyLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-white border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-100 transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={anyLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric cards — from getDashboardSummary + getInventoryReport */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard
          icon={<TrendingUp size={16} />}
          label="Total sales"
          value={dash ? `₹${money(dash.totalRevenue)}` : "—"}
          loading={dashboard.loading}
          error={dashboard.error}
        />
        <MetricCard
          icon={<Receipt size={16} />}
          label="Bills"
          value={dash?.totalBills ?? "—"}
          loading={dashboard.loading}
          error={dashboard.error}
        />
        <MetricCard
          icon={<Package size={16} />}
          label="Products"
          value={inv?.totalProducts ?? "—"}
          loading={inventory.loading}
          error={inventory.error}
        />
        <MetricCard
          icon={<AlertTriangle size={16} />}
          label="Low stock"
          value={dash?.lowStockProductsCount ?? "—"}
          alert={lowStockCount > 0}
          loading={dashboard.loading}
          error={dashboard.error}
        />
      </div>

      {/* Sales trend — from getSalesReport */}
      <Panel title="Sales trend" subtitle="Last 7 days" className="mb-4">
        {sales.loading && <ChartSkeleton />}
        {!sales.loading && sales.error && <ErrorState note="Couldn't load sales trend" onRetry={loadAll} />}
        {!sales.loading && !sales.error && salesTrend.length === 0 && (
          <EmptyChart label="No sales recorded in this period" />
        )}
        {!sales.loading && !sales.error && salesTrend.length > 0 && (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.muted }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.grid}` }}
                formatter={(value) => [`₹${money(value)}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={COLORS.primary}
                strokeWidth={2.5}
                fill="url(#salesFill)"
                dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {/* Top products + Stock status — from getBestSellingReport / getInventoryReport */}
      <div className="grid grid-cols-3 gap-4">
        <Panel className="col-span-2" title="Top selling products">
          {(bestSelling?.loading ?? dashboard.loading) && <ChartSkeleton />}
          {!(bestSelling?.loading ?? dashboard.loading) && (bestSelling?.error ?? dashboard.error) && (
            <ErrorState note="Couldn't load top products" onRetry={loadAll} />
          )}
          {!(bestSelling?.loading ?? dashboard.loading) && !(bestSelling?.error ?? dashboard.error) && topProducts.length === 0 && (
            <EmptyChart label="No sales recorded yet" />
          )}
          {!(bestSelling?.loading ?? dashboard.loading) && !(bestSelling?.error ?? dashboard.error) && topProducts.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 16 }}>
                <CartesianGrid stroke={COLORS.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: COLORS.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: COLORS.dark }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.grid}` }} />
                <Bar dataKey="units" fill={COLORS.primary} radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Stock status">
          {inventory.loading && <ChartSkeleton small />}
          {!inventory.loading && inventory.error && <ErrorState note="Couldn't load stock" onRetry={loadAll} compact />}
          {!inventory.loading && !inventory.error && inv && (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="100%"
                  barSize={10}
                  data={stockRadialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                  <RadialBar dataKey="pct" background={{ fill: COLORS.grid }} cornerRadius={6} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.grid}` }}
                    formatter={(_, __, item) => [item.payload.value, item.payload.name]}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="w-full flex flex-col gap-2 mt-1">
                <LegendRow color={COLORS.amber} label="Factory stock" value={factoryStock} />
                <LegendRow color={COLORS.violet} label="Retail stock" value={retailStock} />
                <LegendRow color={COLORS.red} label="Low stock items" value={lowStockCount} />
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, className = "", children }) {
  return (
    <div className={`bg-white border border-brand-100 rounded-xl p-5 shadow-sm ${className}`}>
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-sm font-medium text-brand-900">{title}</p>
        {subtitle && <p className="text-[11px] text-brand-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value, alert, loading, error }) {
  return (
    <div
      className={`rounded-lg p-4 border transition ${
        alert ? "bg-brand-200/60 border-brand-300" : "bg-white border-brand-100"
      }`}
    >
      <div className="flex items-center gap-1.5 text-brand-400 mb-1.5">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      {loading ? (
        <span className="inline-block w-16 h-5 bg-brand-100 rounded animate-pulse" />
      ) : error ? (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> Failed to load
        </span>
      ) : (
        <p className={`text-xl font-medium ${alert ? "text-red-600" : "text-brand-900"}`}>{value}</p>
      )}
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2 text-brand-400">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="font-medium text-brand-900">{value}</span>
    </div>
  );
}

function ChartSkeleton({ small }) {
  return <div className={`w-full ${small ? "h-24" : "h-[220px]"} bg-brand-100/50 rounded-lg animate-pulse`} />;
}

function EmptyChart({ label }) {
  return (
    <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-sm text-brand-400">
      <Package size={22} className="text-brand-200" />
      {label}
    </div>
  );
}

function ErrorState({ note, onRetry, compact }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-sm text-red-500 ${compact ? "h-24" : "h-[200px]"}`}>
      <AlertCircle size={20} />
      <span>{note}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-xs underline text-brand-700 hover:text-brand-900">
          Try again
        </button>
      )}
    </div>
  );
}