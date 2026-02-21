export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black">
      <div className="h-10 w-10 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
      <p className="text-sm text-zinc-500">Loading...</p>
    </div>
  )
}
