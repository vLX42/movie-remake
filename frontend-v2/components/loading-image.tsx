export function LoadingImage() {
  return (
    <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-400 text-sm">Generating image...</span>
      </div>
    </div>
  )
}
