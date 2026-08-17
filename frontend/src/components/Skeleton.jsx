const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
        />
      ))}
    </>
  );
};

export const StockCardSkeleton = ({ count = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card !p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-2.5 w-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div>
    <div className="mb-6">
      <div className="h-8 w-36 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-4 w-28 bg-gray-200 rounded-lg animate-pulse mt-2" />
    </div>
    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card text-center sm:text-left">
          <div className="w-10 h-10 bg-gray-200 rounded-2xl animate-pulse mb-3 mx-auto sm:mx-0" />
          <div className="h-8 w-12 bg-gray-200 rounded-lg animate-pulse mx-auto sm:mx-0" />
          <div className="h-3 w-14 bg-gray-200 rounded-lg animate-pulse mt-2 mx-auto sm:mx-0" />
        </div>
      ))}
    </div>
    <div className="card">
      <div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-2.5 w-20 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SearchBarSkeleton = () => (
  <div className="card mb-5 !p-3">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 h-12 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-10 w-48 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-10 w-28 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  </div>
);

export default Skeleton;
