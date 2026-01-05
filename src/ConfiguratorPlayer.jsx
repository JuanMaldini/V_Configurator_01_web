import "./App.css";
import SidebarLayout from "./components/sidebar/Sidebar";
import { useEffect } from "react";
import { configureE3dsBridge } from "./components/eagle3dstreaming-websdk/e3dsBridge";

function ConfiguratorPlayer() {
  useEffect(() => {
    configureE3dsBridge({
      iframeId: "iframe_1",
      iframeSrc: import.meta.env.VITE_SRC_IFRAME_URL,
    });
  }, []);

  return (
    <div className="rooot">
      <SidebarLayout>
        <iframe
          className="player-frame"
          style={{ visibility: "visible" }}
          id="iframe_1"
          src={import.meta.env.VITE_SRC_IFRAME_URL}
          height="100%"
          width="100%"
          allowFullScreen
          title="host"
        ></iframe>
      </SidebarLayout>
    </div>
  );
}

export default ConfiguratorPlayer;
