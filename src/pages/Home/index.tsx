import { useRef, useState } from 'react';

import { Trans, useTranslation } from 'react-i18next';

import AddressPicker from '@/components/ui/AddressPicker';
import type {
  AddressPickerDataProps,
  AddressPickerModelProps,
} from '@/components/ui/AddressPicker';
import Button from '@/components/ui/Button';
import CalendarSelect from '@/components/ui/CalendarSelect';
import type { CalendarSelectRange } from '@/components/ui/CalendarSelect';
import Carousel from '@/components/ui/Carousel';
import CityPicker from '@/components/ui/CityPicker';
import DataPicker from '@/components/ui/DataPicker';
import DateLeasePicker from '@/components/ui/DateLeasePicker';
import type { DateLeasePickerRef, DateLeasePickerResult } from '@/components/ui/DateLeasePicker';
import DatePicker from '@/components/ui/DatePicker';
import { useDialog } from '@/components/ui/Dialog';
import DragView from '@/components/ui/DragView';
import Input from '@/components/ui/Forms/Input';
import PhoneInput from '@/components/ui/Forms/PhoneInput';
import Gallery from '@/components/ui/Gallery';
import type { GalleryDownloadHandler, GalleryImageSlide } from '@/components/ui/Gallery';
import Icon from '@/components/ui/Icon';
import Loading from '@/components/ui/Loading';
import LoadingWithLogo from '@/components/ui/LoadingWithLogo';
import { message } from '@/components/ui/Message';
import { notification } from '@/components/ui/Notification';
import { QRCodeImg } from '@/components/ui/QRCode';
import Steps from '@/components/ui/Steps';
import type { StepsItem } from '@/components/ui/Steps';
import Tabs from '@/components/ui/Tabs';
import type { TabsItemProps } from '@/components/ui/Tabs';
import { cn } from '@/libs/class-helpers';

const banners = [
  { id: 1, src: '/images/banner/1.jpg', alt: 'Upgrade VIP points for money' },
  { id: 2, src: '/images/banner/2.jpg', alt: 'Flip cards to win prizes' },
  { id: 3, src: '/images/banner/3.jpg', alt: 'Crazy gachapon prizes' },
  { id: 4, src: '/images/banner/4.jpg', alt: 'Daily loss rebate' },
  { id: 5, src: '/images/banner/5.jpg', alt: 'Seven-day check-in reward' },
  { id: 6, src: '/images/banner/6.jpg', alt: 'Three-day daily cashback' },
] as const;

const gallerySlides = [
  {
    src: 'https://img123.engames.com/cdn-cgi/image/format=auto,q=80,dpr=2,w=388,h=auto,blur=0/602/128a9a9651634ee09ed7dc6682604f2d.jpg',
    alt: 'Gallery image 1',
    download: {
      url: 'https://img123.engames.com/cdn-cgi/image/format=auto,q=100,dpr=2,w=1200,h=auto,blur=0/602/128a9a9651634ee09ed7dc6682604f2d.jpg',
      filename: 'gallery-image-1.jpg',
    },
  },
  {
    src: 'https://img123.engames.com/cdn-cgi/image/format=auto,q=80,dpr=2,w=388,h=auto,blur=0/602/e5f7527280c84382899765e6dec540dc.png',
    alt: 'Gallery image 2',
    download: {
      url: 'https://img123.engames.com/cdn-cgi/image/format=auto,q=100,dpr=2,w=1200,h=auto,blur=0/602/e5f7527280c84382899765e6dec540dc.png',
      filename: 'gallery-image-2.png',
    },
  },
  {
    src: 'https://img123.engames.com/cdn-cgi/image/format=auto,q=80,dpr=2,w=388,h=auto,blur=0/602/05a8ac5978f54947908027c43c9f1495.jpg',
    alt: 'Gallery image 3',
    download: {
      url: 'https://img123.engames.com/cdn-cgi/image/format=auto,q=100,dpr=2,w=1200,h=auto,blur=0/602/05a8ac5978f54947908027c43c9f1495.jpg',
      filename: 'gallery-image-3.jpg',
    },
  },
] satisfies readonly GalleryImageSlide[];

const downloadGalleryImage: GalleryDownloadHandler = ({ slide, saveAs: _saveAs }) => {
  console.log('自定义下载 >> ', slide);
  const download = typeof slide.download === 'object' ? slide.download : undefined;

  window.Telegram?.WebApp?.downloadFile?.({
    url: download?.url ?? slide.src,
    file_name: download?.filename ?? 'image',
  });
  // saveAs(download?.url ?? slide.src, download?.filename);
};

