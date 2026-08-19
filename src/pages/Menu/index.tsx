import LanguageSwitcher from '@/components/features/LanguageSwitcher';
import { NavigateToLink } from '@/i18n/navigation';
import { ROUTE_PATHS } from '@/routes/paths';

const quickLinks = ['Popular', 'Favorites', 'Recent'];
const exploreLinks = [
  { label: '交易记录', description: '查看订单与付款状态', to: ROUTE_PATHS.Transactions },
  { label: 'VIP Club' },
  { label: 'Bonus' },
  { label: 'Rewards' },
  { label: 'Tournaments' },
];
const supportLinks = ['Live Support', 'About us'];

function MenuRow({
  description,
  label,
  to,
  trailing,
}: {
  description?: string;
  label: string;
  to?: string;
  trailing?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#30343B]">{label}</span>
        {description ? (
          <span className="mt-0.5 block truncate text-xs text-[#9297A1]">{description}</span>
        ) : null}
      </span>
      {trailing ?? (
        <span aria-hidden className="text-lg leading-none text-[#B3B8C1]">
          ›
        </span>
      )}
    </>
  );

  const className =
    'flex min-h-14 items-center justify-between gap-4 border-b border-[#ECEEF1] px-4 last:border-b-0';

  return to ? (
    <NavigateToLink
      className={`${className} outline-none focus-visible:ring-2 focus-visible:ring-[#168653] focus-visible:ring-inset`}
      to={to}
    >
      {content}
    </NavigateToLink>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default function Page() {
  return (
    <main className="bg-[#F4F5F7] pb-6 text-[#202124]">
      <div className="mx-auto w-full max-w-[720px] px-3 pt-3">
        <section className="flex min-h-32 flex-col justify-end rounded-lg bg-[#163E31] p-5 text-white">
          <span className="text-xs font-bold text-[#9DE0BD]">INVITE & EARN</span>
          <h2 className="mt-2 max-w-[300px] text-xl leading-7 font-extrabold">
            Share with friends and unlock more rewards
          </h2>
        </section>

        <label className="mt-3 flex h-12 items-center gap-3 rounded-lg border border-[#DDE1E6] bg-white px-4">
          <span aria-hidden className="text-xl text-[#9297A1]">
            ⌕
          </span>
          <span className="sr-only">Search menu</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9297A1]"
            placeholder="Search"
            type="search"
          />
        </label>

        <section className="mt-3 grid grid-cols-3 gap-2" aria-label="Quick links">
          {quickLinks.map((label) => (
            <div
              key={label}
              className="flex h-20 items-center justify-center rounded-lg bg-white px-2 text-center text-sm font-bold text-[#4C515A]"
            >
              {label}
            </div>
          ))}
        </section>

        <section className="mt-3 overflow-hidden rounded-lg bg-white" aria-label="Explore">
          {exploreLinks.map((item) => (
            <MenuRow key={item.label} {...item} />
          ))}
        </section>

        <section className="mt-3 flex min-h-24 flex-col justify-center rounded-lg bg-[#163E31] px-5">
          <strong className="text-lg text-white">Download APP</strong>
          <span className="mt-1 text-sm text-[#9DE0BD]">Claim an exclusive bonus.</span>
        </section>

        <section
          className="mt-3 overflow-hidden rounded-lg bg-white"
          aria-label="Support and settings"
        >
          {supportLinks.map((label) => (
            <MenuRow key={label} label={label} />
          ))}
          <MenuRow label="Language" trailing={<LanguageSwitcher />} />
        </section>
      </div>
    </main>
  );
}
