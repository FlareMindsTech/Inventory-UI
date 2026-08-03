import { Award } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { AutoReport } from "./reportsViews";

export default function BestSellingReportPage() {
  const { bestSelling, getBestSellingReport } = useReports();
  return (
    <ReportView
      title="Best Selling Report" icon={Award} accentBg="bg-fuchsia-50" accentText="text-fuchsia-600" needsDate
      data={bestSelling.data} loading={bestSelling.loading} error={bestSelling.error}
      onFetch={getBestSellingReport}
      renderBody={(data) => <AutoReport data={data} accent="text-fuchsia-600" />}
    />
  );
}