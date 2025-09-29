import "./App.css";

function ConfiguratorPlayer() {
  return (
    <div className="rooot">
      <iframe id="vagonFrame"
      style={{ visibility: 'visible', height: '100%', width: '100%', border: 'none' }}
      allow="microphone  *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *;"
      src="https://streams.vagon.io/streams/156f3fce-185f-4bf9-9bc8-592352434fcd "/>
    </div>
  );
}

export default ConfiguratorPlayer;