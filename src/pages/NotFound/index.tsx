import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useAppNavigation } from '@/i18n/navigation';
import { ROUTE_PATHS } from '@/routes/paths';

export default function Page() {
  const { switchTab } = useAppNavigation();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center text-[#202124]">
      <div className="w-full max-w-[320px] -translate-y-4">
        <img src="/logo.png" alt="" className="mx-auto size-12 rounded-lg" />

        <p className="mt-8 text-[88px] leading-none font-bold text-[#168653]">404</p>

        <div className="mx-auto mt-5 h-px w-12 bg-[#DDE3E0]" aria-hidden="true" />

        <h1 className="mt-6 text-2xl leading-8 font-bold">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-[#737780]">
          The page you are looking for may have moved or no longer exists.
        </p>

        <Button
          block
          className="mt-8"
          prefix={<Icon name="tabbar_home" className="size-5" />}
          onClick={() => void switchTab(ROUTE_PATHS.Home)}
        >
          Go to home
        </Button>
      </div>
    </main>
  );
}
