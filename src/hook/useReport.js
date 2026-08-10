
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardSummary,
  fetchSalesReport,
  fetchInventoryReport,
  fetchFactoryInventoryReport,
  fetchRetailInventoryReport,
  fetchStockTransferReport,
  fetchGstReport,
  fetchProfitReport,
  fetchLowStockReport,
  fetchBestSellingReport,
  fetchStaffSales,
} from "../features/reports/reportslice";

export function useReports() {
  const dispatch = useDispatch();
  const reports = useSelector((state) => state.reports);

  const getDashboardSummary = useCallback(() => dispatch(fetchDashboardSummary()), [dispatch]);
  const getSalesReport = useCallback(
    (startDate, endDate) => dispatch(fetchSalesReport({ startDate, endDate })),
    [dispatch]
  );
  const getInventoryReport = useCallback(() => dispatch(fetchInventoryReport()), [dispatch]);
  const getFactoryInventoryReport = useCallback(() => dispatch(fetchFactoryInventoryReport()), [dispatch]);
  const getRetailInventoryReport = useCallback(() => dispatch(fetchRetailInventoryReport()), [dispatch]);
  const getStockTransferReport = useCallback(
    (startDate, endDate) => dispatch(fetchStockTransferReport({ startDate, endDate })),
    [dispatch]
  );
  const getGstReport = useCallback(
    (startDate, endDate) => dispatch(fetchGstReport({ startDate, endDate })),
    [dispatch]
  );
  const getProfitReport = useCallback(
    (startDate, endDate) => dispatch(fetchProfitReport({ startDate, endDate })),
    [dispatch]
  );
  const getLowStockReport = useCallback(() => dispatch(fetchLowStockReport()), [dispatch]);
  const getBestSellingReport = useCallback(
    (startDate, endDate) => dispatch(fetchBestSellingReport({ startDate, endDate })),
    [dispatch]
  );

  // New
  const getSalesByStaff = useCallback(
    (staffId) => dispatch(fetchStaffSales({ staffId })),
    [dispatch]
  );

  return {
    ...reports,
    getDashboardSummary,
    getSalesReport,
    getInventoryReport,
    getFactoryInventoryReport,
    getRetailInventoryReport,
    getStockTransferReport,
    getGstReport,
    getProfitReport,
    getLowStockReport,
    getBestSellingReport,
    getSalesByStaff,
  };
}