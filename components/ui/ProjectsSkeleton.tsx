export default function ProjectsSkeleton() {
  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)] overflow-hidden animate-pulse">
      {/* Left Sidebar Skeleton */}
      <div className="w-80 flex-shrink-0 space-y-4">
        {/* Project List Skeleton */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-6">
          <div className="h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-gray-200 dark:border-[#2a2a2a] rounded-lg">
                <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity Skeleton */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-6">
          <div className="h-6 bg-gray-200 dark:bg-[#2a2a2a] rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-[#2a2a2a] rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Area Skeleton */}
      <div className="flex-1">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-[#2a2a2a] p-6">
          <div className="h-8 bg-gray-200 dark:bg-[#2a2a2a] rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-[#2a2a2a] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
