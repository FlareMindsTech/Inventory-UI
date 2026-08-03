import { Store } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { AutoReport } from "./reportsViews";

export default function RetailInventoryReportPage() {
  const { retailInventory, getRetailInventoryReport } = useReports();
  return (
    <ReportView
      title="Retail Inventory Report" icon={Store} accentBg="bg-violet-50" accentText="text-violet-600"
      data={retailInventory.data} loading={retailInventory.loading} error={retailInventory.error}
      onFetch={getRetailInventoryReport}
      renderBody={(data) => <AutoReport data={data} accent="text-violet-600" />}
    />
  );
}