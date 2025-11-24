export default function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-200 dark:bg-slate-700 rounded-xl w-12 h-12"></div>
                            <div>
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Metric Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            </div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
                        <div className="h-[400px] bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}