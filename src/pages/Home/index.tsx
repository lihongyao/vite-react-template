import { useEffect } from 'react';

import { Trans, useTranslation } from 'react-i18next';

import { ApiError, productApi } from '@/api';
import AppHeader from '@/components/features/AppHeader';
import { notification } from '@/components/ui/Notification';

export default function Page() {
  const { t } = useTranslation();
  const [notificationApi] = notification.useNotification();

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const data = await productApi.list({ limit: 10 }, controller.signal);
        console.log('DummyJSON products:', data);
      } catch (error) {
        if (error instanceof ApiError && error.kind === 'canceled') return;
        console.error('Failed to load DummyJSON products:', error);
      }
    };

    void loadProducts();

    return () => controller.abort();
  }, []);

  return (
    <main className="bg-white text-[#222]">
      <AppHeader title="Agent Center" description="Your monthly commission and referral data" />
      <div className="bg-pink-100 px-4">
        <div className="text-[#555]">
          <p>{t('profile.tips')}</p>
          <p>{t('profile.reward1', { point: 120 })}</p>
          <p>
            <Trans
              components={{ tag: <strong className="font-semibold text-[#c0362c]" /> }}
              i18nKey="profile.reward2"
              values={{ point: 320 }}
            />
          </p>
          <button
            type="button"
            className="mt-4 h-10 rounded-md bg-[#222] px-4 text-sm font-medium text-white active:opacity-80"
            onClick={() =>
              notificationApi.success({
                description: 'This is a test notification.',
              })
            }
          >
            Show notification
          </button>
        </div>
      </div>
    </main>
  );
}
