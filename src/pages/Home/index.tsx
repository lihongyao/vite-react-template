import './index.less';
import { useMount } from 'ahooks';
import { useNavigate } from 'react-router';

export default function Page() {
	const navigate = useNavigate();

	useMount(() => {
		document.title = '首页';
	});

	return (
		<div className="tab-page">
			<div className="coming-soon">Demo Example</div>
			<button
				className="block mx-auto mt-20 text-20 px-20"
				onClick={() => {
					navigate('/auth/jump', { replace: true });
				}}
			>
				前往授权
			</button>
		</div>
	);
}
