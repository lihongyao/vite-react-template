/*
使用示例：
<AddressPicker
	open={true}
	onFetch={async (code: string) => {
		return [{ code: "1", name: "四川省" }];
	}}
	onSure={async (data: AddressPickerDataProps) => {
		console.log(data);
	}}
	onCancel={() => {}}
/>
*/
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import CloseIcon from '@/assets/icon/close.svg?react';
import Popup from '@/components/ui/Popup';
import { cn } from '@/libs/class-helpers';

export interface AddressPickerModelProps {
  code: string;
  name: string;
}

export interface AddressPickerDataProps {
  province: AddressPickerModelProps;
  city: AddressPickerModelProps;
  area: AddressPickerModelProps;
}

type AddressLevel = keyof AddressPickerDataProps;
type AddressPickerCSSProperties = CSSProperties & {
  '--address-picker-theme': string;
};

export interface AddressPickerProps {
  open: boolean;
  data?: AddressPickerDataProps | null;
  themeColor?: string;
  className?: string;
  contentClassName?: string;
  onFetch: (code: string) => Promise<AddressPickerModelProps[]>;
  onSure: (data: AddressPickerDataProps) => void | Promise<void>;
  onCancel: (isOpen: boolean) => void;
}

const addressLevels: Array<{ key: AddressLevel; placeholder: string }> = [
  { key: 'province', placeholder: '选择省份' },
  { key: 'city', placeholder: '选择城市' },
  { key: 'area', placeholder: '选择区县' },
];

const createEmptyAddress = (): AddressPickerDataProps => ({
  province: { code: '', name: '' },
  city: { code: '', name: '' },
  area: { code: '', name: '' },
});

const cloneAddress = (data?: AddressPickerDataProps | null): AddressPickerDataProps =>
  data
    ? {
        province: { ...data.province },
        city: { ...data.city },
        area: { ...data.area },
      }
    : createEmptyAddress();

