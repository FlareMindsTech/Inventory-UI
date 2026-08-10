import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ToastProvider } from "./context/ToastContext";
import App from "./App";
import { ProductProvider } from "./context/productContext";
import {TransferProvider} from "./context/TransferContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import{RetailProvider} from "./context/RetailContext"
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
     <Provider store={store}>
      <ToastProvider>
    <ProductProvider>
      <TransferProvider>
        <RetailProvider>
      <InvoiceProvider>
      <App />
      </InvoiceProvider>
      </RetailProvider>
      </TransferProvider>
      </ProductProvider>
      </ToastProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);