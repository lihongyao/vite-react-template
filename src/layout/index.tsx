import TabBar from '@/components/@lgs-react/TabBar';
import { Outlet } from 'react-router';
export default function Layout() {
	return (
		<>
			{/* 视图容器，类似于vue中的 router-view */}
			<Outlet />
			{/* 标签栏 */}
			<TabBar />
		</>
	);
}
