interface StartupLoadingScreenProps {
  message: string;
}

export default function StartupLoadingScreen({ message }: StartupLoadingScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-[#f9f9f9] px-6">
      <header className="flex flex-col items-center gap-2">
        <img className="size-12" src="/logo.png" alt="" />
        <span className="text-lg font-semibold text-[#222] uppercase">Agent Center</span>
      </header>
      <span
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-[#ddd] border-t-[#222]"
      />
      <output className="text-sm text-[#666]">{message}</output>
    </main>
  );
}
