import { useEffect, useState } from "react";
import { useSettings } from "../../hook/useSetting";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/card";
import Input from "../../components/input";
import Button from "../../components/Button";

export default function SettingsPage() {
  const { settings, isLoading, fetchSettings, updateGst, updateDiscount, updateInvoicePrefix, updateShopInfo } = useSettings();
  const { showToast } = useToast();

  const [gst, setGst] = useState("");
  const [discount, setDiscount] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [shop, setShop] = useState({ shopName: "", address: "", phone: "", gstNumber: "" });

  const [savingGst, setSavingGst] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [savingPrefix, setSavingPrefix] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Populate form fields once settings load — field names guessed as
  // gstPercentage/defaultDiscount/invoicePrefix/shopName/address/phone/gstNumber,
  // matching the update endpoints' bodies. Confirm against the console log on first load.
  useEffect(() => {
    if (settings) {
      setGst(settings.gstPercentage ?? "");
      setDiscount(settings.defaultDiscount ?? "");
      setInvoicePrefix(settings.invoicePrefix ?? "");
      setShop({
        shopName: settings.shopName ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        gstNumber: settings.gstNumber ?? "",
      });
    }
  }, [settings]);

  const handleSaveGst = async () => {
    setSavingGst(true);
    try {
      await updateGst(Number(gst));
      showToast("GST configuration updated", "success");
    } catch (err) {
      showToast(err || "Failed to update GST", "error");
    }
    setSavingGst(false);
  };

  const handleSaveDiscount = async () => {
    setSavingDiscount(true);
    try {
      await updateDiscount(Number(discount));
      showToast("Discount configuration updated", "success");
    } catch (err) {
      showToast(err || "Failed to update discount", "error");
    }
    setSavingDiscount(false);
  };

  const handleSavePrefix = async () => {
    setSavingPrefix(true);
    try {
      await updateInvoicePrefix(invoicePrefix.trim());
      showToast("Invoice prefix updated", "success");
    } catch (err) {
      showToast(err || "Failed to update invoice prefix", "error");
    }
    setSavingPrefix(false);
  };

  const handleSaveShop = async () => {
    setSavingShop(true);
    try {
      await updateShopInfo(shop);
      showToast("Shop information updated", "success");
    } catch (err) {
      showToast(err || "Failed to update shop information", "error");
    }
    setSavingShop(false);
  };

  if (isLoading && !settings) {
    return (
      <div className="w-full min-h-screen bg-brand-50 flex items-center justify-center">
        <p className="text-sm text-brand-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-brand-50">
      <div className="bg-white border-b border-brand-100 px-6 py-5">
        <p className="text-xl font-bold text-brand-900">Settings</p>
        <p className="text-sm text-brand-400">Configure your store's GST, discount, invoicing, and shop details</p>
      </div>

      <div className="p-6 grid grid-cols-2 gap-5">
        {/* Shop information */}
        <Card title="Shop information" className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Shop name" value={shop.shopName} onChange={(e) => setShop((p) => ({ ...p, shopName: e.target.value }))} placeholder="ABC Textiles" />
            <Input label="Phone" value={shop.phone} onChange={(e) => setShop((p) => ({ ...p, phone: e.target.value }))} placeholder="9876543210" />
            <Input label="Address" value={shop.address} onChange={(e) => setShop((p) => ({ ...p, address: e.target.value }))} placeholder="Coimbatore" />
            <Input label="GST number" value={shop.gstNumber} onChange={(e) => setShop((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="33ABCDE1234F1Z5" />
          </div>
          <Button onClick={handleSaveShop} isLoading={savingShop} className="w-auto px-6 mt-4">
            {savingShop ? "Saving..." : "Save shop information"}
          </Button>
        </Card>

        {/* GST */}
        <Card title="Default GST">
          <Input label="GST percentage" type="number" value={gst} onChange={(e) => setGst(e.target.value)} placeholder="12" />
          <Button onClick={handleSaveGst} isLoading={savingGst} className="w-auto px-6">
            {savingGst ? "Saving..." : "Save GST"}
          </Button>
        </Card>

        {/* Discount */}
        <Card title="Default discount">
          <Input label="Discount percentage" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="15" />
          <Button onClick={handleSaveDiscount} isLoading={savingDiscount} className="w-auto px-6">
            {savingDiscount ? "Saving..." : "Save discount"}
          </Button>
        </Card>

        {/* Invoice prefix */}
        <Card title="Invoice numbering" className="col-span-2">
          <Input label="Invoice prefix" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="TXT" />
          <p className="text-xs text-brand-400 -mt-3 mb-4">Invoices will be numbered like {invoicePrefix || "TXT"}-20260721-001</p>
          <Button onClick={handleSavePrefix} isLoading={savingPrefix} className="w-auto px-6">
            {savingPrefix ? "Saving..." : "Save prefix"}
          </Button>
        </Card>
      </div>
    </div>
  );
}