const addressOptions: Record<string, AddressPickerModelProps[]> = {
  '': [
    { code: 'sichuan', name: '四川省' },
    { code: 'guangdong', name: '广东省' },
    { code: 'zhejiang', name: '浙江省' },
  ],
  sichuan: [
    { code: 'chengdu', name: '成都市' },
    { code: 'mianyang', name: '绵阳市' },
    { code: 'leshan', name: '乐山市' },
  ],
  guangdong: [
    { code: 'guangzhou', name: '广州市' },
    { code: 'shenzhen', name: '深圳市' },
    { code: 'foshan', name: '佛山市' },
  ],
  zhejiang: [
    { code: 'hangzhou', name: '杭州市' },
    { code: 'ningbo', name: '宁波市' },
    { code: 'wenzhou', name: '温州市' },
  ],
  chengdu: [
    { code: 'wuhou', name: '武侯区' },
    { code: 'jinjiang', name: '锦江区' },
    { code: 'chenghua', name: '成华区' },
  ],
  mianyang: [
    { code: 'fucheng', name: '涪城区' },
    { code: 'youxian', name: '游仙区' },
  ],
  leshan: [
    { code: 'shizhong', name: '市中区' },
    { code: 'shawan', name: '沙湾区' },
  ],
  guangzhou: [
    { code: 'tianhe', name: '天河区' },
    { code: 'yuexiu', name: '越秀区' },
  ],
  shenzhen: [
    { code: 'nanshan', name: '南山区' },
    { code: 'futian', name: '福田区' },
  ],
  foshan: [
    { code: 'chancheng', name: '禅城区' },
    { code: 'shunde', name: '顺德区' },
  ],
  hangzhou: [
    { code: 'xihu', name: '西湖区' },
    { code: 'gongshu', name: '拱墅区' },
  ],
  ningbo: [
    { code: 'haishu', name: '海曙区' },
    { code: 'yinzhou', name: '鄞州区' },
  ],
  wenzhou: [
    { code: 'lucheng', name: '鹿城区' },
    { code: 'longwan', name: '龙湾区' },
  ],
};

const fetchAddressOptions = (code: string) => Promise.resolve(addressOptions[code] ?? []);

const demoTabs: TabsItemProps[] = [
  { key: 'overview', title: 'Overview' },
  { key: 'activity', title: 'Activity', badge: 3 },
  { key: 'rewards', title: 'Rewards' },
  { key: 'history', title: 'History' },
  { key: 'disabled', title: 'Disabled', disabled: true },
  { key: 'settings', title: 'Settings' },
];

const demoTabContents = [
  'Overview content is active.',
  'Activity content is active.',
  'Rewards content is active.',
  'History content is active.',
  'This disabled tab cannot be selected.',
  'Settings content is active.',
];

const defaultSteps: StepsItem[] = [
  {
    key: 'submitted',
    status: 'success',
    title: 'Submitted',
    description: '2026/07/29 10:12:36',
    icons: {
      default: <Icon name="tips_warning" className="size-5" />,
      success: <Icon name="tips_correct" className="size-5" />,
      error: <Icon name="tips_error" className="size-5" />,
    },
  },
  {
    key: 'reviewed',
    status: 'success',
    title: 'Reviewed',
    description: '2026/07/29 10:18:02',
  },
  {
    key: 'credited',
    title: 'Credited',
    description: 'Your commission is ready to be credited to your game account.',
  },
];

const customIconSteps: StepsItem[] = [
  {
    key: 'submitted',
    status: 'success',
    title: 'Submitted',
    description: '2026/07/29 10:12:36',
  },
  {
    key: 'reviewed',
    status: 'error',
    title: 'Reviewed',
    description: 'The withdrawal request did not pass review.',
  },
  {
    key: 'credited',
    title: 'Credited',
    description: 'This step has not started yet.',
  },
];

const dataPickerItems = Array.from({ length: 24 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return { id: index + 1, label: `Option ${number}`, code: `ITEM-${number}` };
});

const youtubeUrl = 'https://www.youtube.com/';
const remoteIconUrl = 'https://video.qg5k.com/10210/188c4c688264452c8439c99b56b6ce14.svg';

const validateChinesePhone = (value: string) => {
  if (!value) return 'Please enter a mobile phone number.';
  return /^1[3-9]\d{9}$/.test(value)
    ? undefined
    : 'Please enter a valid Chinese mobile phone number.';
};

