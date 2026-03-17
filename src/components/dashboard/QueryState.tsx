export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-rose-600/30 bg-rose-600/10 p-4 text-sm text-rose-200">
      {message ?? "An unexpected error occurred."}
    </div>
  )
}

export function LoadingState() {
  return <p className="text-muted-foreground text-sm">Loading...</p>
}
