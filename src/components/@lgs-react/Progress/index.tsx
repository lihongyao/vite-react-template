import { memo } from 'react';
import './index.less';

export type NodeType = {
	percent: number;
	icon: any;
	tips: string;
};

interface IProps {
	showInfo?: boolean /** 是否显示进度数值或状态图标 */;
	percent?: number /** 当前值的百分比 */;
	strokeColor?: string /** 进度条的色彩 */;
	trailColor?: string /** 未完成的分段的颜色 */;
	nodes?: NodeType[] /** 节点信息 */;
}

export default memo(function Progress(props: IProps) {
	const {
		percent = 0,
		showInfo = false,
		trailColor = '#E2E2E2',
		strokeColor = '#FF9B19'
	} = props;

	return (
		<div className="lg-progress">
			{/* 进度 */}
			<div
				className="lg-progress__bg"
				style={{
					background: trailColor
				}}
			>
				{/* 当前值 */}
				<div
					className="lg-progress__cur"
					style={{
						width: percent <= 0 ? 0 : (percent >= 100 ? 100 : percent) + '%',
						background: strokeColor
					}}
				/>
				{/* 节点信息 */}
				{props.nodes &&
					props.nodes.map((node, i) => (
						<section
							key={`lg-progress__node__${i}`}
							className="lg-progress__node"
							data-tips={node.tips}
							style={(() => {
								if (node.percent <= 0) {
									return {
										left: 0
									};
								} else if (node.percent >= 100) {
									return {
										right: 0
									};
								} else {
									return {
										left: node.percent + '%',
										transform: 'translate(-50%, -50%)'
									};
								}
							})()}
						>
							<img src={node.icon} className="lg-progress__icon" />
						</section>
					))}
			</div>
			{/* 文案 */}
			{showInfo && <div className="lg-progress__tips">{percent + '%'}</div>}
		</div>
	);
});
