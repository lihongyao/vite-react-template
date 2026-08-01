export default function AppHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-[#e8e8e8] bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="flex min-h-[76px] w-full items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <img className="size-12" src={'/logo.png'} alt="logo" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg leading-6 font-semibold text-[#181818]">{title}</h1>
              <p className="mt-0.5 truncate text-xs leading-[18px] text-[#737373]">{description}</p>
            </div>
          </div>
        </div>
        <div>
          <div className="size-12 cursor-pointer overflow-hidden rounded-lg bg-gray-300">
            <img className="size-12" src={'/avatar.jpg'} alt="avatar" />
          </div>
        </div>
      </div>
    </header>
  );
}
