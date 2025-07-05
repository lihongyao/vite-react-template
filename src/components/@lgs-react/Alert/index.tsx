/* eslint-disable react-refresh/only-export-components */
/**
使用示例：
const unmount = Alert.info({
	title: '温馨提示',
	message: '您确定要要退出登录吗？',
	align: 'center',
	showCancel: true,
	cancelButtonText: '点错了',
	onCancel: () => unmount(),
	onSure() {
		localStorage.removeItem('AUTHORIZATION_TOKEN');
		unmount();
		navigate('/login');
	}
});
 */
import clsx from 'clsx';
import { memo, useActionState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.less';

interface IOptions {
	title?: string;
	message?: string;
	align?: 'left' | 'center' | 'right';
	showCancel?: boolean;
	sureButtonText?: string;
	cancelButtonText?: string;
	onSure?: () => void;
	onCancel?: () => void;
}

interface AlertProps {
	dom: Element;
	config: IOptions;
}

const Alert = memo(({ config }: AlertProps) => {
	const { title, message, align = 'left', sureButtonText = '确定', cancelButtonText = '取消', showCancel, onSure, onCancel } = config;

	const [_error, submitAction, isPending] = useActionState(async () => {
		await onSure?.();
		return null;
	}, null);

	const onButtonTap = (type: 'cancel' | 'sure') => {
		if (type === 'cancel') onCancel?.();
		else submitAction();
	};

	return (
		<div className="__wrapper">
			<div className={clsx(['__content', { 'no-message': !message }])}>
				{title && <div className="__title">{title}</div>}
				{message && <div className={`__message ${align}`}>{message}</div>}
				<div className={clsx(['__btns', { 'no-message': !message }])}>
					{showCancel && (
						<section className="__btn cancel" onClick={() => onButtonTap('cancel')}>
							{cancelButtonText}
						</section>
					)}
					<section className={clsx(['__btn sure', { 'no-cancel-btn': !showCancel }])} onClick={() => onButtonTap('sure')}>
						{isPending ? '处理中...' : sureButtonText}
					</section>
				</div>
			</div>
		</div>
	);
});

function info(options: IOptions | string) {
	if (typeof options === 'string') options = { title: options };

	let wrap = document.querySelector('.lg-alert');
	if (!wrap) {
		wrap = document.createElement('div');
		wrap.className = 'lg-alert';
		document.body.appendChild(wrap);
	}

	const root = createRoot(wrap);
	root.render(<Alert dom={wrap} config={options} />);
	return () => root.unmount();
}

export default { info };
