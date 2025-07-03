import Loading from "@/components/@lgs-react/Loading";
import { useMount } from "ahooks";
import { Button, Space } from "antd-mobile";

export default function Page() {
  useMount(() => {
    document.title = "攒积分";
  });

  return (
    <div className="tab-page">
      <div className="coming-soon">Demo Example</div>
      <Loading tips="加载中" color="blue" />
      <div className="flex justify-center  mt-10">
        <Space wrap>
          <Button color="primary">Primary</Button>
          <Button color="success">Success</Button>
          <Button color="danger">Danger</Button>
        </Space>
      </div>
    </div>
  );
}
