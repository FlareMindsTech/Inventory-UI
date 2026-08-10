import { Wallet } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { AutoReport } from "./reportsViews";

export default function ProfitReportPage() {
  const { profit, getProfitReport } = useReports();
  return (
    <ReportView
      title="Profit Report" icon={Wallet} accentBg="bg-teal-50" accentText="text-teal-600" needsDate
      data={profit.data} loading={profit.loading} error={profit.error}
      onFetch={getProfitReport}
      renderBody={(data) => <AutoReport data={data} accent="text-teal-600" />}
    />
  );
}