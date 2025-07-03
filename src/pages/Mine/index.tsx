import { Link } from "react-router";
import "./index.less";
import { useMount } from "ahooks";
export default function Page() {
  useMount(() => {
    document.title = "个人中心";
  });
  return (
    <div className="tab-page">
      <div className="coming-soon">Demo Example</div>
      <div className="text-center text-20 mt-20">
        <Link to="/download">Go Download</Link>
      </div>
    </div>
  );
}
