import clsx from 'clsx';
import { memo } from 'react';
import './index.less';

interface IProps {
	length: number;
	code: string;
	customCls?: string;
	onClick?: () => void;
}

export default memo(function SquareCode(props: IProps) {
	// render
	return (
		<div className={clsx(['lg-square-code', props.customCls])} onClick={() => props.onClick?.()}>
			{new Array(props.length).fill(0).map((_, i) => (
				<section key={i} className="lg-square-code__item">
					{props.code.charAt(i)}
				</section>
			))}
		</div>
	);
});
