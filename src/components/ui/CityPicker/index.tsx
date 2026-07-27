import { memo, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import Popup from '@/components/ui/Popup';

import { citys as citysData } from './data/citys';

export interface CityPickerProps {
  open: boolean;
  anchorStyle?: CSSProperties;
  onCancel: (isOpen: boolean) => void;
  onChange: (city: string) => void;
  renderTitle?: () => ReactNode;
}

export default memo(function CityPicker({
  open,
  anchorStyle,
  onCancel,
  onChange,
  renderTitle,
}: CityPickerProps) {
  const itemListWrapper = useRef<HTMLDivElement>(null);
  const itemListRef = useRef<Array<HTMLDivElement | null>>([]);

  const onClickPosition = (index: number) => {
    const wrapper = itemListWrapper.current;
    const item = itemListRef.current[index];

    if (wrapper && item) wrapper.scrollTop = item.offsetTop;
  };

  return (
    <Popup visible={open} className="ui-city-picker" onClose={() => onCancel(false)}>
      <div className="relative flex h-[80dvh] flex-col bg-white">
        <div className="flex h-[60px] shrink-0 items-center justify-center border-b border-[#eee] text-base font-bold">
          {renderTitle ? renderTitle() : '选择城市'}
        </div>

        <div ref={itemListWrapper} className="relative flex-1 overflow-y-auto overscroll-contain">
          {citysData.map((group, index) => (
            <div
              ref={(element) => {
                itemListRef.current[index] = element;
              }}
              key={group.code}
            >
              <div className="bg-[#eee] px-[15px] py-2 font-bold">{group.code}</div>
              {group.citys.map((city) => (
                <button
                  type="button"
                  className="relative block w-full px-[15px] py-2.5 text-left after:absolute after:right-0 after:bottom-0 after:left-[15px] after:h-px after:bg-[#eee] after:content-[''] last:after:hidden"
                  key={`${group.code}-${city}`}
                  onClick={() => {
                    onChange(city);
                    onCancel(false);
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div
          className="absolute top-10 right-0.5 bottom-10 m-auto h-fit max-h-[90%] w-[7%] overflow-y-auto py-3 text-center leading-[1.6]"
          style={anchorStyle}
        >
          {citysData.map((group, index) => (
            <button
              type="button"
              className="block w-full"
              aria-label={`跳转到 ${group.code} 开头的城市`}
              key={group.code}
              onClick={() => onClickPosition(index)}
            >
              {group.code}
            </button>
          ))}
        </div>
      </div>
    </Popup>
  );
});
