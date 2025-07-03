import { memo } from 'react';

interface IProps {
	color?: string;
	height?: string | number;
	className?: string;
}
export default memo(function Line({ height = '1px', color = '#F7F7F7', className = '' }: IProps) {
	return (
		<div
			className={className}
			style={{
				width: '100%',
				height,
				backgroundColor: color
			}}
		/>
	);
});
