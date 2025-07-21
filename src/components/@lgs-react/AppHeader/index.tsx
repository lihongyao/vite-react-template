import jsBridge from '@likg/js-bridge';
import Tools from '@likg/tools';
import React, { useEffect, useState, memo, useImperativeHandle, useRef } from 'react';
import type { CSSProperties, ReactElement } from 'react';

import './index.less';

interface IRefs {
	height: number;
}

interface IProps {
	ref?: React.Ref<IRefs | null>;
	title?: string;
	titleStyle?: CSSProperties;

	backgroundColor?: string;
	gradientColor?: string;
	fadeInTitle?: boolean /** 该属性需和gradientColor一起使用 */;

	theme?: 'dark' | 'light';
	type?: 'APP' | 'H5';

	rightButtonText?: string;

	renderRight?: () => ReactElement;
	renderLeft?: () => ReactElement;
	renderTitle?: () => ReactElement;

	showBack?: boolean;
	showRefresh?: boolean;

	onBack?: () => void;
	onRefresh?: () => void;

	onRightButtonTap?: () => void;
}

export default memo(function AppHeader({ ref, ...props }: IProps) {
	// state
	const [opacity, setOpacity] = useState(0);
	const [isBangScreen, setIsBangScreen] = useState(false);
	const headerRef = useRef<HTMLDivElement>(null);

	const {
		title,
		titleStyle,
		gradientColor,
		fadeInTitle,
		backgroundColor = gradientColor ? 'transparent' : 'linear-gradient(90deg, #FFD049 0%, #FFBA11 100%)',
		rightButtonText,
		showBack,
		showRefresh,
		theme = 'light',
		type = 'APP',
		onBack,
		onRightButtonTap,
		onRefresh,
		renderRight,
		renderLeft,
		renderTitle
	} = props;

	useImperativeHandle(ref, () => ({
		height: headerRef.current ? headerRef.current.getBoundingClientRect().height : 0
	}));

	// events
	const handleRightButtonTap = () => {
		if (onRightButtonTap) onRightButtonTap();
	};
	const handleRefreshButtonTap = () => {
		if (onRefresh) {
			onRefresh();
		} else {
			window.location.reload();
		}
	};

	const handleGoBackButtonTap = () => {
		if (Tools.query<string>('appBack') === '1') {
			jsBridge.nativeBack();
		} else if (onBack) {
			onBack();
		} else {
			history.back();
		}
	};
	const handlePageScroll = (ev: Event) => {
		ev = ev || window.event;
		const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		const target = 100;
		if (scrollTop < target) {
			setOpacity(scrollTop / target);
		} else {
			setOpacity(1);
		}
	};
	// effects
	useEffect(() => {
		setIsBangScreen(window && window.screen.height >= 812 && window.devicePixelRatio >= 2);
	}, []);

	useEffect(() => {
		if (!gradientColor) return;
		window.addEventListener('scroll', handlePageScroll, false);
		return () => {
			window.removeEventListener('scroll', handlePageScroll, false);
		};
	}, [gradientColor]);
	// render
	return (
		<div ref={headerRef} className="app-header">
			{/* 占位元素 */}
			{!gradientColor && backgroundColor !== 'transparent' && <div className="app-header__place" style={{ height: isBangScreen ? '88px' : '64px' }} />}
			<div
				className="app-header__wrapper"
				style={{
					background: backgroundColor,
					color: theme === 'dark' ? '#333333' : '#FFFFFF',
					height: isBangScreen ? '88px' : '64px'
				}}
			>
				{/* 标题栏 */}
				<div className="app-header__titleBar">
					{/* 左侧按钮 */}
					<div className="app-header__leftButton">
						{showBack && (
							<div
								className={`app-header__backButton ${type === 'APP' ? 'app' : 'h5'}`}
								style={{
									background: `url(${
										theme === 'dark'
											? new URL('./images/back_btn_dark.png', import.meta.url).toString()
											: new URL('./images/back_btn_light.png', import.meta.url).toString()
									}) no-repeat 0 center`
								}}
								onClick={handleGoBackButtonTap}
							/>
						)}
						{renderLeft?.()}
					</div>
					{/* 中间标题 */}
					<div
						className="app-header__title"
						style={{
							...titleStyle,
							opacity: fadeInTitle ? opacity : 1
						}}
					>
						{title}
						{renderTitle?.()}
					</div>
					{/* 右侧按钮 */}
					<div className="app-header__rightButton">
						{rightButtonText && <span onClick={handleRightButtonTap}>{rightButtonText}</span>}
						{showRefresh && (
							<div
								className={`app-header__refreshButton ${type === 'APP' ? 'app' : 'h5'}`}
								style={{
									background: `url(${
										theme === 'dark'
											? new URL('./images/refresh_btn_dark.png', import.meta.url).toString()
											: new URL('./images/refresh_btn_light.png', import.meta.url).toString()
									}) no-repeat 100% center`
								}}
								onClick={handleRefreshButtonTap}
							/>
						)}

						{renderRight?.()}
					</div>
				</div>
				{/* 渐变层 */}
				{gradientColor && <div className="app-header__mask" style={{ background: gradientColor, opacity }} />}
			</div>
		</div>
	);
});
