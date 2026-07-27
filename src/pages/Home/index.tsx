import { Trans, useTranslation } from 'react-i18next';

import AppHeader from '@/components/features/AppHeader';
import Carousel from '@/components/ui/Carousel';
import { useDialog } from '@/components/ui/Dialog';
import { message } from '@/components/ui/Message';
import { notification } from '@/components/ui/Notification';

const banners = [
  { id: 1, src: '/images/banner/1.jpg', alt: 'Upgrade VIP points for money' },
  { id: 2, src: '/images/banner/2.jpg', alt: 'Flip cards to win prizes' },
  { id: 3, src: '/images/banner/3.jpg', alt: 'Crazy gachapon prizes' },
  { id: 4, src: '/images/banner/4.jpg', alt: 'Daily loss rebate' },
  { id: 5, src: '/images/banner/5.jpg', alt: 'Seven-day check-in reward' },
  { id: 6, src: '/images/banner/6.jpg', alt: 'Three-day daily cashback' },
] as const;

export default function Page() {
  const { t } = useTranslation();
  const dialog = useDialog();
  const [messageApi] = message.useMessage();
  const [notificationApi] = notification.useNotification();

  return (
    <main className="bg-white text-[#222]">
      <AppHeader title="Agent Center" description="Your monthly commission and referral data" />

      <div className="flex flex-col gap-4 px-4 py-3">
        <Carousel
          ariaLabel="Featured promotions"
          autoPlay
          autoPlayDelay={4500}
          className="mx-auto aspect-[1053/585] max-w-[1053px] rounded-md bg-[#003a27]"
          getItemKey={(banner) => banner.id}
          items={banners}
          renderItem={(banner, index) => (
            <img
              alt={banner.alt}
              className="block size-full object-cover"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              height={585}
              loading={index === 0 ? 'eager' : 'lazy'}
              src={banner.src}
              width={1053}
            />
          )}
          speed={500}
        />

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
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="h-10 rounded-md bg-[#222] px-4 text-sm font-medium text-white active:opacity-80"
              onClick={() => messageApi.success('This is a test message.')}
            >
              Show message
            </button>
            <button
              type="button"
              className="h-10 rounded-md bg-[#222] px-4 text-sm font-medium text-white active:opacity-80"
              onClick={() =>
                notificationApi.success({
                  description: 'This is a test notification.',
                })
              }
            >
              Show notification
            </button>
            <button
              type="button"
              className="h-10 rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white active:opacity-80"
              onClick={() =>
                dialog.open('X1Dialog', {
                  props: { message: 'Dialog registry is working.', count: 1 },
                  onAfterClose: ({ reason, stayDurationMs }) => {
                    console.log('X1 closed >>>', { reason, stayDurationMs });
                  },
                })
              }
            >
              Show dialog
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
