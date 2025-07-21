import clsx from 'clsx';
import { memo } from 'react';
import type { CSSProperties } from 'react';
import './index.less';

interface IProps {
	text: string | number;
	icon?: any;
	style?: CSSProperties;
	className?: string;
	loading?: boolean;
	loadingText?: string;
	disabled?: boolean;

	onDisabled?: () => void /** 禁用状态时点击 */;
	onTap?: () => void /** 点击按钮 */;
}
export default memo(function CustomButton({
	text,
	icon,
	style = {},
	className = '',
	loading = false,
	loadingText = '正在处理',
	disabled = false,
	onDisabled,
	onTap
}: IProps) {
	// events
	const _onTap = () => {
		if (disabled) {
			if (onDisabled) onDisabled();
		} else {
			if (!loading && onTap) onTap();
		}
	};
	return (
		<div className={clsx(['lg-button', className, { disabled }])} style={{ ...style }} onClick={_onTap}>
			{loading ? (
				<>
					<img src={icon || new URL('./images/loading.png', import.meta.url).toString()} className="lg-button__loading" />
					<span>{loadingText}</span>
				</>
			) : (
				<span>{text}</span>
			)}
		</div>
	);
});
