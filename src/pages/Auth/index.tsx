import useToast from "@/components/@lgs-react/Toast";
import LibForWeixin from "@/utils/LibForWeixin";
import Cookie from "@likg/cookie";
import Tools from "@likg/tools";
import { useMount } from "ahooks";
import { Toast } from "antd-mobile";
import { useNavigate, useParams } from "react-router";

interface QueryProps {
  from: string;
  code: string;
  state: string;
}

export default function Page() {
  const { type } = useParams();
  const { from, code, state } = Tools.query<QueryProps>();
  const navigate = useNavigate();

  // methods
  const jump = () => {
    // -- 拉起授权
    LibForWeixin.auth({
      appid: import.meta.env.VITE_APP_APPID_WEIXIN,
      state: from ? (from as string) : undefined,
      base: import.meta.env.VITE_APP_BASE,
    });
  };

  const callback = () => {
    console.log("授权回调 code = ", code);
    // 提示信息
    Toast.show({ icon: "loading", content: "处理中" });
    // 每次授权回调的时候重新记录下这个路由（微信回调过来时相当于项目重新加载了）
    window.CONFIG_URL_FOR_IOS = window.location.href;
    // -- 调用微信后置接口 -- 执行登录操作等
    setTimeout(() => {
      Toast.clear();
      // 1. 保存Token
      Cookie.set("AUTHORIZATION_TOKEN", "123");
      // 2. 处理跳转
      if (state) {
        navigate(decodeURIComponent(state as string), { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 1000);
  };

  // effects
  useMount(() => {
    switch (type) {
      case "jump":
        jump();
        break;
      case "callback":
        callback();
        break;
      default:
    }
  });
  return <></>;
}
