import DataPicker from '@/components/ui/DataPicker';
import { LOCALE_CONFIG, SUPPORTED_LOCALES } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { useCurrentLocale, useSwitchLocale } from '@/i18n/navigation';

const localeOptions = SUPPORTED_LOCALES.map((value) => ({
  label: LOCALE_CONFIG[value].label,
  value,
}));

export default function AppHeader({ title, description }: { title: string; description: string }) {
  const locale = useCurrentLocale();
  const switchLocale = useSwitchLocale();

  const handleLocaleChange = (value: Locale) => {
    void switchLocale(value);
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

        <DataPicker
          title="Language"
          items={localeOptions}
          closeAriaLabel="Close language picker"
          triggerClassName="flex h-10 w-[116px] shrink-0 items-center rounded-md border border-[#d9d9d9] bg-[#f7f7f7] px-3 text-sm font-medium text-[#303030] transition-colors hover:border-[#b7b7b7] hover:bg-white"
          renderItem={(item) => (
            <span className="flex items-center justify-between gap-3">
              <span className={item.value === locale ? 'font-semibold text-[#0f766e]' : ''}>
                {item.label}
              </span>
              {item.value === locale && (
                <span aria-hidden className="text-base leading-none font-semibold text-[#0f766e]">
                  ✓
                </span>
              )}
            </span>
          )}
          onClick={(item) => handleLocaleChange(item.value)}
        >
          <span className="sr-only">Language: </span>
          <span className="min-w-0 flex-1 truncate">{LOCALE_CONFIG[locale].label}</span>
          <span
            aria-hidden
            className="ml-2 size-2 shrink-0 rotate-45 border-r border-b border-current"
          />
        </DataPicker>
      </div>
    </header>
  );
}
