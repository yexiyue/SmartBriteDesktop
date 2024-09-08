import { Button, Result } from "antd";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export const ErrorBoundary = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Result
          status="error"
          title={`${error.status} ${error.statusText}`}
          subTitle={error.status === 404 ? "未找到该页面" : "未知错误"}
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => {
                navigate("/");
              }}
            >
              返回首页
            </Button>,
          ]}
        ></Result>
      </div>
    );
  } else {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Result
          status="error"
          title={"未知错误"}
          subTitle={error.message}
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => {
                navigate("/devices");
              }}
            >
              返回首页
            </Button>,
          ]}
        ></Result>
      </div>
    );
  }
};
