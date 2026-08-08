const partnerBrands = [
  {
    name: 'Luma Coffee',
    category: '餐饮',
    benefit: '每周赠饮 1 杯',
    mark: 'L',
    markClassName: 'bg-[#EAF8F0] text-[#168653]',
  },
  {
    name: 'Nord Hotel',
    category: '旅行',
    benefit: '会员价低至 85 折',
    mark: 'N',
    markClassName: 'bg-[#FDEEDB] text-[#A85A12]',
  },
  {
    name: 'Aura Spa',
    category: '生活',
    benefit: '到店护理 9 折',
    mark: 'A',
    markClassName: 'bg-[#F1EBFA] text-[#7651A8]',
  },
  {
    name: 'Move Studio',
    category: '运动',
    benefit: '免费体验课 1 次',
    mark: 'M',
    markClassName: 'bg-[#E8F3FA] text-[#33759B]',
  },
] as const;

export default function Page() {
  return (
    <main className="bg-[#F4F5F7] px-3 pt-4 pb-6 text-[#202124]">
      <section className="rounded-lg bg-[#163E31] px-5 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs leading-4 font-bold text-[#9DE0BD] uppercase">Gold Member</p>
            <h1 className="mt-2 text-2xl leading-8 font-extrabold">品牌礼遇</h1>
            <p className="mt-1 text-sm leading-5 text-[#C5DDCF]">精选合作品牌，会员专享优惠。</p>
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl font-black text-[#C7EACF]">
            G
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-[#D7E9DE]">
          <strong className="text-base text-white">4</strong>
          <span>项礼遇当前可用</span>
        </div>
      </section>

      <section className="mt-4" aria-labelledby="brand-list-title">
        <div className="flex items-center justify-between px-1">
          <h2 id="brand-list-title" className="text-base font-bold">
            合作品牌
          </h2>
          <span className="text-xs text-[#9297A1]">本月精选</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {partnerBrands.map((brand) => (
            <article key={brand.name} className="min-w-0 rounded-lg bg-white p-4">
              <div
                className={`flex size-10 items-center justify-center rounded-lg text-base font-black ${brand.markClassName}`}
                aria-hidden
              >
                {brand.mark}
              </div>
              <span className="mt-4 block text-[11px] leading-4 font-semibold text-[#9297A1]">
                {brand.category}
              </span>
              <h3 className="mt-0.5 truncate text-sm leading-5 font-bold">{brand.name}</h3>
              <p className="mt-1 text-xs leading-5 text-[#5F646D]">{brand.benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg bg-white px-4 py-4" aria-labelledby="brand-note-title">
        <h2 id="brand-note-title" className="text-sm font-bold">
          使用说明
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#737780]">
          到店或结算前出示会员身份即可使用；具体优惠以合作品牌当日规则为准。
        </p>
      </section>
    </main>
  );
}
