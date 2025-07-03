import clsx from 'clsx';
import { memo } from 'react';
import './index.less';
interface Iprops {
	color?: string;
	tips?: string;
	top?: number;
	direction?: 'vertical' | 'horizontal';
}

export default memo(function Loading({ color = '#999999', tips, top = 50, direction = 'horizontal' }: Iprops) {
	return (
		<div
			className={clsx(['lg-loading', { vertical: direction === 'vertical' }])}
			style={{
				paddingTop: top
			}}
		>
			{tips && (
				<div
					className="lg-loading__tips"
					style={{
						color
					}}
				>
					{tips}
				</div>
			)}
			<div className="lg-loading__wrap">
				{new Array(3).fill(1).map((_, index) => (
					<div
						className="lg-loading__idot"
						style={{
							background: color
						}}
						key={index}
					></div>
				))}
			</div>
		</div>
	);
});
