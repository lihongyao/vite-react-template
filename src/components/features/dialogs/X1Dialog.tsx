import { useDialog } from '@/components/ui/Dialog';

export interface X1DialogProps {
  message?: string;
  count: number;
}

export default function X1Dialog({ message, count }: X1DialogProps) {
  const dialog = useDialog();

  return (
    <section className="w-[calc(100vw-32px)] max-w-md rounded-lg bg-white p-5 text-[#222] shadow-xl">
      <h2 className="text-lg font-semibold">X1 Dialog</h2>
      <p className="mt-2 text-sm text-[#666]">{message}</p>
      <p className="mt-1 text-sm text-[#666]">count: {count}</p>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          className="h-11 rounded-md bg-[#222] px-4 text-sm font-medium text-white active:opacity-80"
          onClick={() => {
            dialog.open('X2Dialog', {
              closeOnPopstate: false,
              onAfterClose(event) {
                console.log('X2 closed >>>', event);
              },
            });
          }}
        >
          打开 X2
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
          onClick={() => dialog.close('X1Dialog', { reason: 'close-x1-button' })}
        >
          按类型关闭 X1
        </button>
      </div>
    </section>
  );
}
