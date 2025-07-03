import { DOWNLOAD_URL_FOR_Android, DOWNLOAD_URL_FOR_iOS } from '@/constants';
import clsx from 'clsx';
import Tools from '@likg/tools';
import { useState } from 'react';
import './index.less';
import download_pattern_left_src from './images/download_pattern_left.png';
import download_pattern_right_src from './images/download_pattern_right.png';

export default function Page() {
	// state
	const [showAni, setShowAni] = useState(false);
	const env = Tools.getEnv();

	// events
	const onDownload = () => {
		switch (env) {
			case 'weixin':
				setShowAni(true);
				setTimeout(() => {
					setShowAni(false);
				}, 1000);
				break;
			case 'android':
				window.location.href = DOWNLOAD_URL_FOR_Android;
				break;
			case 'ios':
				window.location.href = DOWNLOAD_URL_FOR_iOS;
				break;
			default:
		}
	};
	return (
		<div className="download-app w-screen h-screen flex flex-col justify-center items-center">
			<img className="parttern absolute-top-left " src={download_pattern_left_src} alt="" />
			<img className="parttern absolute-top-right " src={download_pattern_right_src} alt="" />
			<div
				className={clsx([
					'tips',
					{
						show: env === 'weixin',
						ani: showAni
					}
				])}
			>
				<div>请点击右上角选择</div>
				<div>用默认浏览器中打开</div>
			</div>
			<div className="flex flex-col justify-center items-center">
				<img className="icon-60x60" src="/logo.png" />
				<div className="text-16 mt-12 font-semibold">产品名称</div>
				<div className="download-btn bg-primary text-white flex justify-center items-center rounded-full mt-12 text-16 " onClick={onDownload}>
					点击下载
				</div>
				<div className="text-14 mt-12 text-999999">
					{env === 'weixin' ? (
						<div className="browser-tips">温馨提示：请在移动端（手机）浏览器打开此页面</div>
					) : (
						<div className="open-tips">已安装?立即打开</div>
					)}
				</div>
			</div>
		</div>
	);
}
