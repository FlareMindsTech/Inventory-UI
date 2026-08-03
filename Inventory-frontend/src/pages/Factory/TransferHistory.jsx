import { useEffect, useState } from "react";
import { useStockTransfer } from "../../hook/useStockTransfer";
import Card from "../../components/card";
import Table from "../../components/Table";
import { useToast } from "../../context/ToastContext";

export default function TransferHistory() {
  const { history, isLoading, fetchHistory, cancelTransfer } = useStockTransfer();
  const { showToast } = useToast();
  const [localHistory, setLocalHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleReceive = async (transferId) => {
  try {
    await receiveStock(transferId);
    showToast("Stock received successfully", "success");
    fetchTransferHistory();
    fetchRetailInventory();
  } catch (err) {
    showToast(err || "Failed to receive stock", "error");
  }
};
  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      console.log("TRANSFER HISTORY DATA:", data);
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        setLocalHistory(data);
      } 
      // If data has a transfers property
      else if (data?.transfers && Array.isArray(data.transfers)) {
        setLocalHistory(data.transfers);
      }
      // If data has a result property
      else if (data?.result && Array.isArray(data.result)) {
        setLocalHistory(data.result);
      }
      // If data has a data property
      else if (data?.data && Array.isArray(data.data)) {
        setLocalHistory(data.data);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      showToast("Failed to load transfer history", "error");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this transfer?")) return;
    
    try {
      await cancelTransfer(id);
      showToast("Transfer cancelled successfully", "success");
      await loadHistory(); // Refresh the list
    } catch (err) {
      console.error("Failed to cancel transfer:", err);
      showToast("Failed to cancel transfer", "error");
    }
  };

  const columns = [
    { 
      key: "id", 
      label: "Transfer ID", 
      render: (row) => row.id ?? row.transferId ?? row._id ?? "—" 
    },
    { 
      key: "productName", 
      label: "Product", 
      render: (row) => {
        // Try different possible field names
        return row.productName ?? 
               row.product?.productName ?? 
               row.product?.name ?? 
               row.name ?? 
               "—";
      }
    },
    { 
      key: "destination", 
      label: "Destination", 
      render: (row) => {
        // Try different possible field names
        return row.destination ?? 
               row.toLocation ?? 
               row.outlet ?? 
               row.to ?? 
               "—";
      }
    },
    { 
      key: "fromLocation", 
      label: "From", 
      render: (row) => {
        return row.fromLocation ?? row.from ?? "Factory";
      }
    },
    { 
      key: "quantity", 
      label: "Quantity", 
      align: "right", 
      render: (row) => row.quantity ?? row.qty ?? 0 
    },
    { 
      key: "date", 
      label: "Date", 
      align: "center",
      render: (row) => {
        const date = row.date || row.createdAt || row.createdDate || row.transferDate;
        return date ? new Date(date).toLocaleString("en-IN") : "—";
      }
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = row.status || "Completed";
        const statusColors = {
          "Completed": "bg-emerald-50 text-emerald-700",
          "Pending": "bg-yellow-50 text-yellow-700",
          "Cancelled": "bg-red-50 text-red-500",
          "Failed": "bg-red-50 text-red-500",
          "In Progress": "bg-blue-50 text-blue-700"
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-50 text-gray-700"}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "action",
      label: "",
      align: "right",
      render: (row) => {
        const status = row.status || "Completed";
      
        if (status !== "Cancelled" && status !== "Failed") {
          return (
            <button
              onClick={() => handleCancel(row.id ?? row.transferId ?? row._id)}
              className="text-red-500 text-xs font-semibold hover:underline"
            >
              Cancel
            </button>
            
          );
          <button
  onClick={() => handleReceive(row.transferId)}
  className="bg-emerald-500 text-white px-3 py-1 rounded"
>
  Receive
</button>
        }
        return null;
      },
    },
  ];


  const displayData = localHistory.length > 0 ? localHistory : history;

  return (
    <div className="min-h-screen bg-brand-50 p-6">
      <Card title="Transfer History">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-brand-500">
            Total transfers: {displayData.length}
          </p>
          <button
            onClick={loadHistory}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium"
          >
            🔄 Refresh
          </button>
        </div>
        <Table 
          columns={columns} 
          data={displayData} 
          isLoading={isLoading} 
          emptyMessage="No transfer history found." 
        />
      </Card>
    </div>
  );
}