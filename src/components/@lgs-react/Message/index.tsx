import { createRoot } from 'react-dom/client'; // React 19 使用 createRoot
import Message from './Message';
import type { IConfigs } from './Message';
import './index.less';

const renderWrap = () => {
	let wrap = document.querySelector('.lg-message');
	if (!wrap) {
		wrap = document.createElement('div');
		wrap.setAttribute('class', 'lg-message');
		document.body.appendChild(wrap);
	}
	return wrap as HTMLElement;
};

const info = (options: IConfigs | string) => {
	if (typeof options === 'string') {
		options = { message: options };
	}
	const wrap = renderWrap();
	const divs = document.createElement('div');
	divs.setAttribute('class', 'lg-message__wrapper');
	wrap.appendChild(divs);

	// React 19 使用 createRoot 替代 ReactDom.render
	const root = createRoot(divs);
	root.render(<Message rootDom={wrap} parentDom={divs} config={options} />);

	// 返回清理函数
	return () => {
		root.unmount(); // React 19 的清理方式
		wrap?.removeChild(divs);
	};
};

export default {
	info
};
