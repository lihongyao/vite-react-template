import DataPicker from '@/components/ui/DataPicker';
import { LOCALE_CONFIG, SUPPORTED_LOCALES } from '@/i18n/config';
import { useCurrentLocale, useSwitchLocale } from '@/i18n/navigation';
import { cn } from '@/libs/class-helpers';
import { ROUTE_PATHS } from '@/routes/paths';

const localeOptions = SUPPORTED_LOCALES.map((value) => ({
  label: LOCALE_CONFIG[value].label,
  value,
}));

interface LanguageSwitcherProps {
  className?: string;
  title?: string;
  closeAriaLabel?: string;
}

export default function LanguageSwitcher({
  className,
  title = 'Language',
  closeAriaLabel = 'Close language picker',
}: LanguageSwitcherProps) {
  const locale = useCurrentLocale();
  const switchLocale = useSwitchLocale(ROUTE_PATHS.Home);

  return (
    <DataPicker
      title={title}
      items={localeOptions}
      closeAriaLabel={closeAriaLabel}
      triggerClassName={cn('flex min-h-10 items-center gap-2 text-sm text-[#737780]', className)}
      renderItem={(option) => (
        <span className={option.value === locale ? 'font-semibold text-[#168653]' : ''}>
          {option.label}
        </span>
      )}
      onClick={(option) => switchLocale(option.value, { replace: true })}
    >
      <span>{LOCALE_CONFIG[locale].label}</span>
      <span aria-hidden className="text-lg leading-none text-[#B3B8C1]">
        ›
      </span>
    </DataPicker>
  );
}
