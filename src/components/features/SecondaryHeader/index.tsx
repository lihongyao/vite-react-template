import Icon from '@/components/ui/Icon';
import { useLocalizedNavigate } from '@/i18n/navigation';

export default function SecondaryHeader({ title }: { title: string }) {
  const navigate = useLocalizedNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-[#E8EAED] bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="relative flex h-[76px] items-center justify-center px-14">
        <button
          type="button"
          aria-label="返回上一页"
          className="absolute left-2 flex size-10 cursor-pointer items-center justify-center text-[#30343B] active:opacity-60"
          onClick={() => navigate(-1)}
        >
          <Icon name="arrow_left" className="size-5" />
        </button>
        <h1 className="w-full truncate text-center text-base leading-6 font-bold text-[#202124]">
          {title}
        </h1>
      </div>
    </header>
  );
}
