export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-neutral-100 rounded-md ${className}`}
    />
  );
}