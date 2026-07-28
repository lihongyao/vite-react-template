import AppHeader from '@/components/features/AppHeader';
import { useCurrentLocale } from '@/i18n/navigation';

export default function Page() {
  const locale = useCurrentLocale();
  return (
    <div>
      <AppHeader title="Agent Center" description="Your monthly commission and referral data" />
      <div className="p-3">Locale： {locale}</div>
    </div>
  );
}
