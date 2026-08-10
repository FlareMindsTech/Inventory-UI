import { LayoutDashboard } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { DashboardReport } from "./reportsViews";

export default function DashboardReportPage() {
  const { dashboard, getDashboardSummary } = useReports();
  return (
    <ReportView
      title="Dashboard" icon={LayoutDashboard} accentBg="bg-brand-primary/10" accentText="text-brand-primary"
      data={dashboard.data} loading={dashboard.loading} error={dashboard.error}
      onFetch={getDashboardSummary}
      renderBody={(data) => <DashboardReport data={data} />}
    />
  );
}