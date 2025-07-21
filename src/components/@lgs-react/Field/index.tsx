import { memo } from 'react';
import type { FormEvent, CSSProperties } from 'react';
import './index.less';

interface IProps {
	value: string | number;
	placeHolder?: string;
	placeHolderColor?: string;
	maxLength?: number;

	type?: 'text' | 'password' | 'number' | 'tel';
	clear?: boolean;
	disabled?: boolean;

	underline?: boolean;
	underlineStyle?: CSSProperties;

	fieldStyle?: CSSProperties;
	controlStyle?: CSSProperties;

	fontSize?: string;
	color?: string;

	className?: string;
	bold?: boolean;
	rule?: RegExp;

	onChange: (value: string) => void;
}

export default memo(function Field({
	value = '',
	placeHolder,
	placeHolderColor = '#DDDDDD',
	maxLength = Infinity,

	type = 'text',
	clear = true,
	disabled = false,

	underline,
	underlineStyle,

	fieldStyle,
	controlStyle,

	fontSize = '14px',
	color = '#333333',

	className = '',
	rule = new RegExp(''),

	onChange
}: IProps) {
	// events
	const _onChange = (event: FormEvent<HTMLInputElement>) => {
		event.persist();
		const value = event.currentTarget.value;
		if (rule.test(value)) onChange(value);
	};
	const _onClear = () => {
		onChange('');
	};

	return (
		<div className={`lg-field ${className}`} style={fieldStyle}>
			<input
				className="lg-field__control"
				placeholder={placeHolder}
				type={type}
				value={value}
				onChange={_onChange}
				maxLength={maxLength}
				disabled={disabled}
				style={{
					// @ts-ignore
					'--placeholder-color': placeHolderColor,
					'--size': fontSize,
					color,
					...controlStyle
				}}
			/>
			{clear && !disabled && String(value).length > 0 && (
				<img className="lg-field__clear" src={new URL('./images/icon_clear.png', import.meta.url).toString()} onClick={_onClear} alt="" />
			)}
			<div>{underline && <div className="lg-field__underline" style={underlineStyle}></div>}</div>
		</div>
	);
});
