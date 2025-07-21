import { memo } from 'react';
import './index.less';

export default memo(function NoData({ tips }: { tips?: string }) {
	return (
		<div className="lg-no-data">
			<img className="lg-no-data__img" src={new URL('./images/no-data__4.png', import.meta.url).toString()} alt="" />
			{tips && <p className="lg-no-data__tips">{tips}</p>}
		</div>
	);
});
