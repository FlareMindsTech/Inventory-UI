import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useInvoice } from "../../hook/useInvoice";
import { useSettings } from "../../hook/useSetting";
import { useExchange } from "../../hook/useExchange";
import { useToast } from "../../context/ToastContext";
import aadviLogo from "../../assets/aadvi logo resized.png";

export default function InvoicePage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const { showToast } = useToast();

  const { selectedInvoice, fetchInvoiceById, cancelInvoice, isLoading } = useInvoice();
  const { settings, fetchSettings } = useSettings();


  const { history, loadExchangeHistory } = useExchange();

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceById(invoiceId).catch((err) => showToast(err || "Failed to load invoice", "error"));
    }
    fetchSettings().catch(() => {});
  }, [invoiceId]);

  useEffect(() => {
   
    loadExchangeHistory({ page: 1, status: "" }).catch(() => {});
    
  }, []);

  const handlePrint = () => window.print();

  const handleThermalPrint = () => {
  if (!selectedInvoice) return;

  const {
    invoiceNumber,
    createdAt,
    billDetails,
    customerDetails,
    productList,
  } = selectedInvoice;

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  document.body.appendChild(iframe);

  const receiptItems = productList
    .map(
      (item) => `
        <tr>
          <td class="product">
            ${item.productName}
            <small>${item.productCode || ""}</small>
          </td>
          <td class="qty">${item.quantity}</td>
          <td class="amount">₹${Number(item.total).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: #fff;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            font-size: 12px;
            padding: 4mm;
          }

          .receipt {
            width: 72mm;
            margin: 0 auto;
          }

          .center {
            text-align: center;
          }

          .shop-logo {
            width: 28mm;
            height: auto;
            object-fit: contain;
            margin-bottom: 2mm;
          }

          .shop-name {
            font-size: 18px;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
          }

          .subtitle {
            font-size: 10px;
            margin: 1mm 0;
          }

          .shop-info {
            font-size: 9px;
            line-height: 1.4;
          }

          .divider {
            border-top: 1px dashed #000;
            margin: 3mm 0;
          }

          .invoice-title {
            font-size: 16px;
            font-weight: 800;
            margin: 2mm 0;
          }

          .info {
            width: 100%;
            font-size: 10px;
            line-height: 1.6;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            gap: 4mm;
          }

          .info-row span:last-child {
            text-align: right;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2mm;
          }

          th {
            border-bottom: 1px solid #000;
            padding: 2mm 0;
            font-size: 9px;
          }

          td {
            padding: 2mm 0;
            vertical-align: top;
            font-size: 10px;
          }

          .product {
            width: 48%;
          }

          .product small {
            display: block;
            font-size: 8px;
            margin-top: 1mm;
          }

          .qty {
            width: 15%;
            text-align: center;
          }

          .amount {
            width: 37%;
            text-align: right;
          }

          .totals {
            margin-top: 2mm;
            font-size: 10px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5mm 0;
          }

          .grand-total {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            margin-top: 1mm;
            padding: 3mm 0;
            font-size: 15px;
            font-weight: 800;
          }

          .payment {
            margin-top: 3mm;
            font-size: 10px;
          }

          .footer {
            margin-top: 5mm;
            text-align: center;
            font-size: 9px;
            line-height: 1.5;
          }

          .thank-you {
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 1mm;
          }

          @media print {
            body {
              width: 80mm;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt">

          <div class="center">
            <img
              src="${aadviLogo}"
              class="shop-logo"
              alt="Logo"
            />

            <div class="shop-name">
              ${shopName}
            </div>

            <div class="subtitle">
              Premium Quality Fabrics
            </div>

            <div class="shop-info">
              ${shopAddress}
              ${shopPhone ? `<br />${shopPhone}` : ""}
              <br />
              GST: ${shopGstNumber}
            </div>
          </div>

          <div class="divider"></div>

          <div class="center invoice-title">
            TAX INVOICE
          </div>

          <div class="info">
            <div class="info-row">
              <strong>Invoice:</strong>
              <span>${invoiceNumber}</span>
            </div>

            <div class="info-row">
              <strong>Bill No:</strong>
              <span>${billDetails.billNumber}</span>
            </div>

            <div class="info-row">
              <strong>Date:</strong>
              <span>
                ${new Date(createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="info">
            <div class="info-row">
              <strong>Customer:</strong>
              <span>${customerDetails.customerName}</span>
            </div>

            <div class="info-row">
              <strong>Mobile:</strong>
              <span>${customerDetails.mobile}</span>
            </div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="text-align:left;">ITEM</th>
                <th>QTY</th>
                <th style="text-align:right;">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              ${receiptItems}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals">

            <div class="total-row">
              <span>Subtotal</span>
              <strong>
                ₹${Number(billDetails.subtotal).toFixed(2)}
              </strong>
            </div>

            <div class="total-row">
              <span>GST</span>
              <strong>
                ₹${Number(billDetails.gstAmount).toFixed(2)}
              </strong>
            </div>

            <div class="total-row">
              <span>Discount</span>
              <strong>
                ₹${Number(billDetails.discountAmount).toFixed(2)}
              </strong>
            </div>

            <div class="total-row grand-total">
              <span>GRAND TOTAL</span>
              <span>
                ₹${Number(billDetails.grandTotal).toFixed(2)}
              </span>
            </div>

          </div>

          <div class="payment">

            <div class="info-row">
              <strong>Payment:</strong>
              <span>
                ${billDetails.paymentMethod?.toUpperCase() || "-"}
              </span>
            </div>

            <div class="info-row">
              <strong>Status:</strong>
              <span>
                ${billDetails.paymentStatus || "-"}
              </span>
            </div>

          </div>

          <div class="divider"></div>

          <div class="footer">
            <div class="thank-you">
              THANK YOU!
            </div>

            <div>
              Thank you for shopping with ${shopName}
            </div>

            <div>
              We look forward to serving you again.
            </div>
          </div>

        </div>
      </body>
    </html>
  `;

  iframe.srcdoc = receiptHtml;

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 300);
  };
};

  const handleDownloadPdf = async () => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${selectedInvoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      showToast("Failed to download PDF", "error");
    }
  };

  const handleCancelInvoice = async () => {
    try {
      await cancelInvoice(selectedInvoice.invoiceId, "Customer cancelled");
      showToast("Invoice cancelled", "success");
    } catch (err) {
      showToast(err || "Failed to cancel invoice", "error");
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600 }}>
        Loading Invoice...
      </div>
    );
  }

  if (!selectedInvoice) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Invoice not found.
      </div>
    );
  }

  const { invoiceNumber, invoiceStatus, createdAt, generatedBy, billDetails, customerDetails, productList } = selectedInvoice;

  // Filter the exchange history down to records for this invoice only.
  // This is purely client-side and does not affect productList/selectedInvoice.
  const exchangesForInvoice = (history || []).filter(
    (row) => row.invoiceNumber === invoiceNumber
  );

  // Shop details from Settings API, with fallbacks in case settings haven't loaded yet
  const shopName = settings?.shopName || "AADVI TEXTILES";
  const shopAddress = settings?.address || "123 Main Road, Coimbatore, Tamil Nadu";
  const shopPhone = settings?.phone || "";
  const shopGstNumber = settings?.gstNumber || "33AAAAA0000A1Z5";

  // Brand Colors
  const c = {
    bg: "white",
    card: "#FFFFFF",
    border: "#E8DCD5",
    primary: "#8B2F1A",
    primaryLight: "#A8553A",
    secondary: "#D4A373",
    heading: "#4A2416",
    text: "#6B4F3E",
    textLight: "#9A7B6B",
    success: "#15803D",
    accent: "#C17A4E",
  };

  return (
    <div className="invoice-page-wrapper" style={{ minHeight: "100vh", background: c.bg, padding: "32px 16px" }}>
      {/* Action Buttons */}
      <div className="no-print" style={{ maxWidth: 1000, margin: "0 auto 20px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button onClick={() => navigate("/invoices")} style={{ padding: "10px 20px", border: `1px solid ${c.border}`, borderRadius: 8, background: c.card, color: c.heading, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={handleCancelInvoice} style={{ padding: "10px 20px", borderRadius: 8, background: "#DC2626", color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>
          Cancel Invoice
        </button>
        <button onClick={handlePrint} style={{ padding: "10px 20px", borderRadius: 8, background: c.primary, color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>
          🖨️ Print
        </button>
        <button
  onClick={handleThermalPrint}
  style={{
    padding: "10px 20px",
    borderRadius: 8,
    background: "#111827",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
  }}
>
  🧾 Thermal Print
</button>
        <button onClick={handleDownloadPdf} style={{ padding: "10px 20px", borderRadius: 8, background: c.primary, color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}>
          ⬇️ Download PDF
        </button>
      </div>

      {/* Main Invoice */}
      <div
        ref={invoiceRef}
        id="invoice"
        className="print-root"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          background: c.card,
          borderRadius: 16,
          padding: 50,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo Watermark - Centered behind content */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.04,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <img 
            src={aadviLogo} 
            alt="logo" 
            style={{ 
              width: 400, 
              height: 400, 
              objectFit: "contain" 
            }} 
          />
        </div>

        {/* Content - sits above watermark */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ borderBottom: `2px solid ${c.primary}`, paddingBottom: 24, marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <img 
                    src={aadviLogo} 
                    alt={shopName} 
                    style={{ height: 60, width: "auto", objectFit: "contain" }} 
                  />
                  <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: c.primary, margin: 0, letterSpacing: 1 }}>
                      {shopName}
                    </h1>
                    <p style={{ fontSize: 13, color: c.text, margin: "4px 0 0" }}>
                      Premium Quality Fabrics
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ background: c.primary, padding: "8px 20px", borderRadius: 6 }}>
                  <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: 2 }}>
                    INVOICE
                  </h2>
                </div>
                <p style={{ fontSize: 13, margin: "10px 0 0", color: c.heading }}>
                  <strong>Invoice No:</strong> {invoiceNumber}
                </p>
                <p style={{ fontSize: 13, margin: 2, color: c.heading }}>
                  <strong>Bill No:</strong> {billDetails.billNumber}
                </p>
                <p style={{ fontSize: 13, margin: 2, color: c.heading }}>
                  <strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <p style={{ fontSize: 13, color: c.text, margin: 0 }}>
                {shopAddress}{shopPhone ? ` · ${shopPhone}` : ""}
              </p>
              <p style={{ fontSize: 13, color: c.text, margin: 0 }}>GST: {shopGstNumber}</p>
            </div>
          </div>

          {/* Customer & Payment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, padding: 20, background: c.bg }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: c.primary, fontSize: 15, textTransform: "uppercase", letterSpacing: 1 }}>
                Customer Details
              </h3>
              <p style={{ margin: "0 0 6px", fontSize: 14, color: c.heading }}>
                <strong>Name:</strong> {customerDetails.customerName}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: c.heading }}>
                <strong>Mobile:</strong> {customerDetails.mobile}
              </p>
            </div>
            <div style={{ border: `1px solid ${c.border}`, borderRadius: 10, padding: 20, background: c.bg }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: c.primary, fontSize: 15, textTransform: "uppercase", letterSpacing: 1 }}>
                Payment Details
              </h3>
              <p style={{ margin: "0 0 6px", fontSize: 14, color: c.heading }}>
                <strong>Status:</strong> 
                <span style={{ color: c.success, fontWeight: 600, marginLeft: 8 }}>
                  {billDetails.paymentStatus}
                </span>
              </p>
              <p style={{ margin: "0 0 6px", fontSize: 14, color: c.heading }}>
                <strong>Method:</strong> {billDetails.paymentMethod}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: c.heading }}>
                <strong>Invoice Status:</strong> 
                <span style={{ color: c.primary, fontWeight: 600, marginLeft: 8, textTransform: "capitalize" }}>
                  {invoiceStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ marginBottom: exchangesForInvoice.length > 0 ? 16 : 28, borderRadius: 10, overflow: "hidden", border: `1px solid ${c.border}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: c.primary }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    Product
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    Qty
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    Price
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    GST
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "right", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {productList.map((item, index) => {
                  // Match this line item to an exchange record by product name.
                  // NOTE: matching on name rather than an id, because the exchange
                  // history records only give us productName — not a productId we
                  // could match more reliably. If two different line items on the
                  // same invoice happen to share a product name, both would get
                  // tagged even if only one was actually exchanged. Fine for now
                  // given what the API returns.
                  const wasReturned = exchangesForInvoice.some(
                    (ex) => ex.productName === item.productName
                  );

                  return (
                  <tr 
                    key={item.itemId} 
                    style={{ 
                      borderBottom: `1px solid ${c.border}`,
                      background: index % 2 === 0 ? c.card : c.bg
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontWeight: 600, margin: 0, color: c.heading, fontSize: 13 }}>
                          {item.productName}
                        </p>
                        {wasReturned && (
                          <span
                            className="no-print"
                            title="This item was returned/exchanged on this invoice"
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "#FBEFE6",
                              color: c.primary,
                              border: `1px solid ${c.secondary}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Exchanged
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: c.textLight, margin: "2px 0 0" }}>
                        {item.productCode}
                      </p>
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13, color: c.heading }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13, color: c.heading }}>
                      ₹{item.price}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 13, color: c.heading }}>
                      {item.gst}%
                    </td>
                    <td style={{ textAlign: "right", paddingRight: 16, fontWeight: 600, fontSize: 13, color: c.heading }}>
                      ₹{item.total}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Exchange / Return Activity — annotation only, does not alter productList above */}
          {exchangesForInvoice.length > 0 && (
            <div
              className="no-print"
              style={{
                marginBottom: 28,
                borderRadius: 10,
                overflow: "hidden",
                border: `1px solid ${c.border}`,
                background: c.bg,
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: "#FBEFE6",
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    margin: 0,
                    color: c.primary,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Exchange / Return Activity
                </h3>
              </div>
              <div style={{ padding: "4px 16px" }}>
                {/*
                  The exchange history response now includes exchangedFor /
                  exchangedForProduct, so old → new can be shown directly.
                  refundAmount is still always 0 from the backend (confirmed
                  bug), so the amount below uses priceDifference instead,
                  which is populated correctly. Direction (refund vs customer
                  pays) comes from exchangeAction when present, falling back
                  to the sign of priceDifference.
                */}
                {exchangesForInvoice.map((ex, i) => {
                  const oldName = ex.productName ?? "—";
                  const newName = ex.exchangedForProduct?.productName ?? ex.exchangedFor;
                  const dateLabel = ex.date
                    ? new Date(ex.date).toLocaleDateString("en-IN")
                    : "-";
                  const diff = ex.priceDifference;
                  const hasAmount = diff !== undefined && diff !== null && diff !== 0;
                  const isRefund = hasAmount && (diff < 0 || ex.exchangeAction === "Refund Customer");

                  return (
                    <div
                      key={ex.returnId ?? ex._id ?? i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom:
                          i === exchangesForInvoice.length - 1
                            ? "none"
                            : `1px solid ${c.border}`,
                        fontSize: 13,
                        gap: 12,
                      }}
                    >
                      <span style={{ color: c.heading }}>
                        {oldName}
                        {newName && (
                          <>
                            {" "}→{" "}
                            <span style={{ fontWeight: 600 }}>{newName}</span>
                          </>
                        )}
                        {ex.quantity ? ` (x${ex.quantity})` : ""}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
                        {hasAmount && (
                          <span style={{ color: isRefund ? c.success : c.primary, fontWeight: 700, fontSize: 12 }}>
                            {isRefund ? "Refund " : "Pays "}₹{Math.abs(diff).toFixed(2)}
                          </span>
                        )}
                        <span style={{ color: c.textLight, fontSize: 12 }}>
                          {ex.status ? `${ex.status} · ` : ""}
                          {dateLabel}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ width: 340 }}>
              <div style={{ 
                background: c.bg, 
                padding: 20, 
                borderRadius: 10,
                border: `1px solid ${c.border}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${c.border}`, fontSize: 14, color: c.heading }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{billDetails.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${c.border}`, fontSize: 14, color: c.heading }}>
                  <span>GST</span>
                  <span style={{ fontWeight: 600 }}>₹{billDetails.gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${c.border}`, fontSize: 14, color: c.heading }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>₹{billDetails.discountAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 0", fontSize: 22, fontWeight: 800, color: c.primary }}>
                  <span>Grand Total</span>
                  <span>₹{billDetails.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            borderTop: `2px solid ${c.primary}`, 
            marginTop: 40, 
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <p style={{ fontSize: 13, color: c.text, margin: "4px 0" }}>
                <strong>Payment Method:</strong> {billDetails.paymentMethod.toUpperCase()}
              </p>
              <p style={{ fontSize: 13, color: c.text, margin: "4px 0" }}>
                <strong>Generated By:</strong> {generatedBy.username}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ marginLeft: "auto", borderTop: `2px solid ${c.heading}`, width: 200 }} />
              <p style={{ marginTop: 8, fontWeight: 600, fontSize: 13, color: c.heading }}>
                Authorized Signature
              </p>
            </div>
          </div>

          {/* Thank You */}
          <div style={{ 
            marginTop: 32, 
            paddingTop: 24, 
            textAlign: "center",
            borderTop: `1px solid ${c.border}`
          }}>
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 800, 
              color: c.primary, 
              margin: 0,
              letterSpacing: 2
            }}>
              Thank You!
            </h2>
            <p style={{ color: c.text, margin: "8px 0 0", fontSize: 14 }}>
              Thank you for shopping with {shopName}
            </p>
            <p style={{ color: c.textLight, margin: 0, fontSize: 12 }}>
              We look forward to serving you again.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}