export default memo(function AddressPicker({
  open,
  data,
  themeColor = '#49C265',
  className,
  contentClassName,
  onFetch,
  onSure,
  onCancel,
}: AddressPickerProps) {
  const itemsWrapRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const [selectedKey, setSelectedKey] = useState<AddressLevel>('province');
  const [items, setItems] = useState<AddressPickerModelProps[]>([]);
  const [innerData, setInnerData] = useState<AddressPickerDataProps>(() => cloneAddress(data));
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  const canConfirm = Boolean(innerData.province.code && innerData.city.code && innerData.area.code);
  const pickerStyle: AddressPickerCSSProperties = {
    '--address-picker-theme': themeColor,
  };

  const loadItems = useCallback(
    async (code: string) => {
      const requestId = ++requestIdRef.current;
      setItems([]);
      setError(undefined);
      setLoading(true);

      try {
        const nextItems = await onFetch(code);
        if (requestId !== requestIdRef.current) return;
        setItems(nextItems);
        if (itemsWrapRef.current) itemsWrapRef.current.scrollTop = 0;
      } catch {
        if (requestId === requestIdRef.current) setError('加载失败，请重试');
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [onFetch],
  );

  useEffect(() => {
    if (!open) {
      requestIdRef.current += 1;
      return undefined;
    }

    const nextData = cloneAddress(data);
    const nextLevel: AddressLevel = !nextData.province.code
      ? 'province'
      : !nextData.city.code
        ? 'city'
        : 'area';
    const parentCode =
      nextLevel === 'province'
        ? ''
        : nextLevel === 'city'
          ? nextData.province.code
          : nextData.city.code;

    setInnerData(nextData);
    setSelectedKey(nextLevel);
    setConfirming(false);
    void loadItems(parentCode);

    return () => {
      requestIdRef.current += 1;
    };
  }, [data, loadItems, open]);

  const handleLevelChange = (key: AddressLevel) => {
    const parentCode =
      key === 'province' ? '' : key === 'city' ? innerData.province.code : innerData.city.code;

    setSelectedKey(key);
    setInnerData((current) => ({
      ...current,
      ...(key === 'province' && {
        province: { code: '', name: '' },
        city: { code: '', name: '' },
        area: { code: '', name: '' },
      }),
      ...(key === 'city' && {
        city: { code: '', name: '' },
        area: { code: '', name: '' },
      }),
      ...(key === 'area' && { area: { code: '', name: '' } }),
    }));
    void loadItems(parentCode);
  };

  const handleItemSelect = (item: AddressPickerModelProps) => {
    setInnerData((current) => ({
      ...current,
      [selectedKey]: { ...item },
      ...(selectedKey === 'province' && {
        city: { code: '', name: '' },
        area: { code: '', name: '' },
      }),
      ...(selectedKey === 'city' && { area: { code: '', name: '' } }),
    }));

    if (selectedKey === 'province') {
      setSelectedKey('city');
      void loadItems(item.code);
    } else if (selectedKey === 'city') {
      setSelectedKey('area');
      void loadItems(item.code);
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm || confirming) return;

    setConfirming(true);
    setError(undefined);
    try {
      await onSure(cloneAddress(innerData));
      onCancel(false);
    } catch {
      setError('提交失败，请重试');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Popup
      visible={open}
      className={cn('ui-address-picker', className)}
      contentClassName={cn(
        'flex h-[min(520px,90dvh)] flex-col rounded-t-[22px] px-[15px] py-7',
        contentClassName,
      )}
      onClose={() => onCancel(false)}
    >
      <div className="contents" style={pickerStyle}>
        <h3 className="mb-[17px] shrink-0 text-sm leading-4 font-normal text-[#b5b5b5]">已选择</h3>

        <div className="shrink-0 border-b border-[#ececec] pb-[15px]">
          {addressLevels.map(({ key, placeholder }) => {
            const isVisible =
              key === 'province' ||
              (key === 'city' && Boolean(innerData.province.code)) ||
              (key === 'area' && Boolean(innerData.city.code));
            if (!isVisible) return null;

            const isSelected = Boolean(innerData[key].code);
            return (
              <button
                type="button"
                className={cn(
                  'flex h-[30px] w-full items-center gap-3 text-left text-sm text-[#b1b1b1]',
                  selectedKey === key && 'font-medium text-[#444]',
                )}
                aria-current={selectedKey === key ? 'step' : undefined}
                key={key}
                onClick={() => handleLevelChange(key)}
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full border-2 border-[var(--address-picker-theme)]',
                    isSelected && 'border-4',
                  )}
                  aria-hidden
                />
                {innerData[key].name || placeholder}
              </button>
            );
          })}
        </div>

        <div
          ref={itemsWrapRef}
          className="mt-2.5 mb-5 min-h-0 flex-1 overflow-y-auto overscroll-contain"
          aria-live="polite"
        >
          {loading ? (
            <output className="flex h-full items-center justify-center">
              <span
                className="size-6 animate-spin rounded-full border-2 border-[#ddd] border-t-[var(--address-picker-theme)]"
                aria-hidden
              />
              <span className="sr-only">加载中</span>
            </output>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[#777]">
              <span>{error}</span>
              <button
                type="button"
                className="font-medium text-[var(--address-picker-theme)]"
                onClick={() => {
                  const parentCode =
                    selectedKey === 'province'
                      ? ''
                      : selectedKey === 'city'
                        ? innerData.province.code
                        : innerData.city.code;
                  void loadItems(parentCode);
                }}
              >
                重新加载
              </button>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => {
              const isSelected = innerData[selectedKey].code === item.code;
              return (
                <button
                  type="button"
                  className="flex h-[34px] w-full items-center justify-between text-left text-sm text-[#444]"
                  key={item.code}
                  onClick={() => handleItemSelect(item)}
                >
                  <span>{item.name}</span>
                  <span
                    className={cn(
                      'mr-1 size-4 rounded-full border border-[#d1d5db]',
                      isSelected && 'border-[5px] border-[var(--address-picker-theme)] bg-white',
                    )}
                    aria-hidden
                  />
                </button>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#999]">
              暂无可选地址
            </div>
          )}
        </div>

        <button
          type="button"
          className="mx-auto flex h-9 w-[205px] shrink-0 items-center justify-center rounded-full bg-[var(--address-picker-theme)] text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canConfirm || confirming}
          onClick={() => void handleConfirm()}
        >
          {confirming ? '确认中...' : '确认'}
        </button>

        <button
          type="button"
          className="absolute top-[15px] right-[15px] flex size-[30px] items-center justify-center"
          aria-label="关闭地址选择器"
          onClick={() => onCancel(false)}
        >
          <CloseIcon aria-hidden className="size-6" focusable={false} />
        </button>
      </div>
    </Popup>
  );
});
