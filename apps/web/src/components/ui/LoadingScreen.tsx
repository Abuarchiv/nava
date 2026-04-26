export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <span className="font-bold text-2xl text-gray-900 tracking-tight">nava</span>
      </div>

      {/* Spinner */}
      <div
        className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-600 animate-spin"
        role="status"
        aria-label="Wird geladen"
      />
    </div>
  )
}
