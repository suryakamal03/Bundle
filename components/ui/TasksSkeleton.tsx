export default function TasksSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-48"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#2a2a2a]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-2">
            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr,100px,150px,120px] gap-4 px-6 py-3 border-b border-gray-200 dark:border-[#2a2a2a]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded"></div>
          ))}
        </div>
        
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="grid grid-cols-[1fr,100px,150px,120px] gap-4 px-6 py-3 border-b border-gray-200 dark:border-[#2a2a2a] last:border-0"
          >
            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded w-16"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded flex-1"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
