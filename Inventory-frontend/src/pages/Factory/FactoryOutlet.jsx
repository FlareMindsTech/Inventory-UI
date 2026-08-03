import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import StockTransfer from "./StockTransfer";
import TransferHistory from "./TransferHistory";

export default function FactoryOutlet() {
  const [activeTab, setActiveTab] = useState("transfer");

  return (
    <div className="min-h-screen bg-brand-50 p-6">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <ArrowLeftRight className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-page-title">Factory Outlet</p>
          <p className="text-page-subtitle">Manage stock transfers and view transfer history</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            activeTab === "transfer"
              ? "bg-brand-600 text-white"
              : "bg-white border border-brand-100 text-brand-600"
          }`}
        >
          Stock Transfer
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            activeTab === "history"
              ? "bg-brand-600 text-white"
              : "bg-white border border-brand-100 text-brand-600"
          }`}
        >
          Transfer History
        </button>
      </div>

      {activeTab === "transfer" && <StockTransfer />}

      {activeTab === "history" && <TransferHistory />}
    </div>
  );
}