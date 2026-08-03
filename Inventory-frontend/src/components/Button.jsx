import Loader from "./Loader";

const variants = {
  primary: "bg-brand-600 hover:bg-brand-800 text-white",
  secondary: "bg-white hover:bg-brand-50 text-brand-900 border border-brand-100",
  ghost: "bg-transparent hover:bg-brand-50 text-brand-600",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const sizes = {
  sm: "py-1.5 px-3 text-xs",
  md: "py-2.5 px-4 text-sm",
  lg: "py-3 px-6 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = true,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`${fullWidth ? "w-full" : "w-auto"} rounded-lg font-medium flex items-center
                 justify-center gap-2 transition-transform active:scale-[0.98]
                 disabled:opacity-70 disabled:cursor-not-allowed
                 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader size={size === "sm" ? 12 : 14} />}
      {children}
    </button>
  );
}