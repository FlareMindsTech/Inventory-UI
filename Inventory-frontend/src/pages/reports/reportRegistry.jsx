import { LayoutDashboard, TrendingUp, Boxes, Factory, Store, ArrowLeftRight, Percent, Wallet, AlertTriangle, Award } from "lucide-react";

export const REPORTS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, accentBg: "bg-brand-primary/10", accentText: "text-brand-primary", description: "Today's numbers at a glance" },
  { key: "sales", label: "Sales", icon: TrendingUp, accentBg: "bg-emerald-50", accentText: "text-emerald-600", description: "Revenue and bills over a period" },
  { key: "inventory", label: "Inventory", icon: Boxes, accentBg: "bg-sky-50", accentText: "text-sky-600", description: "Stock value and product count" },
  { key: "factoryInventory", label: "Factory Inventory", icon: Factory, accentBg: "bg-amber-50", accentText: "text-amber-600", description: "Stock held at the factory" },
  { key: "retailInventory", label: "Retail Inventory", icon: Store, accentBg: "bg-violet-50", accentText: "text-violet-600", description: "Stock held at retail" },
  { key: "stockTransfer", label: "Stock Transfer", icon: ArrowLeftRight, accentBg: "bg-rose-50", accentText: "text-rose-600", description: "Movement between locations" },
  { key: "gst", label: "GST", icon: Percent, accentBg: "bg-indigo-50", accentText: "text-indigo-600", description: "Tax collected over a period" },
  { key: "profit", label: "Profit", icon: Wallet, accentBg: "bg-teal-50", accentText: "text-teal-600", description: "Margins over a period" },
  { key: "lowStock", label: "Low Stock", icon: AlertTriangle, accentBg: "bg-red-50", accentText: "text-red-600", description: "Products running low" },
  { key: "bestSelling", label: "Best Selling", icon: Award, accentBg: "bg-fuchsia-50", accentText: "text-fuchsia-600", description: "Top movers over a period" }
];