export default function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="min-w-full">
        <thead className="border-b">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-5 text-left py-3">
                <div className="h-4 bg-gray-200 rounded w-24 relative overflow-hidden">
                  <div className="absolute inset-0 shimmer"></div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-full relative overflow-hidden">
                    <div className="absolute inset-0 shimmer"></div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
