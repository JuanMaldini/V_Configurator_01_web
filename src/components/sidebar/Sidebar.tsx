import { useState, type ReactNode } from "react";
import Sidebar from "react-sidebar";
import { emitDescriptor } from "../eagle3dstreaming-websdk/e3dsBridge";
import { generateAndOpenPdf } from "../pdf/generateAndOpenPdf";
import { SketchTintPicker } from "../coloring/SketchTintPicker";
import "./Sidebar.css";

const dropEnviroments = ["Space 01", "Space 02", "Space 03"];

interface SidebarLayoutProps {
  children: ReactNode;
}

function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isTintOpen, setIsTintOpen] = useState(false);
  const [tintHex, setTintHex] = useState("#ffffff");

  const handleGeneratePdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generateAndOpenPdf({
        title: "Configurator Export (A4)",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Sidebar
      sidebar={
        <nav className="sidebar-panel">
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <button
                type="button"
                className="sidebar-item"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? "Generating PDF…" : "PDF"}
              </button>
            </li>

            <li className="sidebar-item">
              <button
                type="button"
                className="sidebar-item"
                onClick={() => setIsTintOpen((prev) => !prev)}
              >
                Tint
              </button>

              {isTintOpen ? (
                <div style={{ marginTop: 8 }}>
                  <SketchTintPicker hex={tintHex} onHexChange={setTintHex} />
                </div>
              ) : null}
            </li>

            <li className="sidebar-item">
              <button
                type="button"
                className="sidebar-item"
                onClick={() => emitDescriptor({ field: "Render" })}
              >
                Render
              </button>
            </li>

            <li className="sidebar-item">
              <details>
                <summary className="sidebar-item">Enviroments</summary>
                <ul className="sidebar-list">
                  {dropEnviroments.map((env) => (
                    <li key={env} className="sidebar-item">
                      <button
                        type="button"
                        className="sidebar-item"
                        onClick={() => emitDescriptor({ field: env })}
                      >
                        {env}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
        </nav>
      }
      open
      docked
      pullRight
      touch={false}
      shadow={true}
      transitions={true}
      onSetOpen={() => {}}
      rootClassName="sidebar-root"
      sidebarClassName="sidebar-shell"
      contentClassName="sidebar-content"
      overlayClassName="sidebar-overlay"
    >
      <div className="sidebar-content">{children}</div>
    </Sidebar>
  );
}

export default SidebarLayout;
