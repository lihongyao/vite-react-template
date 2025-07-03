import { memo } from 'react';
import type { CSSProperties } from 'react';
import './index.less';

interface IProps {
	showTips?: boolean;
	tips?: string;
	top?: string;
	icon?: any;
	tipsStyle?: CSSProperties;
}

export default memo(function Loading({ top = '100px', tips = '数据加载中', showTips = true, icon, tipsStyle = {} }: IProps) {
	return (
		<div className="lg-loading2" style={{ paddingTop: top }}>
			<div className="lg-loading2__ct">
				<img src={icon ? icon : new URL('./images/logo_1.png', import.meta.url)} alt="" className="lg-loading2__logo" />
				<div className="lg-loading2__icon" />
			</div>
			{showTips && (
				<div className="lg-loading2__tips" style={{ ...tipsStyle }}>
					{tips}
				</div>
			)}
		</div>
	);
});
