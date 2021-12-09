/*
 * @Author: Lee
 * @Date: 2021-09-02 10:23:27
 * @LastEditors: Lee
 * @LastEditTime: 2021-09-02 10:30:15
 */

import Cookie from "lg-cookie";
import React from "react";
import { Redirect, Route, useHistory } from "react-router";

export interface PrivateRouteProps {
  component: any;
}
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const history = useHistory();
  const token = Cookie.get<string>("AUTHORIZATION_TOKEN");
  return (
    <Route
      {...rest}
      render={(props) => {
        const isLoggedIn = true;
        return isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={"/login"} />
        );
      }}
    />
  );
};
