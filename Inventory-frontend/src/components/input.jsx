// export default function Input({ label, error, className = "", ...props }) {
//   return (
//     <div className="mb-5">
//       {label && (
//         <label className="text-sm font-medium text-brand-900 block mb-1.5">
//           {label}
//         </label>
//       )}
//       <input
//         className={`w-full rounded-lg border border-brand-100 px-4 py-2.5 text-sm
//                    focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
//                    disabled:bg-brand-50 ${error ? "border-red-400" : ""} ${className}`}
//         {...props}
//       />
//       {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
//     </div>
//   );
// }
import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="mb-5">
        {label && (
          <label className="text-sm font-medium text-brand-900 block mb-1.5">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={`w-full rounded-lg border border-brand-100 px-4 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-400
          focus:border-transparent disabled:bg-brand-50
          ${error ? "border-red-400" : ""}
          ${className}`}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-600 mt-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;