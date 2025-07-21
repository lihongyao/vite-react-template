import AddressPicker, { type AddressPickerDataProps } from '@/components/@lgs-react/AddressPicker';
import Alert from '@/components/@lgs-react/Alert';
import CityPicker from '@/components/@lgs-react/CityPicker';
import Dialog from '@/components/@lgs-react/Dialog';
import DragView from '@/components/@lgs-react/DragView';
import Loading from '@/components/@lgs-react/Loading';
import LoadingWithLogo from '@/components/@lgs-react/LoadingWithLogo';
import Message from '@/components/@lgs-react/Message';
import NoData from '@/components/@lgs-react/NoData';
import { useMount } from 'ahooks';
import { Button } from 'antd-mobile';
import { useState } from 'react';

export default function Page() {
	const [openPickerAddress, setOpenPickerAddress] = useState(false);
	const [openPickerCity, setOpenPickerCity] = useState(false);
	const [openDialog, setOpenDialog] = useState(false);
	useMount(() => {
		document.title = '攒积分';
	});

	return (
		<div className="tab-page">
			<div className="coming-soon">Demo Example</div>
			<LoadingWithLogo />
			<Loading tips="加载中" color="blue" />
			<div className="px-10 flex justify-center gap-10 mt-10">
				<Button color="primary">Primary</Button>
				<Button color="success">Success</Button>
				<Button color="danger">Danger</Button>
			</div>
			<div className="px-10 flex justify-center flex-wrap gap-10 mt-10">
				<Button
					onClick={() => {
						Alert.info({
							title: '温馨提示',
							message: '您确定要要退出登录吗？',
							showCancel: true,
							cancelButtonText: '点错了',
							align: 'center',
							onSure: () => {
								console.log('sure');
							},
							onCancel: () => {
								console.log('cancel');
							}
						});
					}}
				>
					Alert
				</Button>
				<Button onClick={() => setOpenPickerAddress(true)}>AddressPicker</Button>
				<Button onClick={() => setOpenPickerCity(true)}>CityPicker</Button>
				<Button onClick={() => setOpenDialog(true)}>Dialog</Button>
				<Button
					onClick={() => {
						Message.info({
							message: '您确定要要退出登录吗？'
						});
					}}
				>
					Message
				</Button>
			</div>

			<NoData tips="暂无数据" />

			<DragView>
				<Button color="primary">Drag</Button>
			</DragView>
			<AddressPicker
				open={openPickerAddress}
				onFetch={async (code: string) => {
					console.log(code);
					return [{ code: '1', name: '四川省' }];
				}}
				onSure={async (data: AddressPickerDataProps) => {
					console.log(data);
				}}
				onCancel={setOpenPickerAddress}
			/>
			<CityPicker
				open={openPickerCity}
				onCancel={setOpenPickerCity}
				onChange={(value) => {
					console.log(value);
				}}
			/>
			<Dialog open={openDialog} onCancel={setOpenDialog} closeButtonPosition="bottom">
				<div className="text-center">我是自定义弹框</div>
			</Dialog>
		</div>
	);
}
