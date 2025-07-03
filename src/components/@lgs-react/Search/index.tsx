import { memo, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import Field from '../Field/index';
import './index.less';
import icon_search_src from './images/icon_search.png';
interface IProps {
	value: string;
	fieldStyle?: CSSProperties;
	placeHolder?: string;
	placeHolderColor?: string;
	backgroundColor?: string;
	buttonText?: string;
	maxLength?: number;
	onChange: (value: string) => void;
	onButtonTap?: (value: string) => void;
}

export default memo(function Search({
	value,
	placeHolder = '请输入搜索关键字',
	placeHolderColor = '#999999',
	backgroundColor = '#FFFFFF',
	fieldStyle = {},
	buttonText = '搜索',
	maxLength = 20,
	onChange,
	onButtonTap
}: IProps) {
	// state
	const [keyword, setKeyword] = useState('');
	// events
	const onFieldChange = useCallback(
		(value: string) => {
			setKeyword(value);
			onChange(value);
		},
		[onChange]
	);
	// render
	return (
		<div className="lg-search" style={{ backgroundColor }}>
			<div className="lg-search__box">
				<img
					className="lg-search__icon"
					src={icon_search_src}
					alt="icon_search"
				/>
				<Field
					placeHolder={placeHolder}
					placeHolderColor={placeHolderColor}
					value={value}
					fieldStyle={fieldStyle}
					onChange={onFieldChange}
					maxLength={maxLength}
				/>
			</div>
			<section
				className="lg-search__buttton"
				onClick={() => {
					onButtonTap?.(keyword);
				}}
			>
				{buttonText}
			</section>
		</div>
	);
});
