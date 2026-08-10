import { AlertTriangle } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { AutoReport } from "./reportsViews";

export default function LowStockReportPage() {
  const { lowStock, getLowStockReport } = useReports();
  return (
    <ReportView
      title="Low Stock Report" icon={AlertTriangle} accentBg="bg-red-50" accentText="text-red-600"
      data={lowStock.data} loading={lowStock.loading} error={lowStock.error}
      onFetch={getLowStockReport}
      renderBody={(data) => <AutoReport data={data} accent="text-red-600" />}
    />
  );
}