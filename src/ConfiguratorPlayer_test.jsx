import "./App.css";
import { useEffect, useMemo, useRef } from "react";
import {
  createE3dsCommandRouter,
  connectE3dsWindowBridge,
} from "./components/eagle3dstreaming-websdk/e3dsBridge";
import { e3dsPdfCommandHandlers } from "./components/pdf/PdfDocument";

function ConfiguratorPlayerTest() {
  const iframeRef = useRef(null);

  const routeCommand = useMemo(
    () => createE3dsCommandRouter(e3dsPdfCommandHandlers),
    []
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let origin;
    try {
      origin = new URL(import.meta.env.VITE_SRC_IFRAME_URL_TEST).origin;
    } catch {
      origin = undefined;
    }

    return connectE3dsWindowBridge({
      iframe,
      routeCommand,
      allowedOrigins: origin ? [origin] : "*",
    });
  }, [routeCommand]);

  return (
    <div className="rooot">
      <iframe
        className="player-frame"
        style={{ visibility: "visible" }}
        id="iframe_1"
        ref={iframeRef}
        src={import.meta.env.VITE_SRC_IFRAME_URL_TEST}
        height="100%"
        width="100%"
        allowFullScreen
        title="host"
      ></iframe>
    </div>
  );
}

export default ConfiguratorPlayerTest;
