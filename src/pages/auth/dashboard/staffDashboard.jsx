// src/pages/Dashboard/StaffDashboard.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, Receipt } from "lucide-react";
import { useReports } from "../../../hook/useReport";
import { useInvoice } from "../../../hook/useInvoice";
import { money, formatDate } from "../../../pages/reports/reportUtilis";

const PRIMARY = "#993C1D";
const GRID = "#E7E5E4";
const MUTED = "#78716C";

export default function StaffDashboard() {
  const navigate = useNavigate();

 
  const user = useSelector((state) => state.auth?.user);

  const { staffSales, lowStock, getSalesByStaff, getLowStockReport } = useReports();
  const { invoices, isLoading: invoicesLoading, error: invoicesError, fetchInvoices } = useInvoice();

  useEffect(() => {
    if (user?._id) {
      getSalesByStaff(user._id);
    }
    getLowStockReport();
    fetchInvoices(1, 5).catch(() => {});
  }, [user?._id]);

  const sales = staffSales?.data;
  const lowStockData = lowStock?.data;

  const todaySales =
    sales?.totalSales ?? sales?.totalRevenue ?? sales?.total ?? null;

  const lowStockItems = Array.isArray(lowStockData)
    ? lowStockData
    : Array.isArray(lowStockData?.products)
    ? lowStockData.products
    : Array.isArray(lowStockData?.items)
    ? lowStockData.items
    : [];


  const salesTrend = Array.isArray(sales?.dailyBreakdown)
    ? sales.dailyBreakdown.map((d) => ({
        day: formatDate(d.date),
        sales: Number(d.revenue) || 0,
      }))
    : [];


  const invoiceItems = Array.isArray(invoices)
    ? invoices
    : Array.isArray(invoices?.invoices)
    ? invoices.invoices
    : Array.isArray(invoices?.items)
    ? invoices.items
    : [];

  const myInvoices = user?._id
    ? invoiceItems.filter(
        (inv) =>
          !inv.staffId ||
          inv.staffId === user._id ||
          inv.createdBy === user._id
      )
    : invoiceItems;

  const recentBills = myInvoices.slice(0, 5).map((inv, i) => ({
    id: inv._id ?? inv.id ?? i,
    invoiceNumber: inv.invoiceNumber ?? inv.number ?? `#${i + 1}`,
    amount: Number(inv.totalAmount ?? inv.amount ?? inv.grandTotal ?? 0) || 0,
    date: inv.createdAt ?? inv.date,
  }));

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-lg font-medium text-brand-900">Welcome back</p>
        <p className="text-xs text-brand-400">{today}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-4 border border-brand-100">
          <p className="text-xs text-brand-400 mb-1.5">Your sales today</p>
          {staffSales?.loading ? (
            <span className="inline-block w-16 h-5 bg-brand-100 rounded animate-pulse" />
          ) : staffSales?.error ? (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> Failed to load
            </span>
          ) : (
            <p className="text-xl font-medium text-brand-900">
              {todaySales !== null ? `₹${money(todaySales)}` : "₹0"}
            </p>
          )}
        </div>

        <div className="bg-brand-100 rounded-lg p-4">
          <p className="text-xs text-brand-800 mb-1.5">Low stock alerts</p>
          {lowStock?.loading ? (
            <span className="inline-block w-8 h-5 bg-brand-200 rounded animate-pulse" />
          ) : lowStock?.error ? (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> Failed to load
            </span>
          ) : (
            <p className="text-xl font-medium text-brand-900">{lowStockItems.length}</p>
          )}
        </div>
      </div>

      {/* Mini sales trend */}
      <div className="bg-white rounded-lg p-4 border border-brand-100 mb-4">
        <p className="text-xs text-brand-400 mb-2">Your sales trend</p>
        {staffSales?.loading ? (
          <div className="w-full h-16 bg-brand-100/50 rounded animate-pulse" />
        ) : salesTrend.length === 0 ? (
          <div className="h-16 flex items-center justify-center text-xs text-brand-300">
            No trend data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={salesTrend} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="staffSalesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${GRID}` }}
                formatter={(value) => [`₹${money(value)}`, "Sales"]}
                labelStyle={{ color: MUTED }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={PRIMARY}
                strokeWidth={2}
                fill="url(#staffSalesFill)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent bills */}
      <div className="bg-white rounded-lg p-4 border border-brand-100 mb-6">
        <p className="text-xs text-brand-400 mb-3">Recent bills</p>
        {invoicesLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-8 bg-brand-100/50 rounded animate-pulse" />
            ))}
          </div>
        ) : invoicesError ? (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> Failed to load bills
          </span>
        ) : recentBills.length === 0 ? (
          <p className="text-xs text-brand-300">No bills yet today</p>
        ) : (
          <div className="flex flex-col divide-y divide-brand-50">
            {recentBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Receipt size={14} className="text-brand-300" />
                  <span className="text-sm text-brand-900">{bill.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-brand-900">₹{money(bill.amount)}</p>
                  {bill.date && (
                    <p className="text-[10px] text-brand-400">{formatDate(bill.date)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/billing")}
        className="w-full bg-brand-600 hover:bg-brand-800 text-white rounded-lg py-3 text-sm font-medium"
      >
        Start new bill
      </button>
    </div>
  );
}