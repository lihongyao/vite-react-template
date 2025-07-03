import clsx from 'clsx';
import { memo } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import './index.less';

interface IProps {
	children?: ReactElement;

	icon?: any /** 缩略图 */;
	title?: string | number /** 标题 */;
	subTitle?: string | number /** 内容区域标题 */;
	value?: string | number /** 内容 */;
	label?: string | number /** 标题下方的描述信息 */;
	extra?: string | number /** 右侧内容 */;
	underline?: boolean /** 底部分割线 */;
	isLink?: boolean /** 是否显示右侧链接箭头 */;
	linkIcon?: any /** 自定义link图标 */;
	required?: boolean /** 是否显示必填“*”指示 */;
	disabled?: boolean /** 是否禁用 */;

	iconStyle?: CSSProperties;
	cellStyle?: CSSProperties;
	titleStyle?: CSSProperties;
	subTitleStyle?: CSSProperties;
	valueStyle?: CSSProperties;
	labelStyle?: CSSProperties;
	underlineStyle?: CSSProperties;
	extraStyle?: CSSProperties;

	titleCls?: string;
	subTitleCls?: string;
	customCls?: string;
	valueCls?: string;
	labelCls?: string;
	iconCls?: string;
	extraCls?: string;

	renderExtra?: () => ReactElement /** 自定义最右侧内容 */;
	renderValue?: () => ReactElement /** 自定义value内容 */;
	renderLabel?: () => ReactElement /** 自定义label内容 */;

	onTap?: () => void;
	onDisabled?: () => void /** 当在禁用状态下点击时 */;
}

export default memo(function Cell(props: IProps) {
	const {
		children,
		icon,
		subTitle,
		title,
		value,
		label,
		extra,
		underline,
		isLink,
		linkIcon,
		iconStyle,
		cellStyle,
		titleStyle,
		subTitleStyle,
		valueStyle,
		underlineStyle,
		labelStyle,
		extraStyle,
		renderExtra,
		renderValue,
		renderLabel
	} = props;
	// render
	return (
		<div
			className={clsx([
				'lg-cell',
				props.customCls,
				{ disabled: !!props.disabled }
			])}
			style={cellStyle}
			onClick={() => {
				if (props.disabled) {
					if (props.onDisabled) props.onDisabled();
				} else {
					if (props.onTap) props.onTap();
				}
			}}
		>
			<div className="lg-cell__box">
				{/* 缩略图 */}
				{icon && (
					<div
						className={clsx(['lg-cell__icon', props.iconCls])}
						style={{
							background: `url(${icon}) no-repeat center center / cover`,
							...iconStyle
						}}
					/>
				)}
				{/* 标题 */}
				{title && !icon && (
					<div
						className={clsx([
							'lg-cell__title',
							props.titleCls,
							{ required: !!props.required }
						])}
						style={{ ...titleStyle }}
					>
						{String(title)
							.split('')
							.map((text, index) => (
								<span key={index}>{text}</span>
							))}
					</div>
				)}

				{/* 内容 */}
				<div className="lg-cell__contents">
					{/* 自定义内容 */}
					{children && children}
					{/* sub */}
					{subTitle && (
						<section
							className={clsx(['lg-cell__sub_title', props.subTitleCls])}
							style={subTitleStyle}
						>
							{subTitle}
						</section>
					)}
					{/* 内容 */}
					{(value !== undefined || renderValue) && (
						<section
							className={clsx(['lg-cell__value', props.valueCls])}
							style={valueStyle}
						>
							{value}
							{renderValue?.()}
						</section>
					)}

					{/* 描述信息 */}
					{(label || renderLabel) && (
						<section
							className={clsx(['lg-cell__label', props.labelCls])}
							style={labelStyle}
						>
							{label}
							{renderLabel?.()}
						</section>
					)}
				</div>
			</div>

			{/* 最右侧内容 */}
			{(extra || renderExtra) && (
				<div
					className={clsx(['lg-cell__extra', props.extraCls])}
					style={extraStyle}
				>
					{extra}
					{renderExtra?.()}
				</div>
			)}

			{/* 右侧箭头 */}
			{isLink && (
				<img
					src={
						linkIcon
							? linkIcon
							: new URL(
									'./images/icon_arrow_right.png',
									import.meta.url
								).toString()
					}
					alt=""
					className="lg-cell__link"
				/>
			)}

			{/* 装饰线 */}
			{underline && (
				<div className="lg-cell__underline" style={{ ...underlineStyle }}></div>
			)}
		</div>
	);
});
