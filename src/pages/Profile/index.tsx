import copy from 'copy-to-clipboard';

import SecondaryHeader from '@/components/features/SecondaryHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/Button/IconButton';
import Icon from '@/components/ui/Icon';
import { message } from '@/components/ui/Message';
import { useAppNavigation } from '@/i18n/navigation';
import { TAB_ROUTE_PATHS } from '@/routes/paths';

const details = [
  { label: 'Account status', value: 'Verified', accent: true },
  { label: 'Email', value: 'gc@example.com' },
];

export default function Page() {
  const [messageApi] = message.useMessage();
  const { switchTab } = useAppNavigation();

  return (
    <div className="bg-[#F4F5F7] text-[#202124]">
      <SecondaryHeader title="Profile" />
      <main className="pb-8">
        <section className="bg-white px-4 py-6">
          <div className="flex items-center gap-4">
            <img
              src="/avatar.jpg"
              alt="城南李大爷"
              className="size-20 shrink-0 rounded-full border-4 border-[#EEF0F2] object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl leading-7 font-bold">城南李大爷</h1>
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-[#737780]">
                <span>ID: 1314210</span>
                <IconButton
                  aria-label="Copy user ID"
                  title="Copy user ID"
                  className="flex size-8 items-center justify-center active:opacity-60"
                  icon={<Icon name="copy" className="size-4" />}
                  onClick={() => {
                    void copy('1314210');
                    messageApi.success('复制成功');
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 bg-white py-5" aria-label="Wallet overview">
          <div className="border-r border-[#E8EAED] px-4 text-center">
            <span className="text-xs text-[#737780]">Available balance</span>
            <strong className="mt-1 block truncate text-lg">R$ 10,665.07</strong>
          </div>
          <div className="px-4 text-center">
            <span className="text-xs text-[#737780]">Reward points</span>
            <strong className="mt-1 block truncate text-lg">6,220</strong>
          </div>
        </section>

        <section className="mt-3 bg-white px-4 py-2" aria-label="Account details">
          {details.map(({ accent, label, value }) => (
            <div
              key={label}
              className="flex min-h-14 items-center justify-between gap-4 border-b border-[#ECEEF1] last:border-b-0"
            >
              <span className="text-sm font-medium text-[#4C515A]">{label}</span>
              <span
                className={
                  accent
                    ? 'rounded-md bg-[#EAF8F0] px-2 py-1 text-xs font-semibold text-[#168653]'
                    : 'text-sm text-[#737780]'
                }
              >
                {value}
              </span>
            </div>
          ))}
        </section>

        <section className="mt-3 bg-white px-4 py-5">
          <h2 className="text-base font-bold">Account security</h2>
          <p className="mt-1 text-sm leading-5 text-[#737780]">
            Your account is protected. Keep your contact details up to date.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8EAED]">
            <div className="h-full w-4/5 rounded-full bg-[#168653]" />
          </div>
        </section>

        <section className="mt-3 px-3">
          <Button
            block
            onClick={() => {
              void switchTab(TAB_ROUTE_PATHS.Home);
            }}
          >
            前往首页
          </Button>
        </section>
      </main>
    </div>
  );
}
