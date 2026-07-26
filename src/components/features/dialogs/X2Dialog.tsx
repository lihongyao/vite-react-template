import { useDialog } from '@/components/ui/Dialog';

export default function X2Dialog() {
  const dialog = useDialog();

  return (
    <section className="w-[calc(100vw-32px)] max-w-md rounded-lg bg-white p-5 text-[#222] shadow-xl">
      <h2 className="text-lg font-semibold">X2 Dialog</h2>
      <p className="mt-2 text-sm text-[#666]">这是第二层弹窗，用来验证多个注册弹窗叠加。</p>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          className="h-11 rounded-md bg-[#2563eb] px-4 text-sm font-medium text-white active:opacity-80"
          onClick={() => {
            dialog.open('X3Dialog', {
              onAfterClose(event) {
                console.log('X3 closed >>>', event);
              },
            });
          }}
        >
          打开 X3
        </button>
        <button
          type="button"
          className="h-11 rounded-md border border-[#ddd] px-4 text-sm font-medium active:bg-[#f5f5f5]"
          onClick={() => dialog.closeTop({ reason: 'close-top-button' })}
        >
          关闭顶层弹窗
        </button>
        <button
          type="button"
          className="h-11 rounded-md px-4 text-sm text-[#b42318] active:bg-[#fff1f0]"
          onClick={() => dialog.close(undefined, { reason: 'close-all-button' })}
        >
          关闭全部弹窗
        </button>
      </div>
    </section>
  );
}
