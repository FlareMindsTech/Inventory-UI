import { ArrowLeftRight } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { AutoReport } from "./reportsViews";

export default function StockTransferReportPage() {
  const { stockTransfer, getStockTransferReport } = useReports();
  return (
    <ReportView
      title="Stock Transfer Report" icon={ArrowLeftRight} accentBg="bg-rose-50" accentText="text-rose-600" needsDate
      data={stockTransfer.data} loading={stockTransfer.loading} error={stockTransfer.error}
      onFetch={getStockTransferReport}
      renderBody={(data) => <AutoReport data={data} accent="text-rose-600" />}
    />
  );
}