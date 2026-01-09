import "./App.css";
import { useMemo } from "react";
import {
  createE3dsCommandRouter,
} from "./components/eagle3dstreaming-websdk/e3dsBridge";
import { e3dsPdfCommandHandlers } from "./components/pdf/PdfDocument";

function ConfiguratorPlayerTest() {
  const routeCommand = useMemo(
    () => createE3dsCommandRouter(e3dsPdfCommandHandlers),
    []
  );

  return (
    <div className="rooot">
      <iframe
        className="player-frame"
        style={{ visibility: "visible" }}
        id="iframe_1"
        src={import.meta.env.SRC_IFRAME_URL_TEST}
        height="100%"
        width="100%"
        allowFullScreen
        title="host"
      ></iframe>
    </div>
  );
}

export default ConfiguratorPlayerTest;