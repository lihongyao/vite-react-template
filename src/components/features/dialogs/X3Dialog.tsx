import { useDialog } from '@/components/ui/Dialog';

export default function X3Dialog() {
  const dialog = useDialog();

  return (
    <section className="w-[calc(100vw-32px)] max-w-md rounded-lg bg-white p-5 text-[#222] shadow-xl">
      <h2 className="text-lg font-semibold">X3 Dialog</h2>
      <p className="mt-2 text-sm text-[#666]">这是最上层弹窗，关闭后会触发 X2 中注册的回调。</p>
      <button
        type="button"
        className="mt-5 h-11 w-full rounded-md bg-[#15803d] px-4 text-sm font-medium text-white active:opacity-80"
        onClick={() => dialog.close('X3Dialog', { reason: 'confirmed' })}
      >
        确认并关闭
      </button>
    </section>
  );
}
