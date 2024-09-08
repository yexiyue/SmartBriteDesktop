import { Button } from "@nextui-org/button";
import { Result } from "antd";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在。"
      extra={
        <Button
          color="primary"
          onPress={() => {
            navigate("/devices");
          }}
        >
          返回主页
        </Button>
      }
    />
  );
};
