import { TrendingUp } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { SalesReportDetail } from "./reportsViews";

export default function SalesReportPage() {
  const { sales, getSalesReport } = useReports();
  return (
    <ReportView
      title="Sales Report" icon={TrendingUp} accentBg="bg-emerald-50" accentText="text-emerald-600" needsDate
      data={sales.data} loading={sales.loading} error={sales.error}
      onFetch={getSalesReport}
      renderBody={(data) => <SalesReportDetail data={data} />}
    />
  );
}