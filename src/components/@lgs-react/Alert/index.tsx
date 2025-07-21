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
import { createRoot, type Root } from 'react-dom/client';
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
	root: Root;
}

function Alert({ config, root }: AlertProps) {
	const { title, message, align = 'left', sureButtonText = '确定', cancelButtonText = '取消', showCancel, onSure, onCancel } = config;

	const onButtonTap = (type: 'cancel' | 'sure') => {
		if (type === 'cancel') {
			onCancel?.();
			root.unmount();
		}
		if (type === 'sure') {
			onSure?.();
			root.unmount();
		}
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
						{sureButtonText}
					</section>
				</div>
			</div>
		</div>
	);
}

function info(options: IOptions | string) {
	// 1.判断数据类型
	if (typeof options === 'string') options = { title: options };
	// 2.构造容器
	let wrap = document.querySelector('.lg-alert');
	if (!wrap) {
		wrap = document.createElement('div');
		wrap.className = 'lg-alert';
		document.body.appendChild(wrap);
	}
	// 3.卸载组件
	const root = createRoot(wrap);
	root.render(<Alert dom={wrap} config={options} root={root} />);
	return () => root.unmount();
}

export default { info };
