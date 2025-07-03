import { useNavigate } from "react-router";
import "./index.less";
import x404_src from "./images/404.webp";

export default function Page() {
  const navigate = useNavigate();
  return (
    <div className="not-found-page">
      <img src={x404_src} alt="404 缺省图" className="__img" />
      <div className="__tips">
        <div className="__title">找不到页面</div>
        <div className="__desc">抱歉，您访问的页面不存在</div>
      </div>
      <div className="__btn" onClick={() => navigate("/", { replace: true })}>
        返回首页
      </div>
    </div>
  );
}
