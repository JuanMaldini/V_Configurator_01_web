import "./App.css";
import { useEffect, useMemo, useRef } from "react";
import {
  addE3dsUeMessageListener,
  configureE3dsBridge,
} from "./components/eagle3dstreaming-websdk/e3dsBridge";
import { generateAndOpenPdf } from "./components/pdf/generateAndOpenPdf";
import { createE3dsCommandRouter } from "./components/eagle3dstreaming-websdk/e3dsCommandRouter";

function ConfiguratorPlayer() {
  const isGeneratingPdfRef = useRef(false);

  const routeCommand = useMemo(
    () =>
      createE3dsCommandRouter({
        makepdf: async () => {
          if (isGeneratingPdfRef.current) return;
          isGeneratingPdfRef.current = true;
          try {
            await generateAndOpenPdf({
              title: "Configurator Export (A4)",
            });
          } finally {
            isGeneratingPdfRef.current = false;
          }
        },
      }),
    []
  );

  useEffect(() => {
    configureE3dsBridge({
      iframeId: "iframe_1",
      iframeSrc: import.meta.env.VITE_SRC_IFRAME_URL,
    });
  }, []);

  useEffect(() => {
    return addE3dsUeMessageListener((message) => {
      routeCommand(message);
    });
  }, [routeCommand]);

  return (
    <div className="rooot">
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
    </div>
  );
}

export default ConfiguratorPlayer;
