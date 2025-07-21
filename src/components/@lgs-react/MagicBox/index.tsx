import { memo, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import './index.less';

interface IProps {
	children: ReactElement;
	maxColumns?: number;
	gap?: number;
}

export default memo(function MagicBox(props: IProps) {
	// props
	const { maxColumns = 3, gap = 10 } = props;
	// refs
	const lgWrapper = useRef<HTMLDivElement | null>(null);
	// state
	const [width, setWidth] = useState(0);

	useEffect(() => {
		if (lgWrapper.current) {
			const type = Object.prototype.toString.call(props.children).slice(8, -1).toLowerCase();
			if (type === 'array') {
				const children = props.children as unknown as ReactElement[];
				const w = lgWrapper.current.getBoundingClientRect().width;
				const columns = children.length < maxColumns ? children.length : maxColumns;
				setWidth(() => {
					return (w - (columns - 1) * gap) / columns;
				});
			}
		}
		// eslint-disable-next-line
	}, [lgWrapper]);

	const renderItems = () => {
		const type = Object.prototype.toString.call(props.children).slice(8, -1).toLowerCase();
		if (type === 'array') {
			const children = props.children as unknown as ReactElement[];
			const columns = children.length < maxColumns ? children.length : maxColumns;
			return children.map((element: ReactElement, i: number) => {
				return (
					<section
						className="lg-magic-box__item"
						key={`lg-magic-box__item__${i}`}
						style={{
							width: width + 'px',
							marginRight: (i + 1) % columns === 0 ? `0px` : `${gap}px`
						}}
					>
						{element}
					</section>
				);
			});
		} else {
			return (
				<section className="lg-magic-box__item" style={{ flex: 1 }}>
					{props.children}
				</section>
			);
		}
	};
	// render
	return (
		<div className="lg-magic-box" ref={lgWrapper}>
			{renderItems()}
		</div>
	);
});
