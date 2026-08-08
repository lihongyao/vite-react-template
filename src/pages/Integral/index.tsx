const pointRecords = [
  { title: '每日签到', date: '今天 09:24', points: '+20', positive: true },
  { title: '兑换咖啡券', date: '8 月 6 日', points: '-600', positive: false },
  { title: '完成会员任务', date: '8 月 3 日', points: '+150', positive: true },
] as const;

export default function Page() {
  return (
    <main className="bg-[#F4F5F7] px-3 pt-4 pb-6 text-[#202124]">
      <section className="rounded-lg bg-white px-5 py-5">
        <p className="text-xs leading-4 font-semibold text-[#737780]">可用积分</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <strong className="text-3xl leading-10 font-black text-[#168653]">6,220</strong>
          <span className="mb-1 rounded-md bg-[#EAF8F0] px-2 py-1 text-xs font-semibold text-[#168653]">
            本月 +860
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="font-semibold text-[#4C515A]">距离下一档奖励</span>
          <span className="text-[#9297A1]">还差 780 积分</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EAED]">
          <div className="h-full w-[72%] rounded-full bg-[#168653]" />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3" aria-label="积分概览">
        <div className="rounded-lg bg-[#163E31] px-4 py-4 text-white">
          <span className="text-xs text-[#BBD7C5]">本月已兑换</span>
          <strong className="mt-1 block text-xl">3 份</strong>
        </div>
        <div className="rounded-lg bg-[#FFF4E6] px-4 py-4 text-[#6F4717]">
          <span className="text-xs text-[#9A7040]">即将到期</span>
          <strong className="mt-1 block text-xl">320</strong>
        </div>
      </section>

      <section
        className="mt-4 overflow-hidden rounded-lg bg-white"
        aria-labelledby="point-records-title"
      >
        <div className="flex items-center justify-between border-b border-[#ECEEF1] px-4 py-4">
          <h1 id="point-records-title" className="text-base font-bold">
            最近积分记录
          </h1>
          <span className="text-xs text-[#9297A1]">近 30 天</span>
        </div>
        <div className="px-4">
          {pointRecords.map((record) => (
            <div
              key={`${record.title}-${record.date}`}
              className="flex min-h-16 items-center justify-between gap-4 border-b border-[#ECEEF1] last:border-b-0"
            >
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[#30343B]">{record.title}</h2>
                <p className="mt-1 text-xs text-[#9297A1]">{record.date}</p>
              </div>
              <strong
                className={`shrink-0 text-sm ${record.positive ? 'text-[#168653]' : 'text-[#4C515A]'}`}
              >
                {record.points}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <p className="px-2 pt-4 text-center text-xs leading-5 text-[#9297A1]">
        积分将在获得后的 12 个月内有效。
      </p>
    </main>
  );
}
