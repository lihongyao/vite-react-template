import { memo } from 'react';
import { NavLink, useLocation } from 'react-router';
import './index.less';

const paths = [
	{
		path: '/',
		text: '首页',
		iconPath: new URL('./images/icon_tab_1.png', import.meta.url),
		selectedIconPath: new URL('./images/icon_tab_1_sel.png', import.meta.url)
	},
	{
		path: '/privilege-brand',
		text: '权益',
		iconPath: new URL('./images/icon_tab_2.png', import.meta.url),
		selectedIconPath: new URL('./images/icon_tab_2_sel.png', import.meta.url)
	},
	{
		path: '/integral',
		text: '攒积分',
		iconPath: new URL('./images/icon_tab_3.png', import.meta.url),
		selectedIconPath: new URL('./images/icon_tab_3_sel.png', import.meta.url)
	},
	{
		path: '/mine',
		text: '我的',
		iconPath: new URL('./images/icon_tab_4.png', import.meta.url),
		selectedIconPath: new URL('./images/icon_tab_4_sel.png', import.meta.url)
	}
];
export default memo(function TabBar() {
	const { pathname } = useLocation();
	return (
		<div className="lg-tab-bar">
			{paths.map((v) => (
				<NavLink className="lg-tab-bar__item" key={v.path} to={v.path} replace>
					{pathname === v.path ? (
						<img className="icon" src={v.selectedIconPath.toString()} alt="" />
					) : (
						<img className="icon" src={v.iconPath.toString()} alt="" />
					)}
					<span className="text">{v.text}</span>
				</NavLink>
			))}
		</div>
	);
});
