/**
<Dialog open={openDialog} onCancel={setOpenDialog} closeButtonPosition="bottom">
	<div className="text-center">我是自定义弹框</div>
</Dialog>
 */
import clsx from 'clsx';
import React, { memo, useEffect, useRef } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import './index.less';
interface IProps {
	open: boolean /** 切换显示 */;
	children: ReactElement /** 子元素 */;
	isFullScreen?: boolean /** 是否满屏 */;
	closeable?: boolean /** 是否显示关闭按钮 */;
	closeButtonPosition?: 'default' | 'bottom' /** 关闭按钮位置 */;
	closeOnClickOverlay?: boolean /** 是否允许点击遮罩关闭视图 */;
	customStyle?: CSSProperties;
	onCancel: (isOpen: boolean) => void;
}

export default memo(function Dialog({
	open,
	children,
	isFullScreen = false,
	closeable = true,
	closeButtonPosition = 'default',
	closeOnClickOverlay = true,
	customStyle = {},
	onCancel
}: IProps) {
	const lgWrapper = useRef<HTMLDivElement | null>(null);

	// events
	const onTap = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const target = event.target as HTMLDivElement;
		if (closeOnClickOverlay && target.classList.contains('lg-dialog')) {
			onCancel(false);
		}
	};
	// effects
	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : 'auto';
	}, [open]);
	// render
	return (
		<div ref={lgWrapper} className={clsx(['lg-dialog', { open }])} onClick={onTap}>
			<div className={clsx(['lg-dialog__content', { fullScreen: isFullScreen }])} style={{ ...customStyle }}>
				{children}
				{closeable && (
					<img
						src={new URL('./images/icon-close.png', import.meta.url).toString()}
						className={clsx([
							'lg-dialog__close',
							{
								bottom: closeButtonPosition === 'bottom'
							}
						])}
						onClick={() => onCancel(false)}
					/>
				)}
			</div>
		</div>
	);
});
