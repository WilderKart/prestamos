export default function LoadingCreditos() {
  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32">
      {/* Hero Header Skeleton */}
      <section className="px-4 pt-4">
        <div className="relative p-10 rounded-[44px] bg-white shadow-xl shadow-black/[0.02] border border-black/[0.03] overflow-hidden animate-pulse">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-black/5 rounded-xl" />
                <div className="w-32 h-3 bg-black/10 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="w-64 h-8 bg-black/5 rounded-2xl" />
                <div className="w-48 h-4 bg-black/5 rounded-full" />
              </div>
            </div>
            <div className="w-32 h-20 bg-black/5 rounded-3xl animate-pulse" />
          </div>
        </div>
      </section>

      {/* Table Skeleton */}
      <section className="px-4 animate-pulse">
        <div className="ios-glass overflow-hidden border-none rounded-[40px] p-8 space-y-6">
          <div className="flex justify-between border-b border-black/5 pb-4">
            <div className="w-24 h-3 bg-black/5 rounded-full" />
            <div className="w-24 h-3 bg-black/5 rounded-full" />
            <div className="w-24 h-3 bg-black/5 rounded-full" />
            <div className="w-24 h-3 bg-black/5 rounded-full" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between py-4">
              <div className="w-40 h-4 bg-black/5 rounded-lg" />
              <div className="w-24 h-4 bg-black/5 rounded-lg" />
              <div className="w-20 h-4 bg-black/5 rounded-full" />
              <div className="w-20 h-4 bg-black/5 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
