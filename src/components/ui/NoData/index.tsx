import { memo } from 'react';

export default memo(function NoData({ tips }: { tips?: string }) {
  return (
    <div className="ui-no-data pt-20 text-center">
      <img
        alt=""
        className="mx-auto w-[171px]"
        src={new URL('./images/no-data__4.png', import.meta.url).href}
      />
      {tips ? <p className="mt-[21px] text-sm leading-5 text-[#999]">{tips}</p> : null}
    </div>
  );
});
