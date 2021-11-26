/*
 * @Author: Lee
 * @Date: 2021-09-01 09:24:26
 * @LastEditors: Lee
 * @LastEditTime: 2021-11-13 16:31:57
 */
import Toast from '@/components/@lgs-react/Toast';
import WXLib from '@/utils/weixin-lib';
import Cookie from 'lg-cookie';
import Tools from 'lg-tools';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface QueryProps {
  from: string;
  code: string;
  state: string;
}

const Auth: React.FC = () => {
  const { type } = useParams();
  const { from, code, state } = Tools.query<QueryProps>();
  const navigate = useNavigate();

  // methods
  const jump = () => {
    // -- 拉起授权
    WXLib.auth({
      appid: import.meta.env.VITE_APP_APPID_WEIXIN,
      state: from ? (from as string) : undefined,
      base: import.meta.env.VITE_APP_BASE,
    });
  };
  const callback = () => {
    // 提示信息
    Toast.loading('加载中');
    // 每次授权回调的时候重新记录下这个路由（微信回调过来时相当于项目重新加载了）
    window.CONFIG_URL_FOR_IOS = window.location.href;
    // -- 调用微信后置接口 -- 执行登录操作等
    setTimeout(() => {
      Toast.hide();
      // 1. 保存Token
      Cookie.set('AUTHORIZATION_TOKEN', '123');
      // 2. 处理跳转
      if (state) {
        navigate(decodeURIComponent(state as string), { replace: true });
      } else {
        navigate('/index', { replace: true });
      }
    }, 1000);
  };

  // effects
  useEffect(() => {
    switch (type) {
      case 'jump':
        jump();
        break;
      case 'callback':
        callback();
        break;
      default:
    }
  }, []);

  return <></>;
};

export default Auth;
