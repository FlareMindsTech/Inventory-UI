import { useEffect, useState } from "react";

export default function PageLoader({ isLoading, logoSrc = "/logo.png" }) {
  const [visible, setVisible] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setFadeOut(false);
    } else if (visible) {
      // start fade-out, then unmount
      setFadeOut(true);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/60 transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoSrc}
          alt="Loading"
          className="h-16 w-16 animate-pulse"
        />
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}