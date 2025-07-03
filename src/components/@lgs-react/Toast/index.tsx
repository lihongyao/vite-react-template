import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import clsx from 'clsx';
import './index.less';

interface IConfigs {
	message?: string;
	duration?: number;
	type: 'loading' | 'info';
}

let TOAST_TIMER: NodeJS.Timeout;

// eslint-disable-next-line react-refresh/only-export-components
const ToastContent = ({
	message,
	loading
}: {
	message?: string;
	loading: boolean;
}) => (
	<div className="lg-toast__wrapper">
		<div className={clsx(['lg-toast__content', { loading }])}>
			{loading && (
				<img
					src={new URL('./images/loading.png', import.meta.url).toString()}
					alt=""
					className="lg-toast__loading"
				/>
			)}
			{message && <div className="lg-toast__tips">{message}</div>}
		</div>
	</div>
);

const useToast = () => {
	const [toastConfig, setToastConfig] = useState<IConfigs | null>(null);

	const render = (configs: IConfigs) => {
		clearTimeout(TOAST_TIMER);
		setToastConfig(configs);

		if (configs.duration) {
			TOAST_TIMER = setTimeout(() => {
				setToastConfig(null);
			}, configs.duration * 1000);
		}
	};

	const info = (message: string, duration: number = 1.5) => {
		render({ message, duration, type: 'info' });
	};

	const loading = (message?: string) => {
		render({ message, type: 'loading' });
	};

	const hide = () => {
		setToastConfig(null);
	};

	return {
		toast: toastConfig && (
			<ToastContent
				message={toastConfig.message}
				loading={toastConfig.type === 'loading'}
			/>
		),
		info,
		loading,
		hide
	};
};

// 兼容旧版API
const legacyToast = {
	info: (message: string, duration: number = 1.5) => {
		const root = createRoot(document.createElement('div'));
		root.render(<ToastContent message={message} loading={false} />);

		setTimeout(() => {
			root.unmount();
		}, duration * 1000);
	},
	loading: (message?: string) => {
		const root = createRoot(document.createElement('div'));
		root.render(<ToastContent message={message} loading={true} />);
		return () => root.unmount();
	},
	hide: () => {} // 需要额外处理
};

export default useToast;
export { legacyToast as toast };
