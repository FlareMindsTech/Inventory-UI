import { useEffect, useState } from "react";
import { useSettings } from "../../hook/useSetting";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/card";
import Input from "../../components/input";
import Button from "../../components/Button";

export default function SettingsPage() {
  const { settings, isLoading, fetchSettings, updateInvoicePrefix, updateShopInfo } = useSettings();
  const { showToast } = useToast();

  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [shop, setShop] = useState({ shopName: "", address: "", phone: "", gstNumber: "" });

  const [savingPrefix, setSavingPrefix] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);


  useEffect(() => {
    if (settings) {
      setInvoicePrefix(settings.invoicePrefix ?? "");
      setShop({
        shopName: settings.shopName ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        gstNumber: settings.gstNumber ?? "",
      });
    }
  }, [settings]);

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

  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const previewPrefix = (invoicePrefix || "TXT").toUpperCase();

  return (
    <div className="w-full min-h-screen bg-brand-50">
      <div className="bg-white border-b border-brand-100 px-6 py-5">
        <p className="text-xl font-bold text-brand-900">Settings</p>
        <p className="text-sm text-brand-400">Manage your shop details and invoice numbering</p>
      </div>

      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-5">
        {/* Shop information */}
        <Card title="Shop information">
          <p className="text-xs text-brand-400 -mt-2 mb-4">
            This appears on every invoice you generate
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Shop name"
              value={shop.shopName}
              onChange={(e) => setShop((p) => ({ ...p, shopName: e.target.value }))}
              placeholder="ABC Textiles"
            />
            <Input
              label="Phone"
              value={shop.phone}
              onChange={(e) => setShop((p) => ({ ...p, phone: e.target.value }))}
              placeholder="9876543210"
            />
            <Input
              label="Address"
              value={shop.address}
              onChange={(e) => setShop((p) => ({ ...p, address: e.target.value }))}
              placeholder="Coimbatore"
            />
            <Input
              label="GST number"
              value={shop.gstNumber}
              onChange={(e) => setShop((p) => ({ ...p, gstNumber: e.target.value }))}
              placeholder="33ABCDE1234F1Z5"
            />
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-brand-100">
            <Button onClick={handleSaveShop} isLoading={savingShop} className="w-auto px-6">
              {savingShop ? "Saving..." : "Save shop information"}
            </Button>
          </div>
        </Card>

        {/* Invoice prefix */}
        <Card title="Invoice numbering">
          <p className="text-xs text-brand-400 -mt-2 mb-4">
            Set the prefix used when generating new invoice numbers
          </p>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Invoice prefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="TXT"
              />
            </div>
            <div className="flex-1 mb-0.5">
              <p className="text-xs font-medium text-brand-400 mb-1.5">Preview</p>
              <div className="h-10 flex items-center px-3 rounded-lg bg-brand-50 border border-brand-100">
                <span className="text-sm font-mono text-brand-900">
                  {previewPrefix}-{datePart}-001
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-brand-100">
            <Button onClick={handleSavePrefix} isLoading={savingPrefix} className="w-auto px-6">
              {savingPrefix ? "Saving..." : "Save prefix"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}