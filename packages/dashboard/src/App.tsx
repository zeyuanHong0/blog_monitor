import { RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";

import router from "@/router";
import AntdConfig from "@/theme/antd";

function App() {
  return (
    <AntdConfig>
      <AntdApp style={{ height: "100%" }}>
        <RouterProvider router={router} />
      </AntdApp>
    </AntdConfig>
  );
}

export default App;
