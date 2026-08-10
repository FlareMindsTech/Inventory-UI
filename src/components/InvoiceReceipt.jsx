export default function InvoiceReceipt({ invoice }) {
  return (
    <div className="border border-brand-100 rounded-lg p-5 bg-white max-w-xs mx-auto">
      <div className="text-center mb-4">
        <p className="text-sm font-bold text-brand-900">Threadline</p>
        <p className="text-xs text-brand-400">Retail clothing store</p>
      </div>

      <div className="flex justify-between text-xs text-brand-400 mb-3 pb-3 border-b border-dashed border-brand-100">
        <span>{invoice.id}</span>
        <span>{invoice.date.toLocaleString("en-IN")}</span>
      </div>

      <div className="flex flex-col gap-1.5 mb-3 pb-3 border-b border-dashed border-brand-100">
        {invoice.items.map((item) => (
          <div key={item.id} className="flex justify-between text-xs">
            <span className="text-brand-900">{item.name} × {item.qty}</span>
            <span className="text-brand-900">₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 text-xs">
        <div className="flex justify-between">
          <span className="text-brand-400">Subtotal</span>
          <span className="text-brand-900">₹{invoice.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-400">GST (5%)</span>
          <span className="text-brand-900">₹{invoice.tax}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-2 mt-1 border-t border-brand-100">
          <span className="text-brand-900">Total</span>
          <span className="text-brand-900">₹{invoice.total}</span>
        </div>
      </div>

      <p className="text-center text-[11px] text-brand-400 mt-4 pt-3 border-t border-dashed border-brand-100">
        Paid via {invoice.paymentMethod} · Thank you for shopping with us
      </p>
    </div>
  );
}