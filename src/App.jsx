import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/auth/loginPage";
import { useAuth } from "./hook/useAuth";
import DashboardLayout from "./components/layouts/dashboardLayout";
import OwnerDashboard from "./pages/auth/dashboard/ownerDashboard";
import StaffDashboard from "./pages/auth/dashboard/staffDashboard";
import ProductPage from "./pages/auth/product/productPage";
import FactoryOutlet from './pages/Factory/FactoryOutlet';
import BillingPage from "./pages/billing/Billingpage";
import StaffList from "./pages/staff/StaffPage";
import CategoryList from "./pages/catlog.js/catagoriesList";
import BrandList from "./pages/catlog.js/BrandList";
import RetailInventoryPage from "./pages/retail/retailInventoryPage";
import InvoiceListPage from "./pages/invoice/invoiceListPage";
import InvoicePage from "./pages/invoice/invoicePage";
import CustomerPage from "./pages/customer/customerPage";
import SalesPage from "./pages/sales/salespage";
import ProtectedRoute from "./routes/protectedRoutes";
import PageLoader from "./components/pageLoader";
import ExchangeProducts from "./pages/exchange/exchangePage"

//Reports
import ReportsHomePage from "./pages/reports/reportsHomePage";
import DashboardReportPage from "./pages/reports/DashboardReportPage";
import SalesReportPage from "./pages/reports/SalesReportPage";
import InventoryReportPage from "./pages/reports/InventoryPage";
import FactoryInventoryReportPage from "./pages/reports/FactoryInventoryPage";
import RetailInventoryReportPage from "./pages/reports/RetailInventoryReportPage";
import StockTransferReportPage from "./pages/reports/StockTranferReport";
import ProfitReportPage from "./pages/reports/profitReportPage";
import LowStockReportPage from "./pages/reports/LowStockReportPage";
import BestSellingReportPage from "./pages/reports/BestSellingReportPage";
import SettingsPage from "./pages/settings/settingPage";

export default function App() {
  const { user } = useAuth();
  const userRole = user?.roleName?.toLowerCase() || user?.role?.toLowerCase();

  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <PageLoader isLoading={isLoading} logoSrc="src/assets/aadvi logo resized.png" />

      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={userRole === "staff" ? <StaffDashboard /> : <OwnerDashboard />}
            />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/factory-inventory" element={<FactoryOutlet />} />
            <Route path="/retail-inventory" element={<RetailInventoryPage />} />
            <Route element={<ProtectedRoute allowedRoles={["owner", "admin"]} />}>
              <Route path="/staff" element={<StaffList />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/invoices" element={<InvoiceListPage />} />
              <Route path="/invoices/:invoiceId" element={<InvoicePage />} />
              <Route path="/brands" element={<BrandList />} />
              <Route path="/customers" element={<CustomerPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
               <Route path="/returns" element={<ExchangeProducts />} />

              {/*Reports */}
              <Route path="/reports" element={<ReportsHomePage />} />
              <Route path="/reports/dashboard" element={<DashboardReportPage />} />
              <Route path="/reports/sales" element={<SalesReportPage />} />
              <Route path="/reports/inventory" element={<InventoryReportPage />} />
              <Route path="/reports/factoryInventory" element={<FactoryInventoryReportPage />} />
              <Route path="/reports/retailInventory" element={<RetailInventoryReportPage />} />
              <Route path="/reports/stockTransfer" element={<StockTransferReportPage />} />
              <Route path="/reports/profit" element={<ProfitReportPage />} />
              <Route path="/reports/lowStock" element={<LowStockReportPage />} />
              <Route path="/reports/bestSelling" element={<BestSellingReportPage />} />

            </Route>
          </Route>
        </Route>

        {/* Invalid Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}