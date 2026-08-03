import Loader from "./Loader";

export default function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Loader size={28} className="text-brand-400" />
    </div>
  );
}