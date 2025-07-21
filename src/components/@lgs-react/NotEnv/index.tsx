import './index.less';
import info_src from './images/info.webp';
import { memo } from 'react';

export default memo(function NotEnv() {
	return (
		<div className="env-tips">
			<img className="icon-info" src={info_src} alt="" />
			<h4 className="tips">请在微信或支付宝客户端打开链接</h4>
		</div>
	);
});
