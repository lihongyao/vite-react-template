import { useEffect, useMemo, type JSX } from 'react';
export interface IConfigs {
	message: string;
	duration?: number;
	type?: string;
	render?: () => JSX.Element | JSX.Element[];
}

interface IProps {
	rootDom: HTMLElement;
	parentDom: HTMLElement;
	config: IConfigs;
}

export default function Message(props: IProps) {
	const {
		rootDom,
		parentDom,
		config: { message, duration = 2 }
	} = props;

	const unmount = useMemo(() => {
		return () => {
			if (parentDom && rootDom) {
				// React 19 不再需要手动 unmount，root.unmount() 会自动清理
				rootDom.removeChild(parentDom);
			}
		};
	}, [parentDom, rootDom]);

	useEffect(() => {
		const t1 = setTimeout(() => {
			parentDom.classList.add('ani-out');
			const t2 = setTimeout(() => {
				unmount();
				clearTimeout(t2);
			}, 350);
			clearTimeout(t1);
		}, duration * 1000);
	}, [duration, parentDom.classList, unmount]);

	return <div className="lg-message__item">{message}</div>;
}
