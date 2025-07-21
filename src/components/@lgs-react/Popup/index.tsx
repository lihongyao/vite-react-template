import clsx from 'clsx';
import React, { memo, useEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import './index.less';
interface IProps {
	visible: boolean;
	round?: boolean;
	title?: string;
	closeable?: boolean;
	closeOnClickOverlay?: boolean;
	customStyle?: CSSProperties;
	customCls?: string;
	children?: JSX.Element | JSX.Element[];
	onClose: () => void;
}

export default memo(function Popup({
	visible,
	children,
	round,
	title,
	closeable,
	customCls = '',
	customStyle = {},
	closeOnClickOverlay = true,
	onClose
}: IProps) {
	// events
	const onClickOverlay = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.persist();
		const target = event.target as HTMLDivElement;
		if (target.classList.contains('lg-popup')) {
			if (closeOnClickOverlay) onClose();
		}
	};
	// effects
	/** 阻止显示时页面可拖拽 */
	useEffect(() => {
		document.body.style.overflow = visible ? 'hidden' : 'scroll';
	}, [visible]);
	return (
		<div className={clsx(['lg-popup', customCls, { visible: !!visible }])} onClick={onClickOverlay}>
			<div className={clsx(['lg-popup__contents', { round: !!round }])} style={customStyle}>
				{title && <div className="lg-popup__title">{title}</div>}
				{closeable && (
					<img className="lg-popup__close" src={new URL('./images/icon_close.png', import.meta.url).toString()} alt="close-icon" onClick={onClose} />
				)}
				{children}
			</div>
		</div>
	);
});
