export default function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg w-10 h-10"></div>
                            <div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Metric Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                            <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    ))}
                </div>

                <div className="mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>

                {/* Widgets Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
