export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#EBF4FF] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#378ADD] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  )
}
