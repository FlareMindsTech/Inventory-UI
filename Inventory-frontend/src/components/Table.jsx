import Skeleton from "./skeleton";

export default function Table({ columns, data, isLoading = false, skeletonRows = 5, emptyMessage = "No records found" }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-xs text-brand-400 text-left border-b border-brand-100">
          {columns.map((col) => (
            <th key={col.key} className={`pb-3 font-normal ${
  col.align === "right"
    ? "text-right"
    : col.align === "center"
    ? "text-center"
    : "text-left"
}`}>
              {col.label}
            </th>
            
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: skeletonRows }).map((_, r) => (
            <tr key={r} className="border-b border-brand-100 last:border-0">
              {columns.map((col, c) => (
                <td key={col.key} className="py-3">
                  <Skeleton className={c === 0 ? "w-9 h-9 rounded-lg" : "h-4 w-3/4"} />
                </td>
              ))}
            </tr>
          ))
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="py-8 text-center text-brand-400 text-sm">
              {emptyMessage}
            </td>
          </tr>
        ) : (
      data.map((row, i) => (
  <tr key={row.id ?? i} className="border-b border-brand-100 last:border-0">
    {columns.map((col) => (
      <td key={col.key} className={`py-3 ${
  col.align === "right"
    ? "text-right"
    : col.align === "center"
    ? "text-center"
    : "text-left"
}`}>
        {col.render ? col.render(row, i) : row[col.key]}
      </td>
    ))}
  </tr>
))
        )}
      </tbody>
    </table>
  );
}