import { useCurrentLocale } from '@/i18n/navigation';

export default function Page() {
  const locale = useCurrentLocale();
  return (
    <div>
      <div className="p-3">Locale： {locale}</div>
    </div>
  );
}
