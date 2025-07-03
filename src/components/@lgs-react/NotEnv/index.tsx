import './index.less';
import info_src from './images/info.webp';

export default function NotEnv() {
	return (
		<div className="env-tips">
			<img className="icon-info" src={info_src} alt="" />
			<h4 className="tips">请在微信或支付宝客户端打开链接</h4>
		</div>
	);
}
