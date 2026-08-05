import { LocalizedLink } from '@/i18n/navigation';
import { ROUTE_PATHS } from '@/routes/paths';

export default function AppHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="app-header sticky top-0 z-10 w-full shrink-0 border-b border-[#e8e8e8] bg-white pt-[env(safe-area-inset-top)]">
      <div className="flex min-h-[76px] w-full items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <img className="size-12" src={'/logo.png'} alt="logo" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg leading-6 font-semibold text-[#181818]">{title}</h1>
              <p className="mt-0.5 truncate text-xs leading-[18px] text-[#737373]">{description}</p>
            </div>
          </div>
        </div>
        <LocalizedLink
          aria-label="Open profile"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#168653] focus-visible:ring-offset-2"
          to={ROUTE_PATHS.Profile}
        >
          <div className="size-12 overflow-hidden rounded-lg bg-gray-300">
            <img className="size-12" src={'/avatar.jpg'} alt="avatar" />
          </div>
        </LocalizedLink>
      </div>
    </header>
  );
}
