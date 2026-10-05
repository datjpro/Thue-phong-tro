export default function Loading() {
  return (
    <div aria-busy="true" className="flex animate-pulse flex-col gap-4">
      <div className="h-8 w-48 rounded-control bg-suong" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-panel bg-suong" />
        ))}
      </div>
      <div className="h-16 rounded-panel bg-suong" />
      <div className="h-16 rounded-panel bg-suong" />
    </div>
  );
}
