import { Boxes } from "lucide-react";
import { useReports } from "../../hook/useReport";
import ReportView from "./ReportView";
import { InventoryReportDetail } from "./reportsViews";

export default function InventoryReportPage() {
  const { inventory, getInventoryReport } = useReports();
  return (
    <ReportView
      title="Inventory Report" icon={Boxes} accentBg="bg-sky-50" accentText="text-sky-600"
      data={inventory.data} loading={inventory.loading} error={inventory.error}
      onFetch={getInventoryReport}
      renderBody={(data) => <InventoryReportDetail data={data} />}
    />
  );
}