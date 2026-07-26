import CopyIcon from '@/assets/icon/copy.svg?react';
import EditIcon from '@/assets/icon/edit.svg?react';
import AppHeader from '@/components/features/AppHeader';
import { message } from '@/components/ui/Message';

const statistics = [
  { label: 'Wagers', value: '2,100', tone: 'bg-[#EAF8F0] text-[#168653]' },
  { label: 'Wins', value: '1,554', tone: 'bg-[#EEF4FF] text-[#356FC1]' },
  { label: 'Losses', value: '567', tone: 'bg-[#FFF1F0] text-[#C6534C]' },
  { label: 'Wagered', value: 'R$1,000.50', tone: 'bg-[#FFF7E8] text-[#A86A12]' },
];

const accountDetails = [
  { label: 'Account status', value: 'Verified' },
  { label: 'Member since', value: 'May 2024' },
];

export default function Page() {
  const [messageApi] = message.useMessage();

  return (
    <main className="min-h-full bg-[#F4F5F7] pb-6 text-[#202124]">
      <AppHeader title="Profile" description="Account and activity overview" />

      <div className="mx-auto w-full max-w-[720px]">
        <section
          className="flex items-center gap-4 bg-white px-4 py-6"
          aria-label="Profile details"
        >
          <img
            src="/avatar.jpg"
            alt="城南李大爷"
            className="size-20 shrink-0 rounded-full border-4 border-[#EEF0F2] object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl leading-7 font-bold">城南李大爷</h2>
              <span
                className="flex size-7 shrink-0 items-center justify-center text-[#9297A1]"
                title="Edit profile"
              >
                <EditIcon aria-hidden className="size-[15px]" focusable={false} />
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm leading-5 text-[#737780]">
              <span>ID: 1314210</span>
              <button
                type="button"
                aria-label="Copy user ID"
                title="Copy user ID"
                className="flex size-7 cursor-pointer items-center justify-center text-[#737780] transition-colors hover:text-[#168653] active:opacity-60"
                onClick={() => messageApi.success('复制成功')}
              >
                <CopyIcon aria-hidden className="size-[17px]" focusable={false} />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 bg-white py-5" aria-label="Wallet overview">
          <div className="flex min-w-0 flex-col items-center border-r border-[#E8EAED] px-3 text-center">
            <span className="text-xs leading-[18px] font-medium text-[#737780]">
              Available balance
            </span>
            <strong className="mt-1 truncate text-lg leading-7 font-extrabold text-[#202124]">
              R$ 10,665.07
            </strong>
          </div>
          <div className="flex min-w-0 flex-col items-center px-3 text-center">
            <span className="text-xs leading-[18px] font-medium text-[#737780]">Reward points</span>
            <strong className="mt-1 truncate text-lg leading-7 font-extrabold text-[#202124]">
              6,220
            </strong>
          </div>
        </section>

        <section className="mt-3 bg-white px-4 py-5" aria-labelledby="statistics-title">
          <h2 id="statistics-title" className="text-base leading-6 font-bold">
            Statistics
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statistics.map((item) => (
              <div
                key={item.label}
                className={`flex min-h-[82px] min-w-0 flex-col justify-center rounded-lg px-3 ${item.tone}`}
              >
                <span className="text-xs leading-[18px] font-semibold opacity-75">
                  {item.label}
                </span>
                <strong className="mt-1 truncate text-base leading-6 font-extrabold">
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-3 bg-white px-4 py-2" aria-label="Account information">
          {accountDetails.map((item) => (
            <div
              key={item.label}
              className="flex min-h-14 items-center justify-between gap-4 border-b border-[#ECEEF1] last:border-b-0"
            >
              <span className="text-sm font-medium text-[#4C515A]">{item.label}</span>
              <span
                className={
                  item.label === 'Account status'
                    ? 'rounded-md bg-[#EAF8F0] px-2 py-1 text-xs font-semibold text-[#168653]'
                    : 'text-sm text-[#737780]'
                }
              >
                {item.value}
              </span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
