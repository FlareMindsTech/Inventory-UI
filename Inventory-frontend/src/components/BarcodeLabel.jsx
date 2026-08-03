import Barcode from "react-barcode";

export default function BarcodeLabel({ product }) {
  return (
    <div className="border border-brand-100 rounded-lg p-4 pb-6 flex flex-col items-center bg-white">
      <p className="text-sm font-semibold text-brand-900 mb-0.5">{product.name}</p>
     
      <Barcode
        value={product.barcode}
        width={1.4}
        height={50}
        fontSize={12}
        margin={10}
        background="#FFFFFF"
        lineColor="#3E2318"
      />
    </div>
  );
}