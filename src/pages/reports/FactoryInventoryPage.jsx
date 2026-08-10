import { Factory } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { AutoReport } from "./reportsViews";

export default function FactoryInventoryReportPage() {
  const { factoryInventory, getFactoryInventoryReport } = useReports();
  return (
    <ReportView
      title="Factory Inventory Report" icon={Factory} accentBg="bg-amber-50" accentText="text-amber-600"
      data={factoryInventory.data} loading={factoryInventory.loading} error={factoryInventory.error}
      onFetch={getFactoryInventoryReport}
      renderBody={(data) => <AutoReport data={data} accent="text-amber-600" />}
    />
  );
}