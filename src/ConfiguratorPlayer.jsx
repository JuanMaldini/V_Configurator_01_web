import "./App.css";
import SidebarLayout from "./components/sidebar/Sidebar";

function ConfiguratorPlayer() {
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
