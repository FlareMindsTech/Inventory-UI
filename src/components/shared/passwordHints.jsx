const rules = [
  { label: "At least 6 characters", test: (v) => v.length >= 6 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function PasswordHints({ value }) {
  return (
    <ul className="mt-1.5 space-y-0.5">
      {rules.map(({ label, test }) => {
        const passed = test(value || "");
        return (
          <li
            key={label}
            className={`text-xs flex items-center gap-1.5 ${
              passed ? "text-green-600" : "text-brand-400"
            }`}
          >
            <span>{passed ? "✓" : "○"}</span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}