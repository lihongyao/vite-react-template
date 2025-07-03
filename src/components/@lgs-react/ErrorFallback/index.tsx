import { useNavigate } from "react-router";
import "./index.less";
import error_src from "./error.webp";
export default function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const navigate = useNavigate();
  console.log(error);
  return (
    <div className="error-page">
      <img src={error_src} alt="404 缺省图" className="__img" />
      <div className="__tips">当前网络不稳定，请刷新再试</div>
      <div className="__btn-box">
        <div className="__btn refresh" onClick={resetErrorBoundary}>
          刷新页面
        </div>
        <div className="__btn goback" onClick={() => navigate("/", { replace: true })}>
          返回首页
        </div>
      </div>
    </div>
  );
}
