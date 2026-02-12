export function LoadingImage() {
  return (
    <div className="w-64 h-64 bg-noir-card rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-neon-gold border-t-transparent rounded-full animate-spin"></div>
        <span className="text-muted-foreground text-sm">Generating image...</span>
      </div>
    </div>
  )
}
