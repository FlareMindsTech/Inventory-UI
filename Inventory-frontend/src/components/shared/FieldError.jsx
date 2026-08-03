const FieldError = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <p
      className={`mt-1 flex items-center gap-1 text-sm text-red-600 ${className}`}
      role="alert"
    >
      <svg
        className="h-3.5 w-3.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      {message}
    </p>
  );
};

export default FieldError;