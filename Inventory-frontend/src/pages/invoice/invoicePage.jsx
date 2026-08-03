import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useInvoice } from "../../hook/useInvoice";
import { useSettings } from "../../hook/useSetting";
import { useToast } from "../../context/ToastContext";
import aadviLogo from "../../assets/aadvi logo resized.png";

export default function InvoicePage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const { showToast } = useToast();

  const { selectedInvoice, fetchInvoiceById, cancelInvoice, isLoading } = useInvoice();
  const { settings, fetchSettings } = useSettings();

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceById(invoiceId).catch((err) => showToast(err || "Failed to load invoice", "error"));
    }
    fetchSettings().catch(() => {});
  }, [invoiceId]);

  const handlePrint = () => window.print();

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
          <div style={{ marginBottom: 28, borderRadius: 10, overflow: "hidden", border: `1px solid ${c.border}` }}>
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
                {productList.map((item, index) => (
                  <tr 
                    key={item.itemId} 
                    style={{ 
                      borderBottom: `1px solid ${c.border}`,
                      background: index % 2 === 0 ? c.card : c.bg
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontWeight: 600, margin: 0, color: c.heading, fontSize: 13 }}>
                        {item.productName}
                      </p>
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
                ))}
              </tbody>
            </table>
          </div>

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