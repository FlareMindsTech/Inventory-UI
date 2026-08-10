export default function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-brand-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-brand-100 text-brand-400 flex items-center justify-center disabled:opacity-40 hover:bg-brand-50"
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center ${
              p === page
                ? "bg-brand-600 text-white"
                : "text-brand-400 hover:bg-brand-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-brand-100 text-brand-400 flex items-center justify-center disabled:opacity-40 hover:bg-brand-50"
        >
          ›
        </button>
      </div>
    </div>
  );
}