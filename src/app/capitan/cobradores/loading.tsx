export default function LoadingCobradores() {
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
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-black/5 rounded-3xl" />
              <div className="w-40 h-14 bg-black/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid List Skeleton */}
      <section className="px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ios-glass p-7 rounded-[40px] border-none flex flex-col gap-6 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-black/5 rounded-[22px]" />
                  <div className="space-y-2">
                    <div className="w-32 h-5 bg-black/5 rounded-lg" />
                    <div className="w-20 h-3 bg-black/5 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-12 bg-black/5 rounded-2xl" />
                <div className="w-full h-12 bg-black/5 rounded-2xl" />
              </div>
              <div className="flex gap-3 mt-2">
                <div className="flex-1 h-14 bg-black/5 rounded-[22px]" />
                <div className="w-14 h-14 bg-black/5 rounded-[22px]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
