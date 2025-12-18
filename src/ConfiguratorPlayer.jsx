import "./App.css";

function ConfiguratorPlayer() {
  return (
    <div className="rooot">
      <iframe
      style={{ visibility: 'visible', border: 'none' }}
      id='iframe_1'
      src={import.meta.env.VITE_SRC_IFRAME_URL}
      height='100%'
      width='100%'
      allowfullscreen
      title='host'
      ></iframe>
    </div>
  );
}

export default ConfiguratorPlayer;