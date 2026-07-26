import { LOCALE_CONFIG, SUPPORTED_LOCALES, isLocale } from '@/i18n/config';
import { useCurrentLocale, useSwitchLocale } from '@/i18n/navigation';

export default function AppHeader({ title, description }: { title: string; description: string }) {
  const locale = useCurrentLocale();
  const switchLocale = useSwitchLocale();

  const handleLocaleChange = (value: string) => {
    if (isLocale(value)) void switchLocale(value);
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-[#e8e8e8] bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="flex min-h-[76px] w-full items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span aria-hidden className="h-10 w-1 shrink-0 rounded-full bg-emerald-500" />
          <div className="min-w-0">
            <h1 className="truncate text-lg leading-6 font-semibold text-[#181818]">{title}</h1>
            <p className="mt-0.5 truncate text-xs leading-[18px] text-[#737373]">{description}</p>
          </div>
        </div>

        <select
          aria-label="Language"
          className="h-10 w-[116px] shrink-0 cursor-pointer rounded-md border border-[#d9d9d9] bg-[#f7f7f7] px-3 text-sm font-medium text-[#303030] transition-colors outline-none hover:border-[#b7b7b7] hover:bg-white focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20"
          value={locale}
          onChange={(event) => handleLocaleChange(event.target.value)}
        >
          {SUPPORTED_LOCALES.map((item) => (
            <option key={item} value={item}>
              {LOCALE_CONFIG[item].label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
