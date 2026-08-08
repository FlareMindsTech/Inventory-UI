import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import productReducer from "../features/products/productSlice";
import barcodeReducer from "../features/barcode/barcodeSlice";
import stockTransferReducer from "../features/stock/stocktransferSlice";
import factoryInventoryReducer from "../features/stock/factorySlice";
import retailReducer from "../features/retail/retailSlice";
import billingReducer from "../features/billing/billingSlice";
import invoiceReducer from "../features/invoice/invoiceSlice";
import customerReducer from "../features/customers/customerSlice";
import salesReducer from "../features/sales/saleSlice";
import reportReducer from "../features/reports/reportslice";
import settingReducer from "../features/setting/settingSlice";
import exchangeReducer from "../features/exchange/exchangeSlice"


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    barcodes: barcodeReducer,
    stockTransfer: stockTransferReducer,
    factoryInventory: factoryInventoryReducer,
      retail: retailReducer,
      billing:billingReducer,
      invoice:invoiceReducer,
      customer:customerReducer,
      sales:salesReducer,
      reports:reportReducer,
      settings:settingReducer,
      exchange:exchangeReducer,
     
  },
});