const formatCalendarDate = (date?: Date) =>
  date
    ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        date,
      )
    : 'Choose a date';

export default function Page() {
  const dateLeasePickerRef = useRef<DateLeasePickerRef>(null);
  const { t } = useTranslation();
  const dialog = useDialog();
  const [messageApi] = message.useMessage();
  const [notificationApi] = notification.useNotification();
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>();
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressPickerDataProps>();
  const [activeDemoTab, setActiveDemoTab] = useState(0);
  const [telegramUsername, setTelegramUsername] = useState('vite_react');
  const [phoneNumber, setPhoneNumber] = useState('13800138000');
  const [selectedDataItem, setSelectedDataItem] = useState<(typeof dataPickerItems)[number]>();
  const [selectedDateLabel, setSelectedDateLabel] = useState('');
  const [selectedLease, setSelectedLease] = useState<DateLeasePickerResult>();
  const [calendarRange, setCalendarRange] = useState<CalendarSelectRange>(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
    return { from, to: today };
  });
  const [galleryIndex, setGalleryIndex] = useState(-1);
  const selectedAddressLabel = selectedAddress
    ? [selectedAddress.province.name, selectedAddress.city.name, selectedAddress.area.name].join(
        ' / ',
      )
    : undefined;

  return (
    <main className="bg-white text-[#222]">
      <div className="flex flex-col gap-4 px-4 py-3">
        {/* 轮播图 */}
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

        {/* Gallery */}
        <section
          aria-labelledby="gallery-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-white px-4 py-5"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="gallery-demo-title" className="text-base font-semibold text-[#1f2937]">
              Gallery
            </h2>
            <span className="text-xs text-[#6b7280]">{gallerySlides.length} photos</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {gallerySlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Open image ${index + 1}`}
                className="overflow-hidden rounded-md bg-[#f3f4f6] outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
                onClick={() => setGalleryIndex(index)}
              >
                <img
                  alt={slide.alt}
                  className="size-full object-contain transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                  src={slide.src}
                />
              </button>
            ))}
          </div>
        </section>

        <Gallery
          close={() => setGalleryIndex(-1)}
          download={{ download: downloadGalleryImage }}
          index={Math.max(0, galleryIndex)}
          labels={{
            Close: '关闭',
            Download: '下载',
            Next: '下一张',
            Previous: '上一张',
            'Zoom in': '放大',
            'Zoom out': '缩小',
          }}
          on={{ download: () => messageApi.success('Image download started.') }}
          open={galleryIndex >= 0}
          slides={gallerySlides}
          zoom={{ maxZoomPixelRatio: 2 }}
        />

        {/* 国际化 */}
        <section
          aria-labelledby="i18n-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-white px-4 py-5"
        >
          <h2 id="i18n-demo-title" className="mb-3 text-base font-semibold text-[#1f2937]">
            Internationalization
          </h2>
          <div className="border-l-2 border-[#16a34a] bg-[#f7faf8] px-3 py-3 text-sm leading-6 text-[#4b5563]">
            <p>{t('profile.tips')}</p>
            <p>{t('profile.reward1', { point: 120 })}</p>
            <p>
              <Trans
                components={{ tag: <strong className="font-semibold text-[#c0362c]" /> }}
                i18nKey="profile.reward2"
                values={{ point: 320 }}
              />
            </p>
          </div>
        </section>

        {/* Icon */}
        <section
          aria-labelledby="icon-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f7f8fa] px-4 py-5"
        >
          <h2 id="icon-demo-title" className="mb-3 text-base font-semibold text-[#1f2937]">
            Icon
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Icon
              name="tabbar_home"
              className="size-6"
              color="#dc2626"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon
              name="tabbar_casino"
              className="size-6"
              color="#ea580c"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon
              name="tips_correct"
              className="size-6"
              color="#16a34a"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon
              name="tabbar_profile"
              className="size-6"
              color="#db2777"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon
              name="tabbar_sport"
              className="size-6"
              color="#2563eb"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon
              name={remoteIconUrl}
              className="size-6"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon
              name="adult"
              className="size-9"
              wrapperClass="size-10 rounded-md border border-[#e1e5e3] bg-white"
            />
            <Icon name="first_visit_frame" className="h-[52px] w-[142px] max-w-[42vw]" />
          </div>
        </section>

        {/* Steps */}
        <section
          aria-labelledby="steps-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-white px-4 py-5"
        >
          <h2 id="steps-demo-title" className="mb-4 text-base font-semibold text-[#1f2937]">
            Steps
          </h2>
          <div className="grid gap-5">
            <div>
              <h3 className="mb-3 text-xs font-semibold text-[#6b7280] uppercase">Default icons</h3>
              <Steps ariaLabel="Default withdrawal progress" items={defaultSteps} />
            </div>
            <div className="border-t border-[#e5e7eb] pt-5">
              <h3 className="mb-3 text-xs font-semibold text-[#6b7280] uppercase">Custom icons</h3>
              <Steps
                ariaLabel="Failed withdrawal progress"
                icons={{
                  default: <Icon name="tips_warning" className="size-5" />,
                  success: <Icon name="tips_correct" className="size-5" />,
                  error: <Icon name="tips_error" className="size-5" />,
                }}
                items={customIconSteps}
              />
            </div>
          </div>
        </section>

        {/* tabs  */}
        <section
          aria-labelledby="tabs-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f6f8f7] py-4"
        >
          <h2 id="tabs-demo-title" className="mb-3 px-4 text-base font-semibold text-[#1f2937]">
            Tabs
          </h2>
          <Tabs
            ariaLabel="Home demo tabs"
            menus={demoTabs}
            current={activeDemoTab}
            activeTabClassName="text-[#0f766e]"
            className="border-y border-[#e5e7eb]"
            contentClassName="min-h-[72px] bg-white px-4 py-3 text-sm text-[#555]"
            indicatorClassName="bg-[#0f766e]"
            tabListClassName="bg-white"
            onChange={setActiveDemoTab}
            onDisabled={() => messageApi.warning('This tab is disabled.')}
          >
            <p>{demoTabContents[activeDemoTab]}</p>
          </Tabs>
        </section>

        {/* Loading */}
        <section
          aria-labelledby="loading-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-white px-4 py-5"
        >
          <h2 id="loading-demo-title" className="mb-3 text-base font-semibold text-[#1f2937]">
            Loading
          </h2>
          <div className="grid grid-cols-2 items-start gap-4 py-3">
            <Loading
              className="pt-0"
              direction="vertical"
              dotClassName="bg-[#0f766e]"
              tips="Loading..."
              tipsClassName="text-[#0f766e]"
            />
            <LoadingWithLogo className="pt-0" tips="数据加载中" />
          </div>
        </section>

        {/* 功能按钮 */}
        <section
          aria-labelledby="actions-demo-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f7f8fa] px-4 py-5"
        >
          <h2 id="actions-demo-title" className="mb-3 text-base font-semibold text-[#1f2937]">
            Actions
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              block
              loadingText="Loading..."
              onClick={async () => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                messageApi.success('This is a test message.');
              }}
            >
              Show message
            </Button>
            <Button
              block
              onClick={() =>
                notificationApi.success({
                  description: 'This is a test notification.',
                })
              }
            >
              Show notification
            </Button>
            <Button
              block
              cooldownMs={600}
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
            </Button>
            <Button block onClick={() => setCityPickerOpen(true)}>
              {selectedCity ? `City: ${selectedCity}` : 'Choose city'}
            </Button>
            <Button
              block
              className="col-span-2"
              onClick={() =>
                dialog.open('Tips', {
                  maskClosable: false,
                  props: {
                    type: 'warning',
                    title: 'Discard your changes?',
                    description: 'The information you entered on this page has not been saved yet.',
                    confirmText: 'Discard changes',
                    cancelText: 'Keep editing',
                    onConfirm: () => messageApi.success('Changes discarded.'),
                  },
                })
              }
            >
              Show tips
            </Button>
            <Button
              block
              className="col-span-2 justify-start text-left"
              onClick={() => setAddressPickerOpen(true)}
            >
              {selectedAddressLabel ? `Address: ${selectedAddressLabel}` : 'Choose address'}
            </Button>
          </div>
        </section>

        {/* 表单 */}
        <section
          aria-labelledby="input-examples-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f4f7f5] px-4 py-5"
        >
          <h2 id="input-examples-title" className="mb-3 text-base font-semibold text-[#1f2937]">
            Input examples
          </h2>
          <div className="overflow-hidden rounded-lg border border-[#e1e5e3] bg-white px-4 shadow-[0_2px_10px_rgba(31,41,55,0.05)]">
            <div className="grid gap-1.5 border-b border-[#e5e7eb] py-4">
              <label htmlFor="input-demo-basic" className="text-sm font-medium text-[#4b5563]">
                Basic input
              </label>
              <Input id="input-demo-basic" allowClear placeholder="Type something..." />
            </div>

            <div className="grid gap-1.5 border-b border-[#e5e7eb] py-4">
              <label htmlFor="input-demo-telegram" className="text-sm font-medium text-[#4b5563]">
                Telegram username
              </label>
              <Input
                id="input-demo-telegram"
                allowClear
                prefix={<img alt="" className="size-5" src="/telegram.png" />}
                suffix={<span className="text-sm font-normal">@telegram</span>}
                value={telegramUsername}
                onChange={(event) => setTelegramUsername(event.currentTarget.value)}
              />
            </div>

            <div className="grid gap-1.5 border-b border-[#e5e7eb] py-4">
              <label htmlFor="input-demo-email" className="text-sm font-medium text-[#4b5563]">
                Email address
              </label>
              <Input
                id="input-demo-email"
                allowClear
                defaultValue="invalid-address"
                error="Please enter a valid email address."
                type="email"
              />
            </div>

            <div className="grid gap-1.5 border-b border-[#e5e7eb] py-4">
              <label htmlFor="input-demo-phone" className="text-sm font-medium text-[#4b5563]">
                Phone number
              </label>
              <PhoneInput
                id="input-demo-phone"
                allowClear
                countryCode="86"
                maxLength={11}
                placeholder="Enter a Chinese mobile number"
                validate={validateChinesePhone}
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.currentTarget.value)}
              />
            </div>

            <div className="grid gap-1.5 py-4">
              <label htmlFor="input-demo-disabled" className="text-sm font-medium text-[#4b5563]">
                Disabled input
              </label>
              <Input id="input-demo-disabled" disabled value="This field is unavailable" />
            </div>
          </div>
        </section>

        {/* DataPicker */}
        <section
          aria-labelledby="data-picker-example-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f7f8fa] px-4 py-5"
        >
          <h2
            id="data-picker-example-title"
            className="mb-3 text-base font-semibold text-[#1f2937]"
          >
            DataPicker example
          </h2>
          <DataPicker
            title="Choose an option"
            items={dataPickerItems}
            triggerClassName="rounded-lg"
            renderItem={(item) => (
              <div className="flex items-center justify-between gap-3">
                <span
                  className={
                    selectedDataItem?.id === item.id
                      ? 'font-semibold text-[#0f766e]'
                      : 'text-[#374151]'
                  }
                >
                  {item.label}
                </span>
                <span className="shrink-0 text-xs text-[#9ca3af]">{item.code}</span>
              </div>
            )}
            onClick={setSelectedDataItem}
          >
            <span className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#d1d5db] bg-white px-3 text-base">
              <span
                className={
                  selectedDataItem
                    ? 'min-w-0 flex-1 truncate text-[#1f2937]'
                    : 'min-w-0 flex-1 truncate text-[#9ca3af]'
                }
              >
                {selectedDataItem?.label ?? 'Choose an option'}
              </span>
              <span
                aria-hidden
                className="size-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-[#9ca3af]"
              />
            </span>
          </DataPicker>
        </section>

        {/* DatePicker */}
        <section
          aria-labelledby="date-picker-example-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-white px-4 py-5"
        >
          <h2
            id="date-picker-example-title"
            className="mb-3 text-base font-semibold text-[#1f2937]"
          >
            DatePicker example
          </h2>
          <DatePicker
            min={new Date(2000, 0, 1)}
            max={new Date()}
            fields="DAY"
            showNow
            triggerClassName="rounded-lg"
            onChange={(formattedValue, date) => {
              console.log('DatePicker selected:', date);
              setSelectedDateLabel(formattedValue);
            }}
          >
            <span className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#d1d5db] bg-white px-3 text-base">
              <span
                className={cn(
                  'min-w-0 flex-1 truncate',
                  selectedDateLabel ? 'text-[#1f2937]' : 'text-[#9ca3af]',
                )}
              >
                {selectedDateLabel || '请选择日期'}
              </span>
              <span
                aria-hidden
                className="size-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-[#9ca3af]"
              />
            </span>
          </DatePicker>
        </section>

        {/* CalendarSelect */}
        <section
          aria-labelledby="calendar-select-example-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f7f8fa] px-4 py-5"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2
              id="calendar-select-example-title"
              className="text-base font-semibold text-[#1f2937]"
            >
              CalendarSelect example
            </h2>
          </div>
          <CalendarSelect
            allowFutureDates={false}
            labels={{ cancel: 'Cancel', close: 'Close calendar', confirm: 'Confirm' }}
            maxRangeDays={10}
            mode="range"
            title="Select date"
            triggerClassName="rounded-lg border border-[#d6e2da] bg-white px-4 py-4 transition-colors hover:bg-[#fbfcfb]"
            value={calendarRange}
            onChange={(nextRange) => {
              if (nextRange?.from && nextRange.to) setCalendarRange(nextRange);
            }}
          >
            <span className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#7b8b82] uppercase">Start</span>
                <span className="mt-1 block truncate text-xl font-bold text-[#1f2937]">
                  {formatCalendarDate(calendarRange.from)}
                </span>
              </span>
              <span aria-hidden className="h-px w-10 bg-[#a7b8ad]" />
              <span className="min-w-0 text-right">
                <span className="block text-sm font-semibold text-[#7b8b82] uppercase">End</span>
                <span className="mt-1 block truncate text-xl font-bold text-[#1f2937]">
                  {formatCalendarDate(calendarRange.to)}
                </span>
              </span>
            </span>
          </CalendarSelect>
        </section>

        {/* DateLeasePicker */}
        <section
          aria-labelledby="date-lease-picker-example-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-[#f7f8fa] px-4 py-5"
        >
          <h2
            id="date-lease-picker-example-title"
            className="mb-3 text-base font-semibold text-[#1f2937]"
          >
            DateLeasePicker example
          </h2>
          <DateLeasePicker
            ref={dateLeasePickerRef}
            businessHours="09:00 - 18:00"
            minDays={1}
            onNotice={(content) => messageApi.warning(content)}
            onSure={(value) => {
              console.log(JSON.stringify(value));
              setSelectedLease(value);
            }}
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-[#d1d5db] bg-white p-3">
              <button
                type="button"
                className="min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                onClick={() => dateLeasePickerRef.current?.open({ type: 'start' })}
              >
                <span className="block text-xs text-[#6b7280]">取车时间</span>
                <span className="mt-1 block truncate text-sm font-medium text-[#1f2937]">
                  {selectedLease?.start.v ?? '请选择'}
                </span>
              </button>
              <span aria-hidden className="h-px w-6 bg-[#9ca3af]" />
              <button
                type="button"
                className="min-w-0 text-right outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                onClick={() => dateLeasePickerRef.current?.open({ type: 'end' })}
              >
                <span className="block text-xs text-[#6b7280]">还车时间</span>
                <span className="mt-1 block truncate text-sm font-medium text-[#1f2937]">
                  {selectedLease?.end.v ?? '请选择'}
                </span>
              </button>
            </div>
          </DateLeasePicker>
          {selectedLease && (
            <p className="mt-2 text-right text-xs text-[#6b7280]">
              租赁时长：{selectedLease.durations.description}
            </p>
          )}
        </section>

        {/* QRCode */}
        <section
          aria-labelledby="qr-code-example-title"
          className="-mx-4 border-y border-[#e5e7eb] bg-white px-4 py-5"
        >
          <h2 id="qr-code-example-title" className="mb-3 text-base font-semibold text-[#1f2937]">
            QRCode example
          </h2>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-[#e1e5e3] bg-[#f7f8fa] p-4 sm:flex-row">
            <QRCodeImg
              bgColor="#ffffff"
              className="size-40 shrink-0 rounded-lg border border-[#e5e7eb]"
              fgColor="#111827"
              level="M"
              size={160}
              title="YouTube homepage QR code"
              value={youtubeUrl}
            />
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-semibold text-[#1f2937]">YouTube</p>
              <a
                href={youtubeUrl}
                className="mt-1 block max-w-full text-sm break-all text-[#0f766e] underline underline-offset-2"
                rel="noreferrer"
                target="_blank"
              >
                {youtubeUrl}
              </a>
            </div>
          </div>
        </section>
      </div>

      <CityPicker open={cityPickerOpen} onCancel={setCityPickerOpen} onChange={setSelectedCity} />
      <AddressPicker
        open={addressPickerOpen}
        data={selectedAddress}
        onFetch={fetchAddressOptions}
        onSure={setSelectedAddress}
        onCancel={setAddressPickerOpen}
      />

      {/* 拖拽 */}
      <DragView
        ariaLabel="Draggable demo button"
        onPress={() => messageApi.success('Floating control pressed.')}
      >
        <div className="flex size-14 items-center justify-center rounded-full border border-white/70 bg-[#e9a23b] text-xs font-semibold text-[#29200f] shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
          Drag
        </div>
      </DragView>
    </main>
  );
}
