export default function CobradorDetailLoading() {
  return (
    <div className="ios-page space-y-8 pb-32 animate-pulse">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-2">
        <div className="w-10 h-10 rounded-full bg-black/5" />
        <div className="w-24 h-3 bg-black/5 rounded-full" />
        <div className="w-10" />
      </div>

      {/* ── Profile Hero ── */}
      <section>
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-[44px] flex flex-col items-center gap-6">
          <div className="h-24 w-24 bg-black/5 rounded-[28px]" />
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-48 h-8 bg-black/5 rounded-xl" />
            <div className="w-32 h-4 bg-black/5 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
             <div className="h-14 bg-black/5 rounded-[22px]" />
             <div className="h-14 bg-black/5 rounded-[22px]" />
          </div>
        </div>
      </section>

      {/* ── Operational Metrics ── */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-black/5 h-32 rounded-[32px]" />
        <div className="bg-black/5 h-32 rounded-[32px]" />
      </section>

      {/* ── Basic Information ── */}
      <section className="space-y-4">
        <div className="w-32 h-3 bg-black/5 rounded-full ml-2" />
        <div className="bg-white/50 backdrop-blur-md p-2 rounded-[32px] space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-black/5 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="w-20 h-2 bg-black/5 rounded-full" />
                <div className="w-full h-4 bg-black/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
